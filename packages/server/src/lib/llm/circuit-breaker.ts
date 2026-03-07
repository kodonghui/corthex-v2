import type { LLMProviderName } from '@corthex/shared'

export type CircuitState = 'closed' | 'open' | 'half-open'

export type CircuitBreakerStatus = {
  state: CircuitState
  consecutiveFailures: number
  lastFailureAt: number | null
}

type ProviderCircuit = {
  state: CircuitState
  consecutiveFailures: number
  lastFailureAt: number | null
}

const DEFAULT_FAILURE_THRESHOLD = 3
const DEFAULT_COOLDOWN_MS = 60_000

export class CircuitBreaker {
  private circuits: Map<LLMProviderName, ProviderCircuit> = new Map()
  private failureThreshold: number
  private cooldownMs: number

  constructor(
    failureThreshold = DEFAULT_FAILURE_THRESHOLD,
    cooldownMs = DEFAULT_COOLDOWN_MS,
  ) {
    this.failureThreshold = failureThreshold
    this.cooldownMs = cooldownMs
  }

  /**
   * Check if a provider is available (circuit not open).
   * If circuit is open and cooldown has passed, transitions to half-open.
   */
  isAvailable(provider: LLMProviderName): boolean {
    const circuit = this.getCircuit(provider)

    if (circuit.state === 'closed') return true
    if (circuit.state === 'half-open') return true

    // state === 'open': check if cooldown has passed
    if (circuit.lastFailureAt && Date.now() - circuit.lastFailureAt >= this.cooldownMs) {
      circuit.state = 'half-open'
      return true
    }

    return false
  }

  /**
   * Record a successful call. Resets circuit to closed.
   */
  recordSuccess(provider: LLMProviderName): void {
    const circuit = this.getCircuit(provider)
    circuit.state = 'closed'
    circuit.consecutiveFailures = 0
  }

  /**
   * Record a failed call. May transition to open.
   */
  recordFailure(provider: LLMProviderName): void {
    const circuit = this.getCircuit(provider)
    circuit.consecutiveFailures++
    circuit.lastFailureAt = Date.now()

    if (circuit.state === 'half-open') {
      // Any failure in half-open goes back to open
      circuit.state = 'open'
    } else if (circuit.consecutiveFailures >= this.failureThreshold) {
      circuit.state = 'open'
    }
  }

  /**
   * Get status of all provider circuits.
   */
  getStatus(): Record<LLMProviderName, CircuitBreakerStatus> {
    const result: Record<string, CircuitBreakerStatus> = {}
    for (const provider of ['anthropic', 'openai', 'google'] as LLMProviderName[]) {
      const circuit = this.getCircuit(provider)
      result[provider] = {
        state: circuit.state,
        consecutiveFailures: circuit.consecutiveFailures,
        lastFailureAt: circuit.lastFailureAt,
      }
    }
    return result as Record<LLMProviderName, CircuitBreakerStatus>
  }

  /**
   * Reset all circuits (for testing).
   */
  reset(): void {
    this.circuits.clear()
  }

  private getCircuit(provider: LLMProviderName): ProviderCircuit {
    let circuit = this.circuits.get(provider)
    if (!circuit) {
      circuit = { state: 'closed', consecutiveFailures: 0, lastFailureAt: null }
      this.circuits.set(provider, circuit)
    }
    return circuit
  }
}
