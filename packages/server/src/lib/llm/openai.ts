import OpenAI from 'openai'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMToolCall, LLMError } from '@corthex/shared'
import type { LLMProvider } from './types'
import { getModelConfig } from '../../config/models'

const DEFAULT_TIMEOUT = 30_000

export class OpenAIAdapter implements LLMProvider {
  readonly name = 'openai' as const
  readonly supportsBatch = true
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, timeout: DEFAULT_TIMEOUT })
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    try {
      const messages = this.buildMessages(request)

      const params: OpenAI.ChatCompletionCreateParams = {
        model: request.model,
        messages,
        max_completion_tokens: request.maxTokens ?? 4096,
        ...(request.temperature != null && { temperature: request.temperature }),
        ...(request.tools?.length && {
          tools: request.tools.map(t => ({
            type: 'function' as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
        }),
      }

      const response = await this.client.chat.completions.create(params, {
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
      const messages = this.buildMessages(request)

      const params: OpenAI.ChatCompletionCreateParams = {
        model: request.model,
        messages,
        max_completion_tokens: request.maxTokens ?? 4096,
        stream: true,
        stream_options: { include_usage: true },
        ...(request.temperature != null && { temperature: request.temperature }),
        ...(request.tools?.length && {
          tools: request.tools.map(t => ({
            type: 'function' as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
        }),
      }

      const stream = await this.client.chat.completions.create(params, {
        signal: controller.signal,
      })

      for await (const chunk of stream as AsyncIterable<OpenAI.ChatCompletionChunk>) {
        const delta = chunk.choices?.[0]?.delta
        if (!delta) {
          if (chunk.usage) {
            yield {
              type: 'done',
              usage: {
                inputTokens: chunk.usage.prompt_tokens,
                outputTokens: chunk.usage.completion_tokens,
              },
            }
          }
          continue
        }

        if (delta.content) {
          yield { type: 'text', content: delta.content }
        }

        if (delta.tool_calls?.length) {
          for (const tc of delta.tool_calls) {
            if (tc.id && tc.function?.name) {
              yield {
                type: 'tool_call_start',
                toolCall: { id: tc.id, name: tc.function.name },
              }
            }
            if (tc.function?.arguments) {
              yield { type: 'tool_call_delta', content: tc.function.arguments }
            }
          }
        }
      }
    } catch (err) {
      throw this.normalizeError(err)
    } finally {
      clearTimeout(timer)
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const config = getModelConfig(model)
    const inputPrice = config?.inputPricePer1M ?? 2.5
    const outputPrice = config?.outputPricePer1M ?? 10
    return (inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice
  }

  private buildMessages(request: LLMRequest): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = []

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt })
    }

    for (const msg of request.messages) {
      if (msg.role === 'tool' && msg.toolCallId) {
        messages.push({
          role: 'tool',
          tool_call_id: msg.toolCallId,
          content: msg.content,
        })
      } else if (msg.role === 'assistant' && msg.toolCalls?.length) {
        messages.push({
          role: 'assistant',
          content: msg.content || null,
          tool_calls: msg.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        })
      } else {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      }
    }

    return messages
  }

  private parseResponse(response: OpenAI.ChatCompletion, model: string): LLMResponse {
    const choice = response.choices[0]
    const message = choice?.message

    const toolCalls: LLMToolCall[] = (message?.tool_calls ?? [])
      .filter((tc): tc is OpenAI.ChatCompletionMessageToolCall & { type: 'function' } => tc.type === 'function')
      .map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || '{}'),
      }))

    const finishReason = choice?.finish_reason === 'tool_calls' ? 'tool_use' as const
      : choice?.finish_reason === 'length' ? 'max_tokens' as const
      : 'stop' as const

    return {
      content: message?.content ?? '',
      toolCalls,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
      model,
      provider: 'openai',
      finishReason,
    }
  }

  private normalizeError(err: unknown): LLMError {
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) return { provider: 'openai', code: 'auth_error', message: err.message, retryable: false }
      if (err.status === 429) return { provider: 'openai', code: 'rate_limit', message: err.message, retryable: true }
      if (err.status >= 500) return { provider: 'openai', code: 'server_error', message: err.message, retryable: true }
      return { provider: 'openai', code: 'invalid_request', message: err.message, retryable: false }
    }
    if (err instanceof Error && err.name === 'AbortError') {
      return { provider: 'openai', code: 'timeout', message: 'Request timed out (30s)', retryable: true }
    }
    return { provider: 'openai', code: 'unknown', message: String(err), retryable: false }
  }
}
