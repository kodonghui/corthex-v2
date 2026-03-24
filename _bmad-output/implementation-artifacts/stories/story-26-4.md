# Story 26.4: API Failure Fallback & Error Handling

## References
- FR-MKT7: API failure handling
- MKT-2: Retry 2x → fallback engine auto-switch
- MKT-5: Platform API changes via n8n node updates

## Acceptance Criteria
1. Timeout 30s → retry 2x before giving up on primary engine
2. After retries exhaust, auto-switch to fallback engine
3. Admin notification on fallback activation
4. Admin notification when all engines fail
5. Auth errors (401/403) skip retry (bad key never self-fixes)
6. Circuit breaker: 3 failures → open → 60s cooldown
7. Error categorization: timeout, rate_limit, auth, server_error, network, unknown
8. Platform API changes handled via n8n node updates, no code changes (MKT-5)

## Implementation

### Service: `packages/server/src/services/marketing-fallback.ts`
- **Error categorization**: categorizeError() → 6 categories, isRetryable() (auth NOT retryable)
- **Circuit breaker**: checkCircuit/recordFailure/recordSuccess, 3-failure threshold, 60s reset
- **Fallback chain builder**: buildFallbackChain() from MARKETING_ENGINE_PROVIDERS
- **executeWithFallback()**: Core retry+fallback logic — attempt primary (2 retries) → fallback engines (1 retry each) → notifications
- **DEFAULT_RETRY_CONFIG**: maxRetries 2, baseDelayMs 1000 (exponential backoff), timeoutMs 30000
- AbortController per attempt with configurable timeout

### Tests: 42 tests covering error categorization, retry logic, circuit breaker, fallback chain, notifications, MKT-5
