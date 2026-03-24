import { useRef, useEffect, useCallback } from 'react'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { basicSetup } from 'codemirror'
import { soulVariableHighlight, soulAutocomplete, SOUL_VARIABLE_CSS } from '../lib/codemirror-soul-extensions'

function getIsDark() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

export default function CodeMirrorEditor({
  value,
  onChange,
  placeholder,
  className,
  soulMode,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  soulMode?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const themeCompartmentRef = useRef(new Compartment())

  // Track whether an update came from inside the editor
  const isInternalUpdate = useRef(false)

  const createView = useCallback(() => {
    if (!containerRef.current) return
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    const isDark = getIsDark()

    const extensions = [
      basicSetup,
      markdown(),
      keymap.of([...defaultKeymap, indentWithTab]),
      themeCompartmentRef.current.of(isDark ? oneDark : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          isInternalUpdate.current = true
          onChangeRef.current(update.state.doc.toString())
        }
      }),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { height: '288px', fontSize: '13px' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
      }),
    ]

    if (placeholder) {
      extensions.push(cmPlaceholder(placeholder))
    }

    // Story 24.6: Soul variable highlighting + autocomplete (UXR118, AR15)
    if (soulMode) {
      extensions.push(soulVariableHighlight, soulAutocomplete)
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    })
  }, [placeholder, soulMode])

  // Inject soul-mode CSS once
  useEffect(() => {
    if (!soulMode) return
    const id = 'cm-soul-variable-css'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = SOUL_VARIABLE_CSS
    document.head.appendChild(style)
  }, [soulMode])

  // Initialize
  useEffect(() => {
    createView()
    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [createView])

  // Sync external value changes (e.g. template load, reset)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    const currentDoc = view.state.doc.toString()
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      })
    }
  }, [value])

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const view = viewRef.current
      if (!view) return
      const isDark = getIsDark()
      view.dispatch({
        effects: themeCompartmentRef.current.reconfigure(isDark ? oneDark : []),
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`border border-zinc-200 rounded-md overflow-hidden ${className || ''}`}
    />
  )
}
