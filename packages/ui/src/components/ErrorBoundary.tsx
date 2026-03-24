/**
 * ErrorBoundary — Catches React render errors with friendly UI.
 */
import { Component } from 'react'

export interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Custom fallback UI */
  fallback?: React.ReactNode
  /** Error reporter callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center" role="alert">
          <div className="w-12 h-12 rounded-full bg-[#c4622d]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#c4622d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">문제가 발생했습니다</h3>
          <p className="text-sm text-[#6b705c] mb-4 max-w-sm">
            {this.state.error?.message || '예상치 못한 오류가 발생했습니다.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#606C38] text-white hover:bg-[#7a8f5a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606C38] focus-visible:ring-offset-2"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
