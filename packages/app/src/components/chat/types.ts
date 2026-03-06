export type Agent = {
  id: string
  name: string
  role: string
  status: 'online' | 'working' | 'error' | 'offline'
  isSecretary: boolean
}

export type Session = {
  id: string
  agentId: string
  title: string
  lastMessageAt: string | null
  createdAt: string
}

export type FileAttachment = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
}

export type Message = {
  id: string
  sender: 'user' | 'agent'
  content: string
  attachmentIds?: string[]
  attachments?: FileAttachment[]
  createdAt: string
}

export type SavedToolCall = {
  id: string
  toolName: string
  input: unknown
  output: string | null
  status: string
  durationMs: number | null
  createdAt: string
}

export type Delegation = {
  id: string
  targetAgentName: string
  delegationPrompt: string
  agentResponse: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
}
