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
import { readNotionPage } from './builtins/read-notion-page'
import { createNotionPage } from './builtins/create-notion-page'
import { generateTextFile } from './builtins/generate-text-file'
import { getStockPrice } from './builtins/get-stock-price'
import { getAccountBalance } from './builtins/get-account-balance'
import { placeStockOrder } from './builtins/place-stock-order'
import { textToSpeech } from './builtins/text-to-speech'
import { generateImage } from './builtins/generate-image'
import { translateText } from './builtins/translate-text'
import { publishInstagram } from './builtins/publish-instagram'
import { getInstagramInsights } from './builtins/get-instagram-insights'
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
registry.register('read_notion_page', readNotionPage)
registry.register('create_notion_page', createNotionPage)
registry.register('generate_text_file', generateTextFile)
registry.register('get_stock_price', getStockPrice)
registry.register('get_account_balance', getAccountBalance)
registry.register('place_stock_order', placeStockOrder)
registry.register('text_to_speech', textToSpeech)
registry.register('generate_image', generateImage)
registry.register('translate_text', translateText)
registry.register('publish_instagram', publishInstagram)
registry.register('get_instagram_insights', getInstagramInsights)
registry.register('create_report', createReport)

export { registry } from './registry'
export type { ToolHandler, ToolExecContext } from './types'
