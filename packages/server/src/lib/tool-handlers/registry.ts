import type { ToolHandler } from './types'

class HandlerRegistry {
  private handlers = new Map<string, ToolHandler>()

  register(name: string, handler: ToolHandler): void {
    this.handlers.set(name, handler)
  }

  get(name: string): ToolHandler | undefined {
    return this.handlers.get(name)
  }

  list(): string[] {
    return [...this.handlers.keys()]
  }
}

export const registry = new HandlerRegistry()
