/**
 * Test utility: wraps components with necessary providers for testing.
 * Generic provider wrapper that accepts any providers as children.
 */
import type { ReactNode } from 'react'

/**
 * Generic test providers wrapper.
 * In actual usage, import QueryClientProvider from the app package.
 */
export function TestProviders({ children, providers = [] }: {
  children: ReactNode
  providers?: Array<(props: { children: ReactNode }) => ReactNode>
}) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children as ReactNode
  )
}

/**
 * Creates a wrapper component suitable for testing with providers.
 * Usage: const wrapper = createWrapper(QueryClientProvider, { client: queryClient })
 */
export function createWrapper(
  ...providers: Array<(props: { children: ReactNode }) => ReactNode>
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TestProviders providers={providers}>
        {children}
      </TestProviders>
    )
  }
}
