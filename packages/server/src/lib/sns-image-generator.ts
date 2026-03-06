import { getCredentials } from '../services/credential-vault'

type DalleResponse = {
  data?: Array<{ url?: string; revised_prompt?: string }>
  error?: { message?: string }
}

type ImageGenerationResult = {
  imageUrl: string | null
  error?: string
}

export async function generateSnsImage(
  prompt: string,
  companyId: string,
): Promise<ImageGenerationResult> {
  if (!prompt) {
    return { imageUrl: null, error: '이미지 설명(prompt)이 필요합니다.' }
  }

  if (prompt.length > 4000) {
    return { imageUrl: null, error: '프롬프트가 너무 깁니다. 4000자 이내로 입력하세요.' }
  }

  let creds: Record<string, string>
  try {
    creds = await getCredentials(companyId, 'openai')
  } catch {
    return { imageUrl: null, error: 'OpenAI API 키가 등록되지 않았습니다. 설정에서 등록하세요.' }
  }

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
        size: '1024x1024',
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      let errMsg = String(res.status)
      try {
        const errData = (await res.json()) as DalleResponse
        errMsg = errData.error?.message || errMsg
      } catch { /* JSON 파싱 실패 시 status code 사용 */ }
      return { imageUrl: null, error: `OpenAI 오류: ${errMsg}` }
    }

    const data = (await res.json()) as DalleResponse
    const image = data.data?.[0]

    if (!image?.url) {
      return { imageUrl: null, error: '이미지 URL이 반환되지 않았습니다.' }
    }

    return { imageUrl: image.url }
  } catch (err) {
    return {
      imageUrl: null,
      error: `이미지 생성 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    }
  }
}
