export interface DocTemplate {
  id: string
  name: string
  description: string
  contentType: 'markdown'
  defaultContent: string
  defaultTags: string[]
}

export const KNOWLEDGE_TEMPLATES: DocTemplate[] = [
  {
    id: 'meeting-notes',
    name: '회의록',
    description: '회의 내용, 참석자, 결정사항을 기록하는 템플릿',
    contentType: 'markdown',
    defaultContent: `# 회의록

## 기본 정보
- **일시**: {{date}}
- **참석자**:
- **장소/채널**:

## 안건

### 1.

## 논의 내용

## 결정 사항
- [ ]

## 후속 조치 (Action Items)
| 담당자 | 내용 | 기한 |
|--------|------|------|
|        |      |      |
`,
    defaultTags: ['회의록', '기록'],
  },
  {
    id: 'project-plan',
    name: '프로젝트 계획',
    description: '프로젝트 목표, 일정, 리소스를 정리하는 템플릿',
    contentType: 'markdown',
    defaultContent: `# 프로젝트 계획서

## 프로젝트 개요
- **프로젝트명**:
- **시작일**: {{date}}
- **종료 예정일**:
- **담당자**:

## 목표
1.

## 주요 마일스톤
| 마일스톤 | 예정일 | 상태 |
|----------|--------|------|
|          |        | 대기 |

## 리소스
- **인원**:
- **예산**:
- **도구**:

## 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
|        |        |           |
`,
    defaultTags: ['프로젝트', '계획'],
  },
  {
    id: 'weekly-report',
    name: '주간 보고서',
    description: '주간 업무 성과와 다음 주 계획을 정리하는 템플릿',
    contentType: 'markdown',
    defaultContent: `# 주간 보고서

## 기본 정보
- **기간**: {{date}} ~
- **작성자**:
- **부서**:

## 이번 주 성과
1.

## 미완료 사항
1.

## 다음 주 계획
1.

## 이슈 및 건의 사항
-
`,
    defaultTags: ['주간보고', '보고서'],
  },
  {
    id: 'decision-record',
    name: '의사결정 기록',
    description: '중요 의사결정의 배경, 대안, 결과를 기록하는 템플릿',
    contentType: 'markdown',
    defaultContent: `# 의사결정 기록 (ADR)

## 상태
**결정됨** | {{date}}

## 맥락
> 이 결정이 필요한 배경과 상황을 설명합니다.

## 고려한 대안
### 대안 1:
- 장점:
- 단점:

### 대안 2:
- 장점:
- 단점:

## 결정
> 최종 선택한 대안과 그 이유를 설명합니다.

## 결과
> 이 결정으로 인해 예상되는 영향과 후속 조치를 설명합니다.
`,
    defaultTags: ['의사결정', 'ADR'],
  },
  {
    id: 'incident-report',
    name: '장애 보고서',
    description: '시스템 장애 발생 시 원인, 영향, 대응을 기록하는 템플릿',
    contentType: 'markdown',
    defaultContent: `# 장애 보고서

## 기본 정보
- **발생 일시**: {{date}}
- **복구 일시**:
- **심각도**: P1 / P2 / P3
- **영향 범위**:

## 타임라인
| 시간 | 상황 |
|------|------|
|      |      |

## 근본 원인
> 장애의 근본적인 원인을 설명합니다.

## 대응 조치
1.

## 재발 방지 대책
- [ ]

## 교훈
-
`,
    defaultTags: ['장애', '인시던트', '보고서'],
  },
]
