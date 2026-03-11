/**
 * NotebookLM MCP Bridge 타입 정의
 *
 * Python notebooklm-py 라이브러리와 TypeScript 간 통신 규약
 */

export type NotebookLMAction =
  | 'create_notebook'
  | 'add_source'
  | 'generate_audio'
  | 'get_mindmap'
  | 'create_slides'
  | 'summarize'

export type NotebookLMSource = {
  type: 'text' | 'url' | 'file' | 'notebook'
  content: string
  title?: string
}

export type NotebookLMRequest = {
  action: NotebookLMAction
  sources: NotebookLMSource[]
  options?: Record<string, unknown>
  credentials: { googleToken: string }
}

export type NotebookLMResponse = {
  success: boolean
  notebookId?: string
  outputUrl?: string
  outputData?: unknown
  error?: string
}
