/**
 * Story 23.15 — StreamingMessage Redesign Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const msgPath = resolve(__dirname, '..', 'components/chat/streaming-message.tsx')

describe('StreamingMessage Redesign', () => {
  const src = readFileSync(msgPath, 'utf-8')

  // ── Component exports ──
  test('StreamingMessage is exported', () => {
    expect(src).toContain('export function StreamingMessage')
  })

  test('StreamingMessageProps interface is exported', () => {
    expect(src).toContain('export interface StreamingMessageProps')
  })

  // ── Markdown rendering ──
  test('uses react-markdown for rendering', () => {
    expect(src).toContain("from 'react-markdown'")
    expect(src).toContain('<Markdown')
  })

  test('has prose classes for markdown styling', () => {
    expect(src).toContain('prose prose-sm')
  })

  // ── Code blocks ──
  test('CodeBlock component with copy button', () => {
    expect(src).toContain('function CodeBlock')
    expect(src).toContain('data-testid="code-block"')
    expect(src).toContain('data-testid="copy-button"')
  })

  test('copy button uses clipboard API', () => {
    expect(src).toContain('navigator.clipboard.writeText')
    expect(src).toContain('setCopied(true)')
    expect(src).toContain('Copied')
  })

  test('code block shows language label', () => {
    expect(src).toContain("language-")
    expect(src).toContain("language || 'code'")
  })

  // ── Streaming cursor ──
  test('has streaming cursor animation', () => {
    expect(src).toContain('StreamingCursor')
    expect(src).toContain('data-testid="streaming-cursor"')
    expect(src).toContain('cursor-blink')
    expect(src).toContain('animate-')
  })

  test('cursor only shows when isStreaming is true', () => {
    expect(src).toContain('isStreaming && <StreamingCursor')
  })

  // ── Agent avatar + name ──
  test('has agent avatar with Bot icon', () => {
    expect(src).toContain('Bot')
    expect(src).toContain('avatarUrl')
  })

  test('has User icon for user messages', () => {
    expect(src).toContain('User')
  })

  test('displays sender name', () => {
    expect(src).toContain('displayName')
    expect(src).toContain('sender')
  })

  // ── Timestamp + token count footer ──
  test('has timestamp in footer', () => {
    expect(src).toContain('formattedTime')
    expect(src).toContain('Clock')
    expect(src).toContain('toLocaleTimeString')
  })

  test('has token count in footer', () => {
    expect(src).toContain('tokenCount')
    expect(src).toContain('tokens')
  })

  // ── Natural Organic styling ──
  test('user bubble has olive-tinted bg', () => {
    expect(src).toContain('#5a7247')  // olive tinted
  })

  test('agent bubble has cream bg', () => {
    expect(src).toContain('#f5f0e8')  // warm cream for agent
  })

  test('uses Natural Organic text colors', () => {
    expect(src).toContain('#283618') // dark olive
    expect(src).toContain('#6b705c') // muted
    expect(src).toContain('#e5e1d3') // sand
  })

  // ── data-testid ──
  test('has data-testid for main component', () => {
    expect(src).toContain('data-testid="streaming-message"')
  })
})
