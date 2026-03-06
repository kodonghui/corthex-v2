import { describe, test, expect } from 'bun:test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const APP_SRC = join(import.meta.dir, '../../../../app/src')

describe('Story 17-5: NEXUS 모바일 접근 — 반응형 CSS 패턴 검증', () => {
  // --- nexus.tsx ---
  describe('nexus.tsx 모바일 반응형', () => {
    const content = readFileSync(join(APP_SRC, 'pages/nexus.tsx'), 'utf-8')

    test('헤더 탭 버튼에 flex-1 적용 (모바일 균등 배분)', () => {
      expect(content).toContain('flex-1 sm:flex-none')
    })

    test('NEXUS 제목 모바일 텍스트 축소 (text-base sm:text-lg)', () => {
      expect(content).toContain('text-base sm:text-lg')
    })

    test('MiniMap 모바일 숨김 (hidden md:block)', () => {
      // MiniMap className에 hidden md:block 포함
      expect(content).toMatch(/MiniMap[\s\S]*?hidden md:block/)
    })

    test('탭 버튼 text-center 적용', () => {
      expect(content).toContain('text-center')
    })

    test('ReactFlow 터치 속성 유지 (panOnScroll, zoomOnPinch)', () => {
      expect(content).toContain('panOnScroll')
      expect(content).toContain('zoomOnPinch')
    })
  })

  // --- NexusInfoPanel.tsx ---
  describe('NexusInfoPanel 모바일 하단 시트', () => {
    const content = readFileSync(join(APP_SRC, 'components/nexus/NexusInfoPanel.tsx'), 'utf-8')

    test('모바일 하단 시트 — md:hidden + fixed bottom-0', () => {
      expect(content).toContain('md:hidden')
      expect(content).toContain('bottom-0')
      expect(content).toContain('inset-x-0')
    })

    test('모바일 백드롭 오버레이 존재', () => {
      expect(content).toContain('bg-black/40')
    })

    test('드래그 핸들 바 존재', () => {
      expect(content).toContain('w-10 h-1')
      expect(content).toContain('rounded-full')
    })

    test('데스크톱 사이드바 유지 (hidden md:block w-72)', () => {
      expect(content).toContain('hidden md:block')
      expect(content).toContain('w-72')
      expect(content).toContain('border-l')
    })

    test('모바일 시트 max-h 제한 (60vh)', () => {
      expect(content).toContain('max-h-[60vh]')
    })

    test('슬라이드업 애니메이션 적용', () => {
      expect(content).toContain('animate-slide-up')
    })

    test('채팅하기 버튼 존재', () => {
      expect(content).toContain('채팅하기')
    })

    test('Escape 키 닫기 유지', () => {
      expect(content).toContain('Escape')
    })
  })

  // --- WorkflowEditor.tsx ---
  describe('WorkflowEditor 모바일 툴바', () => {
    const content = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')

    test('모바일 더보기 메뉴 버튼 (···)', () => {
      expect(content).toContain('···')
    })

    test('보조 버튼 데스크톱 전용 (hidden md:flex)', () => {
      expect(content).toContain('hidden md:flex')
    })

    test('모바일 더보기 드롭다운 (relative md:hidden)', () => {
      expect(content).toContain('relative md:hidden')
    })

    test('드롭다운 메뉴 항목들 존재', () => {
      expect(content).toContain('+ 노드 추가')
      expect(content).toContain('실행 기록')
      expect(content).toContain('템플릿으로 공유')
      expect(content).toContain('삭제')
    })

    test('워크플로우 이름 truncate 모바일 제한', () => {
      expect(content).toContain('max-w-[120px] sm:max-w-none')
    })

    test('핵심 버튼 (저장/실행) 항상 표시', () => {
      // 저장, 실행 버튼은 hidden md: 접두사 없이 존재
      const saveBtn = content.match(/저장 중\.\.\.' : '저장'/)
      const execBtn = content.match(/실행 중\.\.\.' : '실행'/)
      expect(saveBtn).not.toBeNull()
      expect(execBtn).not.toBeNull()
    })

    test('외부 클릭 시 드롭다운 닫기 (mousedown listener)', () => {
      expect(content).toContain('mousedown')
      expect(content).toContain('setShowMoreMenu(false)')
    })

    test('WorkflowEditor MiniMap 모바일 숨김', () => {
      expect(content).toMatch(/MiniMap[\s\S]*?hidden md:block/)
    })
  })

  // --- WorkflowListPanel.tsx ---
  describe('WorkflowListPanel 모바일 대응', () => {
    const content = readFileSync(join(APP_SRC, 'components/nexus/WorkflowListPanel.tsx'), 'utf-8')

    test('카드 그리드 반응형 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)', () => {
      expect(content).toContain('grid-cols-1')
      expect(content).toContain('md:grid-cols-2')
      expect(content).toContain('lg:grid-cols-3')
    })

    test('생성 모달 모바일 대응 (w-[90vw] max-w-96)', () => {
      expect(content).toContain('w-[90vw]')
      expect(content).toContain('max-w-96')
    })

    test('상단 영역 flex-wrap 적용', () => {
      expect(content).toContain('flex-wrap')
    })
  })

  // --- CSS 애니메이션 ---
  describe('CSS 애니메이션', () => {
    const css = readFileSync(join(APP_SRC, 'index.css'), 'utf-8')

    test('slide-up 키프레임 정의됨', () => {
      expect(css).toContain('@keyframes slide-up')
      expect(css).toContain('translateY(100%)')
      expect(css).toContain('translateY(0)')
    })

    test('animate-slide-up 커스텀 프로퍼티 정의됨', () => {
      expect(css).toContain('--animate-slide-up')
    })
  })
})
