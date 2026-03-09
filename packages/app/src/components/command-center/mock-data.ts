import type { Command, CommandPreset, Agent, Department } from './types'

export const mockAgents: Agent[] = [
  { id: 'agent-1', name: '비서실장 민', role: '총괄 비서', department: '비서실', status: 'online', isSecretary: true },
  { id: 'agent-2', name: '전략기획 김', role: '전략 분석', department: '전략기획실', status: 'online', isSecretary: false },
  { id: 'agent-3', name: '리서치 박', role: '시장 조사', department: '연구실', status: 'working', isSecretary: false },
  { id: 'agent-4', name: '데이터 이', role: '데이터 분석', department: '데이터실', status: 'online', isSecretary: false },
  { id: 'agent-5', name: '홍보 최', role: 'PR/마케팅', department: '홍보실', status: 'offline', isSecretary: false },
]

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: '비서실', agentIds: ['agent-1'] },
  { id: 'dept-2', name: '전략기획실', agentIds: ['agent-2'] },
  { id: 'dept-3', name: '연구실', agentIds: ['agent-3'] },
  { id: 'dept-4', name: '데이터실', agentIds: ['agent-4'] },
  { id: 'dept-5', name: '홍보실', agentIds: ['agent-5'] },
]

export const mockPresets: CommandPreset[] = [
  { id: 'preset-1', name: '일일 시장 브리핑', prompt: '오늘의 주요 시장 동향과 뉴스를 요약해주세요.', tags: ['매일', '시장'], createdAt: '2024-01-15T09:00:00Z' },
  { id: 'preset-2', name: '경쟁사 분석', prompt: '주요 경쟁사의 최근 동향과 전략을 분석해주세요.', targetAgentId: 'agent-2', tags: ['분석'], createdAt: '2024-01-14T10:00:00Z' },
  { id: 'preset-3', name: '주간 보고서', prompt: '이번 주 주요 성과와 다음 주 계획을 정리해주세요.', tags: ['주간', '보고'], createdAt: '2024-01-13T11:00:00Z' },
]

