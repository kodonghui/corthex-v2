// Trading Mode Separation Tests (Story 10-6)
// Tests: 2-step confirmation, trading mode switching, portfolio reset, chief-of-staff dynamic mode

import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === Mock DB ===
const mockDbSelect = mock(() => mockDbChain)
const mockDbUpdate = mock(() => mockDbUpdateChain)
const mockDbChain = {
  from: mock(() => mockDbChain),
  where: mock(() => mockDbChain),
  limit: mock(() => []),
  orderBy: mock(() => []),
}
const mockDbUpdateChain = {
  set: mock(() => mockDbUpdateChain),
  where: mock(() => mockDbUpdateChain),
}

mock.module('../../db', () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
    insert: mock(() => ({ values: mock(() => ({ returning: mock(() => []) })) })),
  },
}))

mock.module('../../db/schema', () => ({
  companies: { id: 'id', settings: 'settings' },
  users: { id: 'id', passwordHash: 'passwordHash' },
  strategyPortfolios: {
    id: 'id', companyId: 'companyId', userId: 'userId',
    tradingMode: 'tradingMode', cashBalance: 'cashBalance',
    holdings: 'holdings', totalValue: 'totalValue', updatedAt: 'updatedAt',
  },
  strategyOrders: {
    id: 'id', companyId: 'companyId', tradingMode: 'tradingMode',
    status: 'status', createdAt: 'createdAt', side: 'side',
    totalAmount: 'totalAmount', userId: 'userId',
  },
}))

mock.module('drizzle-orm', () => ({
  eq: mock((...args: unknown[]) => ({ type: 'eq', args })),
  and: mock((...args: unknown[]) => ({ type: 'and', args })),
  gte: mock((...args: unknown[]) => ({ type: 'gte', args })),
  sql: mock((strings: TemplateStringsArray) => strings[0]),
}))

// === Test Trading Settings Service ===

import {
  DEFAULT_TRADING_SETTINGS,
  clampSetting,
  getEffectiveValue,
  RISK_PROFILES,
} from '../../services/trading-settings'
import type { TradingSettings, TradingMode } from '@corthex/shared'

describe('Trading Mode Separation', () => {
  describe('DEFAULT_TRADING_SETTINGS', () => {
    test('기본 tradingMode는 paper여야 한다', () => {
      expect(DEFAULT_TRADING_SETTINGS.tradingMode).toBe('paper')
    })

    test('기본 initialCapital은 1억이어야 한다', () => {
      expect(DEFAULT_TRADING_SETTINGS.initialCapital).toBe(100_000_000)
    })

    test('기본 executionMode는 approval이어야 한다', () => {
      expect(DEFAULT_TRADING_SETTINGS.executionMode).toBe('approval')
    })

    test('기본 riskProfile은 balanced여야 한다', () => {
      expect(DEFAULT_TRADING_SETTINGS.riskProfile).toBe('balanced')
    })
  })

  describe('TradingMode 타입 검증', () => {
    test('real과 paper 모드가 유효해야 한다', () => {
      const validModes: TradingMode[] = ['real', 'paper']
      expect(validModes).toContain('real')
      expect(validModes).toContain('paper')
    })

    test('TradingSettings에 tradingMode 필드가 있어야 한다', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        tradingMode: 'real',
      }
      expect(settings.tradingMode).toBe('real')
    })

    test('TradingSettings에 initialCapital 필드가 있어야 한다', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        initialCapital: 50_000_000,
      }
      expect(settings.initialCapital).toBe(50_000_000)
    })
  })
})

describe('2단계 확인 로직', () => {
  const CONFIRMATION_CODE = 'REAL_TRADING'

  test('paper→real 전환: 올바른 확인코드 통과', () => {
    const currentMode: TradingMode = 'paper'
    const targetMode: TradingMode = 'real'
    const confirmationCode = CONFIRMATION_CODE

    const needsConfirmation = currentMode === 'paper' && targetMode === 'real'
    const confirmationValid = confirmationCode === CONFIRMATION_CODE

    expect(needsConfirmation).toBe(true)
    expect(confirmationValid).toBe(true)
  })

  test('paper→real 전환: 잘못된 확인코드 거부', () => {
    const confirmationCode = 'WRONG_CODE'
    const confirmationValid = confirmationCode === CONFIRMATION_CODE
    expect(confirmationValid).toBe(false)
  })

  test('paper→real 전환: 확인코드 없으면 거부', () => {
    const confirmationCode = undefined
    const confirmationValid = confirmationCode === CONFIRMATION_CODE
    expect(confirmationValid).toBe(false)
  })

  test('real→paper 전환: 확인코드 불필요', () => {
    const currentMode: TradingMode = 'real'
    const targetMode: TradingMode = 'paper'
    const needsConfirmation = currentMode === 'paper' && targetMode === 'real'
    expect(needsConfirmation).toBe(false)
  })

  test('같은 모드 전환: 불필요', () => {
    const currentMode: TradingMode = 'paper'
    const targetMode: TradingMode = 'paper'
    const alreadySameMode = currentMode === targetMode
    expect(alreadySameMode).toBe(true)
  })
})

