import { registry } from './registry'
import { getCurrentTime } from './builtins/get-current-time'
import { calculate } from './builtins/calculate'
import { searchDepartmentKnowledge } from './builtins/search-department-knowledge'
import { getCompanyInfo } from './builtins/get-company-info'
import { searchWeb } from './builtins/search-web'
import { searchNews } from './builtins/search-news'
import { searchImages } from './builtins/search-images'
import { searchYoutube } from './builtins/search-youtube'
import { searchPlaces } from './builtins/search-places'
import { sendEmailTool } from './builtins/send-email'
import { listCalendarEvents } from './builtins/list-calendar-events'
import { createCalendarEvent } from './builtins/create-calendar-event'
import { createReport } from './builtins/create-report'

// 내장 핸들러 등록
registry.register('get_current_time', getCurrentTime)
registry.register('calculate', calculate)
registry.register('search_department_knowledge', searchDepartmentKnowledge)
registry.register('get_company_info', getCompanyInfo)
registry.register('search_web', searchWeb)
registry.register('search_news', searchNews)
registry.register('search_images', searchImages)
registry.register('search_youtube', searchYoutube)
registry.register('search_places', searchPlaces)
registry.register('send_email', sendEmailTool)
registry.register('list_calendar_events', listCalendarEvents)
registry.register('create_calendar_event', createCalendarEvent)
registry.register('create_report', createReport)

export { registry } from './registry'
export type { ToolHandler, ToolExecContext } from './types'