export const mockCommands: Command[] = [
  {
    id: 'cmd-1',
    title: '2024년 Q1 전략 보고서 작성',
    status: 'completed',
    assignedAgentId: 'agent-2',
    assignedAgentName: '전략기획 김',
    totalCost: 0.45,
    qualityGrade: 'S',
    createdAt: '2024-01-20T09:15:00Z',
    completedAt: '2024-01-20T09:28:00Z',
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        content: '2024년 1분기 사업 전략 보고서를 작성해주세요. 시장 분석, 경쟁사 동향, 우리의 강점/약점, 그리고 구체적인 실행 계획을 포함해주세요.',
        createdAt: '2024-01-20T09:15:00Z',
      },
      {
        id: 'msg-1-2',
        role: 'assistant',
        content: '네, 2024년 Q1 전략 보고서를 작성하겠습니다.\n\n## 시장 분석\n현재 AI 시장은 연평균 35% 성장률을 보이고 있으며, 특히 엔터프라이즈 시장의 성장이 두드러집니다...\n\n## 경쟁사 동향\n주요 경쟁사 A사는 최근 신제품을 출시했으며...\n\n## SWOT 분석\n**강점**: 기술력, 빠른 대응 속도\n**약점**: 브랜드 인지도\n\n## 실행 계획\n1. 1월: 시장 조사 심화\n2. 2월: 제품 개선 작업\n3. 3월: 마케팅 캠페인 론칭',
        qualityGrade: 'S',
        cost: 0.35,
        durationMs: 45000,
        deliverables: [
          { id: 'del-1', type: 'report', title: 'Q1 전략보고서.pdf', summary: '15페이지 PDF 문서', createdAt: '2024-01-20T09:28:00Z' },
          { id: 'del-2', type: 'data', title: '시장분석_데이터.xlsx', summary: '경쟁사 비교 데이터', createdAt: '2024-01-20T09:28:00Z' },
        ],
        delegationSteps: [
          { agentId: 'agent-3', agentName: '리서치 박', status: 'done', startedAt: '2024-01-20T09:16:00Z', completedAt: '2024-01-20T09:20:00Z' },
          { agentId: 'agent-4', agentName: '데이터 이', status: 'done', startedAt: '2024-01-20T09:17:00Z', completedAt: '2024-01-20T09:22:00Z' },
        ],
        createdAt: '2024-01-20T09:28:00Z',
      },
      {
        id: 'msg-1-3',
        role: 'user',
        content: '좋습니다. 경쟁사 B의 최근 가격 정책 변화도 추가해주세요.',
        createdAt: '2024-01-20T09:30:00Z',
      },
      {
        id: 'msg-1-4',
        role: 'assistant',
        content: '경쟁사 B의 가격 정책 분석을 추가했습니다.\n\n## 경쟁사 B 가격 정책 변화\n- 기존: 월 $99/사용자\n- 변경: 월 $79/사용자 (20% 인하)\n- 배경: 시장 점유율 확대 전략으로 보임\n\n이에 대한 우리의 대응 전략도 보고서에 반영했습니다.',
        qualityGrade: 'A',
        cost: 0.10,
        durationMs: 12000,
        createdAt: '2024-01-20T09:32:00Z',
      },
    ],
  },
  {
    id: 'cmd-2',
    title: '오늘의 시장 브리핑',
    status: 'completed',
    assignedAgentId: 'agent-1',
    assignedAgentName: '비서실장 민',
    totalCost: 0.12,
    qualityGrade: 'A',
    createdAt: '2024-01-20T08:00:00Z',
    completedAt: '2024-01-20T08:05:00Z',
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: '오늘의 주요 시장 동향과 뉴스를 간략히 요약해주세요.',
        createdAt: '2024-01-20T08:00:00Z',
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: '## 오늘의 시장 브리핑 (2024.01.20)\n\n**주요 지수**\n- KOSPI: 2,450.32 (+1.2%)\n- NASDAQ: 15,320.45 (+0.8%)\n\n**주요 뉴스**\n1. AI 관련주 강세 지속\n2. 반도체 수출 호조\n3. 달러/원 환율 1,320원대 안정',
        qualityGrade: 'A',
        cost: 0.12,
        durationMs: 8000,
        createdAt: '2024-01-20T08:05:00Z',
      },
    ],
  },
  {
    id: 'cmd-3',
    title: '고객 피드백 분석 요청',
    status: 'processing',
    assignedAgentId: 'agent-4',
    assignedAgentName: '데이터 이',
    createdAt: '2024-01-20T10:00:00Z',
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        content: '최근 한 달간 수집된 고객 피드백을 분석하고, 주요 개선점을 도출해주세요.',
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        content: '고객 피드백 데이터를 분석 중입니다. 현재 1,234건의 피드백을 처리하고 있으며, 감성 분석과 주제 분류를 진행하고 있습니다...',
        delegationSteps: [
          { agentId: 'agent-3', agentName: '리서치 박', status: 'done', startedAt: '2024-01-20T10:01:00Z', completedAt: '2024-01-20T10:05:00Z' },
          { agentId: 'agent-4', agentName: '데이터 이', status: 'working', startedAt: '2024-01-20T10:02:00Z' },
        ],
        createdAt: '2024-01-20T10:02:00Z',
      },
    ],
  },
  {
    id: 'cmd-4',
    title: '신규 파트너십 제안서',
    status: 'queued',
    assignedAgentId: 'agent-2',
    assignedAgentName: '전략기획 김',
    createdAt: '2024-01-20T10:30:00Z',
    messages: [
      {
        id: 'msg-4-1',
        role: 'user',
        content: 'ABC 기업과의 전략적 파트너십 제안서를 작성해주세요. 양사의 시너지 효과와 구체적인 협력 방안을 포함해주세요.',
        createdAt: '2024-01-20T10:30:00Z',
      },
    ],
  },
  {
    id: 'cmd-5',
    title: 'SNS 콘텐츠 초안',
    status: 'failed',
    assignedAgentId: 'agent-5',
    assignedAgentName: '홍보 최',
    createdAt: '2024-01-19T14:00:00Z',
    messages: [
      {
        id: 'msg-5-1',
        role: 'user',
        content: '다음 주 SNS 게시물 5개의 초안을 작성해주세요.',
        createdAt: '2024-01-19T14:00:00Z',
      },
      {
        id: 'msg-5-2',
        role: 'system',
        content: '에이전트 연결 실패: 홍보 최 에이전트가 오프라인 상태입니다.',
        createdAt: '2024-01-19T14:01:00Z',
      },
    ],
  },
]
