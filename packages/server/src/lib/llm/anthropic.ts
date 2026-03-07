import Anthropic from '@anthropic-ai/sdk'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMToolCall, LLMError } from '@corthex/shared'
import type { LLMProvider } from './types'
import { getModelConfig } from '../../config/models'

const DEFAULT_TIMEOUT = 30_000

export class AnthropicAdapter implements LLMProvider {
  readonly name = 'anthropic' as const
  readonly supportsBatch = true
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    try {
      const messages = request.messages
        .filter(m => m.role !== 'tool' || m.toolCallId)
        .map(m => this.toAnthropicMessage(m))

      const params: Anthropic.MessageCreateParams = {
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        messages,
        ...(request.systemPrompt && { system: request.systemPrompt }),
        ...(request.temperature != null && { temperature: request.temperature }),
        ...(request.tools?.length && {
          tools: request.tools.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.parameters as Anthropic.Tool.InputSchema,
          })),
        }),
      }

      const response = await this.client.messages.create(params, {
        signal: controller.signal,
      })

      return this.parseResponse(response, request.model)
    } catch (err) {
      throw this.normalizeError(err)
    } finally {
      clearTimeout(timer)
    }
  }

  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    try {
      const messages = request.messages
        .filter(m => m.role !== 'tool' || m.toolCallId)
        .map(m => this.toAnthropicMessage(m))

      const params: Anthropic.MessageCreateParams = {
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        messages,
        stream: true,
        ...(request.systemPrompt && { system: request.systemPrompt }),
        ...(request.temperature != null && { temperature: request.temperature }),
        ...(request.tools?.length && {
          tools: request.tools.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.parameters as Anthropic.Tool.InputSchema,
          })),
        }),
      }

      const stream = this.client.messages.stream(params, {
        signal: controller.signal,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta as unknown as Record<string, unknown>
          if (delta.type === 'text_delta') {
            yield { type: 'text', content: delta.text as string }
          } else if (delta.type === 'input_json_delta') {
            yield { type: 'tool_call_delta', content: delta.partial_json as string }
          }
        } else if (event.type === 'content_block_start') {
          const block = event.content_block as unknown as Record<string, unknown>
          if (block.type === 'tool_use') {
            yield {
              type: 'tool_call_start',
              toolCall: { id: block.id as string, name: block.name as string },
            }
          }
        } else if (event.type === 'message_delta') {
          const usage = (event as unknown as Record<string, unknown>).usage as { output_tokens?: number } | undefined
          if (usage) {
            yield { type: 'done', usage: { inputTokens: 0, outputTokens: usage.output_tokens ?? 0 } }
          }
        }
      }

      const finalMessage = await stream.finalMessage()
      yield {
        type: 'done',
        usage: {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
        },
      }
    } catch (err) {
      throw this.normalizeError(err)
    } finally {
      clearTimeout(timer)
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const config = getModelConfig(model)
    const inputPrice = config?.inputPricePer1M ?? 3
    const outputPrice = config?.outputPricePer1M ?? 15
    return (inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice
  }

  private toAnthropicMessage(msg: { role: string; content: string; toolCallId?: string; toolCalls?: LLMToolCall[] }): Anthropic.MessageParam {
    if (msg.role === 'tool' && msg.toolCallId) {
      return {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: msg.toolCallId,
          content: msg.content,
        }],
      }
    }

    if (msg.role === 'assistant' && msg.toolCalls?.length) {
      const content: Anthropic.ContentBlockParam[] = []
      if (msg.content) content.push({ type: 'text', text: msg.content })
      for (const tc of msg.toolCalls) {
        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: tc.arguments,
        })
      }
      return { role: 'assistant', content }
    }

    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }
  }

  private parseResponse(response: Anthropic.Message, model: string): LLMResponse {
    let content = ''
    const toolCalls: LLMToolCall[] = []

    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        })
      }
    }

    const finishReason = response.stop_reason === 'tool_use' ? 'tool_use' as const
      : response.stop_reason === 'max_tokens' ? 'max_tokens' as const
      : 'stop' as const

    return {
      content,
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model,
      provider: 'anthropic',
      finishReason,
    }
  }

  private normalizeError(err: unknown): LLMError {
    if (err instanceof Anthropic.APIError) {
      if (err.status === 401) return { provider: 'anthropic', code: 'auth_error', message: err.message, retryable: false }
      if (err.status === 429) return { provider: 'anthropic', code: 'rate_limit', message: err.message, retryable: true }
      if (err.status >= 500) return { provider: 'anthropic', code: 'server_error', message: err.message, retryable: true }
      return { provider: 'anthropic', code: 'invalid_request', message: err.message, retryable: false }
    }
    if (err instanceof Error && err.name === 'AbortError') {
      return { provider: 'anthropic', code: 'timeout', message: 'Request timed out (30s)', retryable: true }
    }
    return { provider: 'anthropic', code: 'unknown', message: String(err), retryable: false }
  }
}