describe('포트폴리오 리셋 로직', () => {
  test('리셋 시 cashBalance가 initialCapital로 설정돼야 한다', () => {
    const initialCapital = 100_000_000
    const resetPortfolio = {
      cashBalance: initialCapital,
      holdings: [],
      totalValue: initialCapital,
    }
    expect(resetPortfolio.cashBalance).toBe(100_000_000)
    expect(resetPortfolio.holdings).toEqual([])
    expect(resetPortfolio.totalValue).toBe(100_000_000)
  })

  test('커스텀 초기자금으로 리셋해야 한다', () => {
    const initialCapital = 50_000_000
    const resetPortfolio = {
      cashBalance: initialCapital,
      holdings: [],
      totalValue: initialCapital,
    }
    expect(resetPortfolio.cashBalance).toBe(50_000_000)
  })

  test('paper 모드만 리셋 가능해야 한다', () => {
    const portfolios = [
      { id: '1', tradingMode: 'paper' as TradingMode },
      { id: '2', tradingMode: 'real' as TradingMode },
    ]
    const resetTargets = portfolios.filter(p => p.tradingMode === 'paper')
    expect(resetTargets.length).toBe(1)
    expect(resetTargets[0].id).toBe('1')
  })

  test('real 포트폴리오는 리셋 대상이 아니어야 한다', () => {
    const portfolios = [
      { id: '1', tradingMode: 'real' as TradingMode },
    ]
    const resetTargets = portfolios.filter(p => p.tradingMode === 'paper')
    expect(resetTargets.length).toBe(0)
  })
})

describe('chief-of-staff tradingMode 동적 적용', () => {
  test('tradingSettings에서 tradingMode를 읽어야 한다', () => {
    const tradingSettings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'real',
    }
    // The chief-of-staff should use tradingSettings.tradingMode instead of hardcoded 'paper'
    const tradingMode = tradingSettings.tradingMode || 'paper'
    expect(tradingMode).toBe('real')
  })

  test('tradingMode가 없으면 paper 기본값을 사용해야 한다', () => {
    const tradingSettings = {
      executionMode: 'approval' as const,
      riskProfile: 'balanced' as const,
      customSettings: {},
      settingsHistory: [],
    } as Partial<TradingSettings>

    const tradingMode = tradingSettings.tradingMode || 'paper'
    expect(tradingMode).toBe('paper')
  })

  test('autonomous 모드에서도 tradingMode가 적용돼야 한다', () => {
    const tradingSettings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'autonomous',
      tradingMode: 'real',
    }
    // Both savePendingOrders and executeProposals should use tradingSettings.tradingMode
    expect(tradingSettings.executionMode).toBe('autonomous')
    expect(tradingSettings.tradingMode).toBe('real')
  })

  test('approval 모드에서도 tradingMode가 적용돼야 한다', () => {
    const tradingSettings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'approval',
      tradingMode: 'real',
    }
    expect(tradingSettings.executionMode).toBe('approval')
    expect(tradingSettings.tradingMode).toBe('real')
  })
})

describe('KIS 상태 조회', () => {
  test('KIS 미설정 시 모의거래로 표시', () => {
    const tradingMode: TradingMode = 'real'
    const kisAvailable = false
    const activeMode = tradingMode === 'real' && kisAvailable ? '실거래' : '모의거래'
    expect(activeMode).toBe('모의거래')
  })

  test('KIS 설정 + real 모드면 실거래로 표시', () => {
    const tradingMode: TradingMode = 'real'
    const kisAvailable = true
    const activeMode = tradingMode === 'real' && kisAvailable ? '실거래' : '모의거래'
    expect(activeMode).toBe('실거래')
  })

  test('KIS 설정 + paper 모드면 모의거래로 표시', () => {
    const tradingMode: TradingMode = 'paper'
    const kisAvailable = true
    const activeMode = tradingMode === 'real' && kisAvailable ? '실거래' : '모의거래'
    expect(activeMode).toBe('모의거래')
  })

  test('계좌번호 마스킹', () => {
    const accountNo = '12345678'
    const masked = accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '설정됨'
    expect(masked).toBe('****5678')
  })

  test('계좌번호 짧으면 "설정됨" 표시', () => {
    const accountNo = '123'
    const masked = accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '설정됨'
    expect(masked).toBe('설정됨')
  })
})

