import { describe, test, expect } from 'bun:test'
import {
  Button,
  Input,
  Badge,
  Avatar,
  Spinner,
  Modal,
  Skeleton,
  toast,
  ToastProvider,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  StatusDot,
  EmptyState,
  cn,
} from '@corthex/ui'

describe('Phase A UI 컴포넌트 export 검증', () => {
  test('Phase A 8개 컴포넌트 모두 export 됨', () => {
    expect(Button).toBeDefined()
    expect(Input).toBeDefined()
    expect(Badge).toBeDefined()
    expect(Avatar).toBeDefined()
    expect(Spinner).toBeDefined()
    expect(Skeleton).toBeDefined()
    expect(Modal).toBeDefined()
    expect(toast).toBeDefined()
    expect(ToastProvider).toBeDefined()
  })

  test('기존 컴포넌트도 export 유지', () => {
    expect(Card).toBeDefined()
    expect(CardHeader).toBeDefined()
    expect(CardContent).toBeDefined()
    expect(CardFooter).toBeDefined()
    expect(StatusDot).toBeDefined()
    expect(EmptyState).toBeDefined()
    expect(cn).toBeDefined()
  })

  test('toast 함수 4개 메서드 존재', () => {
    expect(typeof toast.success).toBe('function')
    expect(typeof toast.error).toBe('function')
    expect(typeof toast.info).toBe('function')
    expect(typeof toast.warning).toBe('function')
  })

  test('Avatar는 함수 컴포넌트', () => {
    expect(typeof Avatar).toBe('function')
  })

  test('Spinner는 함수 컴포넌트', () => {
    expect(typeof Spinner).toBe('function')
  })

  test('Modal은 함수 컴포넌트', () => {
    expect(typeof Modal).toBe('function')
  })
})
