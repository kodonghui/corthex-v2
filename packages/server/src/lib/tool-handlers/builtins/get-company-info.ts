import type { ToolHandler } from '../types'

export const getCompanyInfo: ToolHandler = (_input, ctx) => {
  return JSON.stringify({
    companyId: ctx.companyId,
    message: '회사 상세 정보는 관리자 권한이 필요합니다.',
  })
}
