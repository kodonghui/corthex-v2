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
import { spreadsheetTool } from './builtins/spreadsheet-tool'
import { chartGenerator } from './builtins/chart-generator'
import { fileManager } from './builtins/file-manager'
import { dateUtils } from './builtins/date-utils'
import { jsonParser } from './builtins/json-parser'
import { textSummarizer } from './builtins/text-summarizer'
import { urlFetcher } from './builtins/url-fetcher'
import { markdownConverter } from './builtins/markdown-converter'
import { regexMatcher } from './builtins/regex-matcher'
import { unitConverter } from './builtins/unit-converter'
import { randomGenerator } from './builtins/random-generator'
import { sentimentAnalyzer } from './builtins/sentiment-analyzer'
import { companyAnalyzer } from './builtins/company-analyzer'
import { marketOverview } from './builtins/market-overview'
import { lawSearch } from './builtins/law-search'
import { contractReviewer } from './builtins/contract-reviewer'
import { trademarkSimilarity } from './builtins/trademark-similarity'
import { patentSearch } from './builtins/patent-search'
import { uptimeMonitor } from './builtins/uptime-monitor'
import { securityScanner } from './builtins/security-scanner'
import { codeQualityTool } from './builtins/code-quality-tool'
import { dnsLookup } from './builtins/dns-lookup'
import { sslChecker } from './builtins/ssl-checker'

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
registry.register('spreadsheet_tool', spreadsheetTool)
registry.register('chart_generator', chartGenerator)
registry.register('file_manager', fileManager)
registry.register('date_utils', dateUtils)
registry.register('json_parser', jsonParser)
registry.register('text_summarizer', textSummarizer)
registry.register('url_fetcher', urlFetcher)
registry.register('markdown_converter', markdownConverter)
registry.register('regex_matcher', regexMatcher)
registry.register('unit_converter', unitConverter)
registry.register('random_generator', randomGenerator)
registry.register('sentiment_analyzer', sentimentAnalyzer)
registry.register('company_analyzer', companyAnalyzer)
registry.register('market_overview', marketOverview)
registry.register('law_search', lawSearch)
registry.register('contract_reviewer', contractReviewer)
registry.register('trademark_similarity', trademarkSimilarity)
registry.register('patent_search', patentSearch)
registry.register('uptime_monitor', uptimeMonitor)
registry.register('security_scanner', securityScanner)
registry.register('code_quality', codeQualityTool)
registry.register('dns_lookup', dnsLookup)
registry.register('ssl_checker', sslChecker)

export { registry } from './registry'
export type { ToolHandler, ToolExecContext } from './types'