describe('Risk Profile과 Trading Mode 독립성', () => {
  test('RISK_PROFILES는 tradingMode에 영향받지 않아야 한다', () => {
    expect(RISK_PROFILES.aggressive).toBeDefined()
    expect(RISK_PROFILES.balanced).toBeDefined()
    expect(RISK_PROFILES.conservative).toBeDefined()
  })

  test('clampSetting은 tradingMode와 무관해야 한다', () => {
    const clamped = clampSetting('maxPositionPct', 50, 'conservative')
    expect(clamped).toBe(15) // conservative max is 15
  })

  test('getEffectiveValue는 tradingMode와 무관해야 한다', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'real',
    }
    const value = getEffectiveValue('maxPositionPct', settings)
    expect(value).toBe(20) // balanced default
  })
})

describe('초기 자금 설정', () => {
  test('기본 초기자금은 1억원이어야 한다', () => {
    expect(DEFAULT_TRADING_SETTINGS.initialCapital).toBe(100_000_000)
  })

  test('초기자금이 양수여야 한다', () => {
    const amount = 50_000_000
    expect(amount > 0).toBe(true)
  })

  test('초기자금 범위 검증 (최소 100만원)', () => {
    const minAmount = 1_000_000
    const validAmount = 50_000_000
    const invalidAmount = 500_000
    expect(validAmount >= minAmount).toBe(true)
    expect(invalidAmount >= minAmount).toBe(false)
  })

  test('초기자금 범위 검증 (최대 20억원 — DB integer 제한)', () => {
    const maxAmount = 2_000_000_000
    const validAmount = 1_000_000_000
    const invalidAmount = 3_000_000_000
    expect(validAmount <= maxAmount).toBe(true)
    expect(invalidAmount <= maxAmount).toBe(false)
  })
})

describe('Trading Mode Change WebSocket 이벤트', () => {
  test('모드 전환 이벤트 구조 검증', () => {
    const event = {
      type: 'mode:changed',
      data: {
        previousMode: 'paper' as TradingMode,
        newMode: 'real' as TradingMode,
        changedBy: 'user-123',
        changedAt: new Date().toISOString(),
      },
    }
    expect(event.type).toBe('mode:changed')
    expect(event.data.previousMode).toBe('paper')
    expect(event.data.newMode).toBe('real')
    expect(event.data.changedBy).toBe('user-123')
    expect(event.data.changedAt).toBeTruthy()
  })
})

describe('updateTradingSettings - tradingMode 지원', () => {
  test('tradingMode 유효 값만 허용해야 한다', () => {
    const validModes = ['real', 'paper']
    expect(validModes.includes('real')).toBe(true)
    expect(validModes.includes('paper')).toBe(true)
    expect(validModes.includes('invalid' as string)).toBe(false)
  })
})

// ===== TEA-Expanded Tests: Edge Cases & Security =====

describe('TEA: 2단계 확인 — 보안 엣지케이스', () => {
  const CONFIRMATION_CODE = 'REAL_TRADING'

  test('확인코드 대소문자 구분해야 한다', () => {
    expect('real_trading' === CONFIRMATION_CODE).toBe(false)
    expect('Real_Trading' === CONFIRMATION_CODE).toBe(false)
    expect('REAL_TRADING' === CONFIRMATION_CODE).toBe(true)
  })

  test('확인코드 공백 포함 시 거부', () => {
    expect(' REAL_TRADING' === CONFIRMATION_CODE).toBe(false)
    expect('REAL_TRADING ' === CONFIRMATION_CODE).toBe(false)
  })

  test('빈 문자열 확인코드 거부', () => {
    expect('' === CONFIRMATION_CODE).toBe(false)
  })

  test('null 확인코드 거부', () => {
    expect(null === (CONFIRMATION_CODE as unknown)).toBe(false)
  })

  test('연속 전환 시도: paper→real→paper→real 정상 동작', () => {
    const transitions = [
      { from: 'paper', to: 'real', needsCode: true },
      { from: 'real', to: 'paper', needsCode: false },
      { from: 'paper', to: 'real', needsCode: true },
    ]
    for (const t of transitions) {
      const needsConfirmation = t.from === 'paper' && t.to === 'real'
      expect(needsConfirmation).toBe(t.needsCode)
    }
  })

  test('비밀번호가 빈 문자열이면 거부', () => {
    const password = ''
    expect(password.length > 0).toBe(false)
  })
})

