import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

const APP_SRC = join(import.meta.dir, '../../../../app/src')

/**
 * TEA (Test Architect) 리스크 기반 테스트 — Story 17-5: NEXUS 모바일 접근
 *
 * 리스크 분석:
 * - HIGH: NexusInfoPanel 모바일/데스크톱 듀얼 렌더링 — 패널 중복/누락 위험
 * - HIGH: WorkflowEditor 더보기 드롭다운 — 버튼 누락/동작 불일치 위험
 * - MEDIUM: CSS 애니메이션 — 모바일 전환 시 끊김 위험
 * - MEDIUM: 반응형 브레이크포인트 일관성 — sm/md 혼용 위험
 * - LOW: PWA 기존 인프라 — 이미 동작 확인됨
 */

describe('TEA — Story 17-5: NEXUS 모바일 접근 리스크 기반 테스트', () => {

  // ========== HIGH RISK: NexusInfoPanel 듀얼 렌더링 ==========
  describe('[P0] NexusInfoPanel 모바일/데스크톱 듀얼 렌더링', () => {
    const content = readFileSync(join(APP_SRC, 'components/nexus/NexusInfoPanel.tsx'), 'utf-8')

    test('모바일 시트와 데스크톱 사이드바 모두 panelContent 변수 사용 (중복 코드 없음)', () => {
      // panelContent 변수로 공통 내용 추출
      expect(content).toContain('const panelContent')
      // panelContent가 두 번 사용됨 (모바일 + 데스크톱)
      const usages = content.match(/\{panelContent\}/g)
      expect(usages?.length).toBe(2)
    })

    test('모바일 시트: z-index 40 적용 (사이드바/모달과 충돌 방지)', () => {
      expect(content).toContain('z-40')
    })

    test('모바일 시트: rounded-t-2xl (상단 둥근 모서리)', () => {
      expect(content).toContain('rounded-t-2xl')
    })

    test('모바일 시트: stopPropagation으로 내부 클릭 시 닫힘 방지', () => {
      expect(content).toContain('stopPropagation')
    })

    test('모바일 백드롭: absolute inset-0 (전체 화면 커버)', () => {
      expect(content).toContain('absolute inset-0')
    })

    test('데스크톱: overflow-y-auto (콘텐츠 넘침 처리)', () => {
      expect(content).toContain('overflow-y-auto')
    })

    test('모바일 시트: -webkit-overflow-scrolling:touch (iOS 터치 스크롤)', () => {
      expect(content).toContain('-webkit-overflow-scrolling:touch')
    })

    test('채팅하기 버튼: agentId 존재 시에만 표시 + 네비게이션', () => {
      expect(content).toContain('node.agentId &&')
      expect(content).toMatch(/navigate\(`\/chat\?agentId=\$\{node\.agentId\}`\)/)
    })
  })

  // ========== HIGH RISK: WorkflowEditor 더보기 드롭다운 ==========
  describe('[P0] WorkflowEditor 더보기 드롭다운 구조', () => {
    const content = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')

    test('showMoreMenu 상태 관리', () => {
      expect(content).toContain('useState(false)')
      expect(content).toContain('showMoreMenu')
    })

    test('moreMenuRef 참조 (외부 클릭 감지용)', () => {
      expect(content).toContain('moreMenuRef')
      expect(content).toContain('useRef<HTMLDivElement>')
    })

    test('드롭다운 위치: absolute right-0 top-full (버튼 아래 우측 정렬)', () => {
      expect(content).toContain('absolute right-0 top-full')
    })

    test('드롭다운 z-index: z-50 (다른 UI 위에 표시)', () => {
      expect(content).toContain('z-50')
    })

    test('드롭다운 닫기: handleAddNode에서 setShowMoreMenu(false)', () => {
      // handleAddNode 내에서 메뉴 닫기
      expect(content).toContain('setShowMoreMenu(false)')
    })

    test('삭제 버튼 구분선: hr border-zinc-700 (시각적 분리)', () => {
      expect(content).toContain('border-zinc-700 my-1')
    })

    test('데스크톱 보조 버튼: hidden md:flex (모바일 숨김)', () => {
      const hiddenMdFlex = content.match(/hidden md:flex/g)
      expect(hiddenMdFlex?.length).toBeGreaterThanOrEqual(1)
    })

    test('모바일 더보기 컨테이너: relative md:hidden (데스크톱 숨김)', () => {
      expect(content).toContain('relative md:hidden')
    })

    test('모바일 dirty 상태 표시: hidden sm:inline (작은 화면 숨김)', () => {
      expect(content).toContain('hidden sm:inline')
    })

    test('모바일 구분선 숨김: hidden sm:inline (separator)', () => {
      expect(content).toContain('hidden sm:inline')
    })
  })

  // ========== MEDIUM RISK: 브레이크포인트 일관성 ==========
  describe('[P1] 반응형 브레이크포인트 일관성', () => {
    const nexusContent = readFileSync(join(APP_SRC, 'pages/nexus.tsx'), 'utf-8')
    const infoPanelContent = readFileSync(join(APP_SRC, 'components/nexus/NexusInfoPanel.tsx'), 'utf-8')
    const editorContent = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')
    const listContent = readFileSync(join(APP_SRC, 'components/nexus/WorkflowListPanel.tsx'), 'utf-8')

    test('nexus.tsx: md 브레이크포인트 사용 (채팅 토글)', () => {
      expect(nexusContent).toContain('hidden md:flex')
      expect(nexusContent).toContain('hidden md:block')
    })

    test('nexus.tsx: md 브레이크포인트 사용 (MiniMap)', () => {
      expect(nexusContent).toContain('hidden md:block')
    })

    test('NexusInfoPanel: md 브레이크포인트 일관 사용', () => {
      expect(infoPanelContent).toContain('md:hidden')
      expect(infoPanelContent).toContain('hidden md:block')
    })

    test('WorkflowEditor: md 브레이크포인트 일관 사용 (보조 버튼)', () => {
      expect(editorContent).toContain('hidden md:flex')
      expect(editorContent).toContain('md:hidden')
    })

    test('WorkflowListPanel: md/lg 브레이크포인트 일관 사용 (그리드)', () => {
      expect(listContent).toContain('md:grid-cols-2')
      expect(listContent).toContain('lg:grid-cols-3')
    })
  })

  // ========== MEDIUM RISK: CSS 애니메이션 ==========
  describe('[P1] CSS 애니메이션 정의 완결성', () => {
    const css = readFileSync(join(APP_SRC, 'index.css'), 'utf-8')

    test('slide-up 키프레임: from translateY(100%) → to translateY(0)', () => {
      const slideUpMatch = css.match(/@keyframes slide-up[\s\S]*?translateY\(100%\)[\s\S]*?translateY\(0\)/)
      expect(slideUpMatch).not.toBeNull()
    })

    test('기존 slide-in 키프레임 보존', () => {
      expect(css).toContain('@keyframes slide-in')
      expect(css).toContain('translateX(-100%)')
    })

    test('기존 slideInRight 키프레임 보존', () => {
      expect(css).toContain('@keyframes slideInRight')
    })

    test('@theme 블록에 animate-slide-up 정의', () => {
      // @theme 블록 내에 정의 확인
      const themeBlock = css.match(/@theme\s*\{[\s\S]*?\}/)
      expect(themeBlock).not.toBeNull()
      expect(themeBlock![0]).toContain('--animate-slide-up')
    })

    test('animate-slide-up 값에 slide-up 키프레임 참조', () => {
      expect(css).toContain('slide-up 200ms ease-out')
    })
  })

  // ========== 엣지케이스 ==========
  describe('[P2] 엣지케이스 커버리지', () => {
    const nexusContent = readFileSync(join(APP_SRC, 'pages/nexus.tsx'), 'utf-8')
    const editorContent = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')
    const infoPanelContent = readFileSync(join(APP_SRC, 'components/nexus/NexusInfoPanel.tsx'), 'utf-8')

    test('nexus.tsx: SketchVibe 캔버스 드래그/연결 활성화', () => {
      expect(nexusContent).toContain('nodesDraggable')
      expect(nexusContent).toContain('nodesConnectable')
    })

    test('nexus.tsx: 줌 제한 설정', () => {
      expect(nexusContent).toContain('minZoom')
      expect(nexusContent).toContain('maxZoom')
    })

    test('WorkflowEditor: 삭제 키 설정 유지 (Backspace + Delete)', () => {
      expect(editorContent).toContain("deleteKeyCode={['Backspace', 'Delete']}")
    })

    test('WorkflowEditor: ConfirmDialog 2개 유지 (삭제 + 뒤로가기)', () => {
      const confirmDialogs = editorContent.match(/ConfirmDialog/g)
      expect(confirmDialogs?.length).toBeGreaterThanOrEqual(2)
    })

    test('NexusInfoPanel: Escape 키 리스너 cleanup (메모리 누수 방지)', () => {
      expect(infoPanelContent).toContain('removeEventListener')
    })

    test('NexusInfoPanel: STATUS_LABELS 모든 상태 커버', () => {
      expect(infoPanelContent).toContain('online')
      expect(infoPanelContent).toContain('working')
      expect(infoPanelContent).toContain('error')
      expect(infoPanelContent).toContain('offline')
    })

    test('WorkflowEditor: prompt 사용한 노드 이름 입력 (모바일에서도 동작)', () => {
      expect(editorContent).toContain("prompt('노드 이름을 입력하세요')")
    })

    test('WorkflowEditor: proOptions hideAttribution 유지', () => {
      expect(editorContent).toContain('hideAttribution: true')
    })
  })

  // ========== 회귀 방지 ==========
  describe('[P1] 회귀 방지 — 기존 기능 보존', () => {
    const nexusContent = readFileSync(join(APP_SRC, 'pages/nexus.tsx'), 'utf-8')
    const editorContent = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')
    const listContent = readFileSync(join(APP_SRC, 'components/nexus/WorkflowListPanel.tsx'), 'utf-8')

    test('nexus.tsx: SketchVibe 캔버스 + 채팅 구조', () => {
      expect(nexusContent).toContain('SketchVibe')
      expect(nexusContent).toContain('ChatArea')
    })

    test('nexus.tsx: 캔버스 컨텍스트를 AI에 전달', () => {
      expect(nexusContent).toContain('canvasContext')
      expect(nexusContent).toContain('canvasToText')
    })

    test('nexus.tsx: fitView padding 0.2 유지', () => {
      expect(nexusContent).toContain('padding: 0.2')
    })

    test('WorkflowEditor: 저장/실행/삭제 mutation 유지', () => {
      expect(editorContent).toContain('saveMutation')
      expect(editorContent).toContain('executeMutation')
      expect(editorContent).toContain('deleteMutation')
      expect(editorContent).toContain('templateMutation')
    })

    test('WorkflowEditor: isDirty 상태 + 뒤로가기 확인 유지', () => {
      expect(editorContent).toContain('isDirty')
      expect(editorContent).toContain('showBackConfirm')
    })

    test('WorkflowEditor: ExecutionHistoryPanel 토글 유지', () => {
      expect(editorContent).toContain('ExecutionHistoryPanel')
      expect(editorContent).toContain('showHistory')
    })

    test('WorkflowListPanel: 탭 필터 (mine/templates) 유지', () => {
      expect(listContent).toContain("'mine'")
      expect(listContent).toContain("'templates'")
    })

    test('WorkflowListPanel: clone mutation 유지', () => {
      expect(listContent).toContain('cloneMutation')
    })

    test('WorkflowListPanel: Badge import 유지', () => {
      expect(listContent).toContain('Badge')
    })
  })

  // ========== 컴포넌트 export 검증 ==========
  describe('[P1] 컴포넌트 export 검증', () => {
    test('NexusInfoPanel export 정상', () => {
      const content = readFileSync(join(APP_SRC, 'components/nexus/NexusInfoPanel.tsx'), 'utf-8')
      expect(content).toContain('export function NexusInfoPanel')
    })

    test('WorkflowEditor export 정상', () => {
      const content = readFileSync(join(APP_SRC, 'components/nexus/WorkflowEditor.tsx'), 'utf-8')
      expect(content).toContain('export function WorkflowEditor')
    })

    test('WorkflowListPanel export 정상', () => {
      const content = readFileSync(join(APP_SRC, 'components/nexus/WorkflowListPanel.tsx'), 'utf-8')
      expect(content).toContain('export function WorkflowListPanel')
    })
  })
})
