import type { ToolHandler } from '../types'

type DalleResponse = {
  data?: Array<{ url?: string; revised_prompt?: string }>
  error?: { message?: string }
}

export const generateImage: ToolHandler = async (input, ctx) => {
  const prompt = String(input.prompt || '')
  if (!prompt) return JSON.stringify({ success: false, message: '이미지 설명(prompt)이 필요합니다.' })

  if (prompt.length > 4000) {
    return JSON.stringify({ success: false, message: '프롬프트가 너무 깁니다. 4000자 이내로 입력하세요.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('openai')
  } catch {
    return JSON.stringify({ success: false, message: 'OpenAI API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  const size = String(input.size || '1024x1024')

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const errData = (await res.json()) as DalleResponse
      return JSON.stringify({ success: false, message: `OpenAI 오류: ${errData.error?.message || res.status}` })
    }

    const data = (await res.json()) as DalleResponse
    const image = data.data?.[0]

    return JSON.stringify({
      success: true,
      message: '이미지가 생성되었습니다.',
      imageUrl: image?.url,
      revisedPrompt: image?.revised_prompt,
      size,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `이미지 생성 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
