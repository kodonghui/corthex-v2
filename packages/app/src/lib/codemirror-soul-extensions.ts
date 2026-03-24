/**
 * Story 24.6: CodeMirror extensions for Soul editing (UXR118)
 *
 * - {{variable}} syntax highlighting via ViewPlugin decorations
 * - Autocomplete dropdown triggered on {{ (AR15)
 * - All available variables: 7 built-in + 5 personality_* + relevant_memories
 */

import { ViewPlugin, Decoration, type DecorationSet, type EditorView, type ViewUpdate, MatchDecorator } from '@codemirror/view'
import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'

// === Variable Definitions (AR15) ===

export type SoulVariable = {
  name: string
  label: string
  description: string
  category: 'builtin' | 'personality' | 'memory'
}

export const SOUL_VARIABLES: SoulVariable[] = [
  // Built-in (7)
  { name: 'agent_list', label: '에이전트 목록', description: 'All agents in company', category: 'builtin' },
  { name: 'subordinate_list', label: '부하 목록', description: 'Direct subordinates', category: 'builtin' },
  { name: 'tool_list', label: '도구 목록', description: 'Assigned tools', category: 'builtin' },
  { name: 'department_name', label: '부서명', description: 'Department name', category: 'builtin' },
  { name: 'owner_name', label: '소유자명', description: 'CLI owner name', category: 'builtin' },
  { name: 'specialty', label: '전문분야', description: 'Agent role/specialty', category: 'builtin' },
  { name: 'knowledge_context', label: '지식 컨텍스트', description: 'RAG knowledge injection', category: 'builtin' },
  // Personality (5) — Story 24.2
  { name: 'personality_openness', label: '개방성', description: 'Big Five: Openness (0-100)', category: 'personality' },
  { name: 'personality_conscientiousness', label: '성실성', description: 'Big Five: Conscientiousness (0-100)', category: 'personality' },
  { name: 'personality_extraversion', label: '외향성', description: 'Big Five: Extraversion (0-100)', category: 'personality' },
  { name: 'personality_agreeableness', label: '친화성', description: 'Big Five: Agreeableness (0-100)', category: 'personality' },
  { name: 'personality_neuroticism', label: '신경성', description: 'Big Five: Neuroticism (0-100)', category: 'personality' },
  // Memory (Sprint 3 placeholder)
  { name: 'relevant_memories', label: '관련 기억', description: 'Agent memory context (Sprint 3)', category: 'memory' },
]

// === Syntax Highlighting ===

const variableDecoration = Decoration.mark({ class: 'cm-soul-variable' })

const variableMatcher = new MatchDecorator({
  regexp: /\{\{([^}]+)\}\}/g,
  decoration: () => variableDecoration,
})

export const soulVariableHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = variableMatcher.createDeco(view)
    }
    update(update: ViewUpdate) {
      this.decorations = variableMatcher.updateDeco(update, this.decorations)
    }
  },
  { decorations: (v) => v.decorations },
)

// === Autocomplete ===

function soulVariableCompletion(context: CompletionContext): CompletionResult | null {
  // Match {{ or {{partial_text
  const match = context.matchBefore(/\{\{(\w*)/)
  if (!match) return null

  const prefix = match.text.replace(/^\{\{/, '')

  return {
    from: match.from,
    options: SOUL_VARIABLES
      .filter((v) => !prefix || v.name.includes(prefix))
      .map((v) => ({
        label: `{{${v.name}}}`,
        detail: v.label,
        info: v.description,
        type: v.category === 'personality' ? 'variable' : v.category === 'memory' ? 'property' : 'keyword',
        apply: `{{${v.name}}}`,
      })),
    validFor: /^\{\{\w*$/,
  }
}

export const soulAutocomplete = autocompletion({
  override: [soulVariableCompletion],
  activateOnTyping: true,
})

// === CSS for highlighting ===

export const SOUL_VARIABLE_CSS = `
.cm-soul-variable {
  color: #5a7247;
  background-color: rgba(90, 114, 71, 0.1);
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 600;
}
`