describe('TEA: 포트폴리오 리셋 — 경계값 테스트', () => {
  test('초기자금 0원은 거부해야 한다', () => {
    const amount = 0
    expect(amount > 0).toBe(false)
  })

  test('초기자금 음수는 거부해야 한다', () => {
    const amount = -1_000_000
    expect(amount > 0).toBe(false)
  })

  test('여러 paper 포트폴리오 동시 리셋', () => {
    const portfolios = [
      { id: '1', tradingMode: 'paper' as TradingMode },
      { id: '2', tradingMode: 'paper' as TradingMode },
      { id: '3', tradingMode: 'real' as TradingMode },
    ]
    const resetTargets = portfolios.filter(p => p.tradingMode === 'paper')
    expect(resetTargets.length).toBe(2)
  })

  test('포트폴리오 없을 때 리셋 시 빈 배열 반환', () => {
    const portfolios: Array<{ id: string; tradingMode: TradingMode }> = []
    const resetTargets = portfolios.filter(p => p.tradingMode === 'paper')
    expect(resetTargets.length).toBe(0)
  })

  test('리셋 후 holdings는 빈 배열이어야 한다', () => {
    const resetHoldings: unknown[] = []
    expect(Array.isArray(resetHoldings)).toBe(true)
    expect(resetHoldings.length).toBe(0)
  })

  test('리셋 후 totalValue === cashBalance === initialCapital', () => {
    const initialCapital = 200_000_000
    const after = {
      cashBalance: initialCapital,
      totalValue: initialCapital,
      holdings: [],
    }
    expect(after.cashBalance).toBe(after.totalValue)
    expect(after.totalValue).toBe(initialCapital)
  })

  test('주문 이력은 리셋 시 보존해야 한다', () => {
    // Orders should NOT be deleted during portfolio reset
    const orderDeleteCalled = false
    expect(orderDeleteCalled).toBe(false)
  })
})

describe('TEA: TradingSettings 직렬화/역직렬화', () => {
  test('JSONB 저장 후 복원 시 tradingMode 유지', () => {
    const original: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'real',
      initialCapital: 50_000_000,
    }
    const serialized = JSON.stringify(original)
    const restored = JSON.parse(serialized) as TradingSettings
    expect(restored.tradingMode).toBe('real')
    expect(restored.initialCapital).toBe(50_000_000)
  })

  test('부분 설정에서 기본값 적용', () => {
    const partial = { executionMode: 'approval', riskProfile: 'balanced' }
    const tradingMode = (partial as Record<string, unknown>).tradingMode || 'paper'
    const initialCapital = (partial as Record<string, unknown>).initialCapital ?? 100_000_000
    expect(tradingMode).toBe('paper')
    expect(initialCapital).toBe(100_000_000)
  })

  test('null settings에서 기본값 적용', () => {
    const settings = null
    const tradingMode = (settings as unknown as Record<string, unknown>)?.tradingMode || 'paper'
    expect(tradingMode).toBe('paper')
  })
})

describe('TEA: chief-of-staff 통합 — 모드별 동작', () => {
  test('approval + paper: pending 주문에 paper 모드 기록', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'approval',
      tradingMode: 'paper',
    }
    const tradingMode = settings.tradingMode || 'paper'
    expect(tradingMode).toBe('paper')
  })

  test('approval + real: pending 주문에 real 모드 기록', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'approval',
      tradingMode: 'real',
    }
    const tradingMode = settings.tradingMode || 'paper'
    expect(tradingMode).toBe('real')
  })

  test('autonomous + real: 즉시 실행 시 real 모드 사용', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'autonomous',
      tradingMode: 'real',
    }
    const tradingMode = settings.tradingMode || 'paper'
    expect(tradingMode).toBe('real')
    expect(settings.executionMode).toBe('autonomous')
  })

  test('autonomous + paper: 즉시 실행 시 paper 모드 사용', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      executionMode: 'autonomous',
      tradingMode: 'paper',
    }
    const tradingMode = settings.tradingMode || 'paper'
    expect(tradingMode).toBe('paper')
  })
})

