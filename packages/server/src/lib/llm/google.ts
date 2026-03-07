import { GoogleGenerativeAI, GoogleGenerativeAIAbortError, type GenerateContentResult, type Content, type Part, type FunctionDeclaration, SchemaType } from '@google/generative-ai'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMToolCall, LLMError } from '@corthex/shared'
import type { LLMProvider } from './types'
import { getModelConfig } from '../../config/models'

const DEFAULT_TIMEOUT = 30_000

export class GoogleAdapter implements LLMProvider {
  readonly name = 'google' as const
  readonly supportsBatch = false
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: request.model,
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 4096,
          ...(request.temperature != null && { temperature: request.temperature }),
        },
        ...(request.systemPrompt && { systemInstruction: request.systemPrompt }),
        ...(request.tools?.length && {
          tools: [{
            functionDeclarations: request.tools.map(t => this.toFunctionDeclaration(t)),
          }],
        }),
      })

      const contents = this.buildContents(request)

      const result: GenerateContentResult = await model.generateContent({
        contents,
      }, { timeout: DEFAULT_TIMEOUT })

      return this.parseResponse(result, request.model)
    } catch (err) {
      throw this.normalizeError(err)
    }
  }

  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: request.model,
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 4096,
          ...(request.temperature != null && { temperature: request.temperature }),
        },
        ...(request.systemPrompt && { systemInstruction: request.systemPrompt }),
        ...(request.tools?.length && {
          tools: [{
            functionDeclarations: request.tools.map(t => this.toFunctionDeclaration(t)),
          }],
        }),
      })

      const contents = this.buildContents(request)

      const result = await model.generateContentStream({
        contents,
      }, { timeout: DEFAULT_TIMEOUT })

      let totalOutputTokens = 0

      for await (const chunk of result.stream) {
        const text = chunk.text?.()
        if (text) {
          yield { type: 'text', content: text }
        }

        const candidates = chunk.candidates
        if (candidates?.[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.functionCall) {
              yield {
                type: 'tool_call_start',
                toolCall: {
                  id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                  name: part.functionCall.name,
                  arguments: (part.functionCall.args ?? {}) as Record<string, unknown>,
                },
              }
            }
          }
        }

        if (chunk.usageMetadata) {
          totalOutputTokens = chunk.usageMetadata.candidatesTokenCount ?? 0
        }
      }

      const finalResponse = await result.response
      const usage = finalResponse.usageMetadata

      yield {
        type: 'done',
        usage: {
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: usage?.candidatesTokenCount ?? totalOutputTokens,
        },
      }
    } catch (err) {
      throw this.normalizeError(err)
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const config = getModelConfig(model)
    const inputPrice = config?.inputPricePer1M ?? 1.25
    const outputPrice = config?.outputPricePer1M ?? 10
    return (inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice
  }

  private buildContents(request: LLMRequest): Content[] {
    const contents: Content[] = []

    for (const msg of request.messages) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] })
      } else if (msg.role === 'assistant') {
        const parts: Part[] = []
        if (msg.content) parts.push({ text: msg.content })
        if (msg.toolCalls?.length) {
          for (const tc of msg.toolCalls) {
            parts.push({ functionCall: { name: tc.name, args: tc.arguments } })
          }
        }
        contents.push({ role: 'model', parts })
      } else if (msg.role === 'tool' && msg.toolCallId) {
        // Google expects function name in functionResponse.name, but LLMMessage only has toolCallId.
        // Caller must set toolCallId to the function name for Google compatibility (LLMRouter handles this).
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.toolCallId,
              response: { result: msg.content },
            },
          }],
        })
      }
    }

    return contents
  }

  private toFunctionDeclaration(tool: { name: string; description: string; parameters: Record<string, unknown> }): FunctionDeclaration {
    return {
      name: tool.name,
      description: tool.description,
      parameters: this.convertJsonSchemaToGemini(tool.parameters) as unknown as FunctionDeclaration['parameters'],
    }
  }

  private convertJsonSchemaToGemini(schema: Record<string, unknown>): Record<string, unknown> {
    // Convert JSON Schema to Gemini's expected format
    const result: Record<string, unknown> = {}

    if (schema.type === 'object') {
      result.type = SchemaType.OBJECT
      if (schema.properties) {
        const props: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(schema.properties as Record<string, Record<string, unknown>>)) {
          props[key] = this.convertJsonSchemaToGemini(value)
        }
        result.properties = props
      }
      if (schema.required) result.required = schema.required
    } else if (schema.type === 'string') {
      result.type = SchemaType.STRING
      if (schema.description) result.description = schema.description
    } else if (schema.type === 'number' || schema.type === 'integer') {
      result.type = SchemaType.NUMBER
      if (schema.description) result.description = schema.description
    } else if (schema.type === 'boolean') {
      result.type = SchemaType.BOOLEAN
      if (schema.description) result.description = schema.description
    } else if (schema.type === 'array') {
      result.type = SchemaType.ARRAY
      if (schema.items) result.items = this.convertJsonSchemaToGemini(schema.items as Record<string, unknown>)
    }

    if (schema.description && !result.description) result.description = schema.description as string

    return result
  }

  private parseResponse(result: GenerateContentResult, model: string): LLMResponse {
    const response = result.response
    const candidates = response.candidates

    let content = ''
    const toolCalls: LLMToolCall[] = []

    if (candidates?.[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.text) {
          content += part.text
        }
        if (part.functionCall) {
          toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: part.functionCall.name,
            arguments: (part.functionCall.args ?? {}) as Record<string, unknown>,
          })
        }
      }
    }

    const usage = response.usageMetadata

    const finishReason = toolCalls.length > 0 ? 'tool_use' as const
      : candidates?.[0]?.finishReason === 'MAX_TOKENS' ? 'max_tokens' as const
      : 'stop' as const

    return {
      content,
      toolCalls,
      usage: {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      },
      model,
      provider: 'google',
      finishReason,
    }
  }

  private normalizeError(err: unknown): LLMError {
    const message = err instanceof Error ? err.message : String(err)

    if (err instanceof GoogleGenerativeAIAbortError || message.includes('AbortError') || message.includes('timed out') || message.includes('aborted')) {
      return { provider: 'google', code: 'timeout', message: 'Request timed out (30s)', retryable: true }
    }
    if (message.includes('API_KEY') || message.includes('403') || message.includes('401')) {
      return { provider: 'google', code: 'auth_error', message, retryable: false }
    }
    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return { provider: 'google', code: 'rate_limit', message, retryable: true }
    }
    if (message.includes('500') || message.includes('503') || message.includes('INTERNAL')) {
      return { provider: 'google', code: 'server_error', message, retryable: true }
    }
    return { provider: 'google', code: 'unknown', message, retryable: false }
  }
}
