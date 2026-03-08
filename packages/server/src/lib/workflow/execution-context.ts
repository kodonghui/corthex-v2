/**
 * 워크플로우 실행 컨텍스트
 * 스텝 간 데이터 전달을 위한 컨텍스트 저장소 + {{stepId.property}} 템플릿 치환
 */
export class ExecutionContext {
  private outputs = new Map<string, Record<string, unknown>>()

  /** 스텝 실행 결과 저장 */
  setStepOutput(stepId: string, output: Record<string, unknown>): void {
    this.outputs.set(stepId, output)
  }

  /** 스텝 실행 결과 조회 */
  getStepOutput(stepId: string): Record<string, unknown> | undefined {
    return this.outputs.get(stepId)
  }

  /**
   * params 객체 내의 {{stepId.property.nested}} 템플릿을 실제 값으로 치환
   * Strict Templating: 존재하지 않는 경로 참조 시 에러
   */
  resolveParams<T extends Record<string, unknown>>(params: T): T {
    return this.deepResolve(params) as T
  }

  private deepResolve(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.resolveString(value)
    }
    if (Array.isArray(value)) {
      return value.map(v => this.deepResolve(v))
    }
    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = this.deepResolve(v)
      }
      return result
    }
    return value
  }

  private resolveString(str: string): unknown {
    // 전체가 하나의 템플릿인 경우 원래 타입 보존
    const fullMatch = str.match(/^\{\{([^}]+)\}\}$/)
    if (fullMatch) {
      return this.resolveTemplatePath(fullMatch[1].trim())
    }

    // 문자열 내 부분 템플릿 치환
    return str.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const resolved = this.resolveTemplatePath(path.trim())
      return String(resolved)
    })
  }

  private resolveTemplatePath(path: string): unknown {
    const parts = path.split('.')
    const stepId = parts[0]
    const output = this.outputs.get(stepId)

    if (!output) {
      throw new Error(`Strict Templating Error: Step "${stepId}" has no output`)
    }

    let current: unknown = output
    for (let i = 1; i < parts.length; i++) {
      if (current === null || current === undefined || typeof current !== 'object') {
        throw new Error(
          `Strict Templating Error: Cannot access "${parts[i]}" on "${parts.slice(0, i).join('.')}" (value is ${current})`
        )
      }
      const obj = current as Record<string, unknown>
      if (!(parts[i] in obj)) {
        throw new Error(
          `Strict Templating Error: Property "${parts[i]}" not found in "${parts.slice(0, i).join('.')}"`
        )
      }
      current = obj[parts[i]]
    }

    return current
  }
}