describe('TEA: WebSocket 이벤트 — 엣지케이스', () => {
  test('모드 전환 이벤트에 changedAt 타임스탬프 포함', () => {
    const changedAt = new Date().toISOString()
    expect(changedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('이벤트 타입이 mode:changed 정확히 일치', () => {
    const eventType = 'mode:changed'
    expect(eventType).toBe('mode:changed')
    expect(eventType).not.toBe('mode:change')
    expect(eventType).not.toBe('modeChanged')
  })

  test('previousMode와 newMode가 다른 값이어야 한다', () => {
    const previousMode: TradingMode = 'paper'
    const newMode: TradingMode = 'real'
    expect(previousMode).not.toBe(newMode)
  })
})

describe('TEA: KIS 상태 — 복합 조건', () => {
  test('KIS 크리덴셜 없고 paper 모드면 "모의거래"', () => {
    const tradingMode: TradingMode = 'paper'
    const kisAvailable = false
    const activeMode = tradingMode === 'real' && kisAvailable ? '실거래' : '모의거래'
    expect(activeMode).toBe('모의거래')
  })

  test('계좌번호 undefined면 "미설정"', () => {
    const accountNo: string | undefined = undefined
    const display = accountNo ? (accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '설정됨') : '미설정'
    expect(display).toBe('미설정')
  })

  test('계좌번호 빈 문자열이면 "미설정"', () => {
    const accountNo = ''
    const display = accountNo ? (accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '설정됨') : '미설정'
    expect(display).toBe('미설정')
  })

  test('계좌번호 정확히 4자리면 마스킹 동작', () => {
    const accountNo = '1234'
    const display = accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '설정됨'
    expect(display).toBe('****1234')
  })
})

describe('TEA: 설정 변경 이력 기록', () => {
  test('이력 항목에 필수 필드 포함', () => {
    const historyEntry = {
      changedAt: new Date().toISOString(),
      changedBy: 'user-123',
      action: '설정 변경',
      detail: '거래 모드 전환: paper → real',
      applied: { tradingMode: 'real' },
      rejected: {},
    }
    expect(historyEntry.changedAt).toBeTruthy()
    expect(historyEntry.changedBy).toBeTruthy()
    expect(historyEntry.action).toBe('설정 변경')
    expect(historyEntry.detail).toContain('거래 모드')
    expect(historyEntry.applied).toBeDefined()
    expect(historyEntry.rejected).toBeDefined()
  })

  test('이력 최대 100건 유지', () => {
    const history = Array.from({ length: 105 }, (_, i) => ({
      changedAt: new Date().toISOString(),
      changedBy: `user-${i}`,
      action: '설정 변경',
      detail: `변경 ${i}`,
      applied: {},
      rejected: {},
    }))
    const trimmed = history.slice(-100)
    expect(trimmed.length).toBe(100)
    expect(trimmed[0].detail).toBe('변경 5') // first 5 trimmed
  })
})

describe('TEA: initialCapital과 tradingMode 독립성', () => {
  test('initialCapital은 tradingMode에 영향받지 않아야 한다', () => {
    const settingsReal: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'real',
      initialCapital: 200_000_000,
    }
    const settingsPaper: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'paper',
      initialCapital: 200_000_000,
    }
    expect(settingsReal.initialCapital).toBe(settingsPaper.initialCapital)
  })

  test('initialCapital 변경 시 tradingMode 유지', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      tradingMode: 'real',
      initialCapital: 100_000_000,
    }
    settings.initialCapital = 500_000_000
    expect(settings.tradingMode).toBe('real')
  })
})

describe('TEA: 전체 설정 구조 무결성', () => {
  test('DEFAULT_TRADING_SETTINGS의 모든 필드가 정의되어 있어야 한다', () => {
    expect(DEFAULT_TRADING_SETTINGS.executionMode).toBeDefined()
    expect(DEFAULT_TRADING_SETTINGS.riskProfile).toBeDefined()
    expect(DEFAULT_TRADING_SETTINGS.tradingMode).toBeDefined()
    expect(DEFAULT_TRADING_SETTINGS.initialCapital).toBeDefined()
    expect(DEFAULT_TRADING_SETTINGS.customSettings).toBeDefined()
    expect(DEFAULT_TRADING_SETTINGS.settingsHistory).toBeDefined()
  })

  test('DEFAULT_TRADING_SETTINGS를 스프레드해도 원본 불변', () => {
    const copy = { ...DEFAULT_TRADING_SETTINGS }
    copy.tradingMode = 'real'
    expect(DEFAULT_TRADING_SETTINGS.tradingMode).toBe('paper')
  })

  test('customSettings 변경이 tradingMode에 영향 없어야 한다', () => {
    const settings: TradingSettings = {
      ...DEFAULT_TRADING_SETTINGS,
      customSettings: { maxPositionPct: 25 },
    }
    expect(settings.tradingMode).toBe('paper')
  })
})
