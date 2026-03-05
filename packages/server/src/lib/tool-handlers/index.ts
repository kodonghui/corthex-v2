import { registry } from './registry'
import { getCurrentTime } from './builtins/get-current-time'
import { calculate } from './builtins/calculate'
import { searchDepartmentKnowledge } from './builtins/search-department-knowledge'
import { getCompanyInfo } from './builtins/get-company-info'
import { searchWeb } from './builtins/search-web'
import { createReport } from './builtins/create-report'

// 내장 핸들러 등록
registry.register('get_current_time', getCurrentTime)
registry.register('calculate', calculate)
registry.register('search_department_knowledge', searchDepartmentKnowledge)
registry.register('get_company_info', getCompanyInfo)
registry.register('search_web', searchWeb)
registry.register('create_report', createReport)

export { registry } from './registry'
export type { ToolHandler, ToolExecContext } from './types'
