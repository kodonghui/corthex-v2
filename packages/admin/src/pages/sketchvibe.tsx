/**
 * SketchVibe — Admin 전용 코드 분석 캔버스
 * Claude Code MCP CLI 연결을 통한 코드 시각화 + 편집
 * Phase 4에서 MCP 연동 예정. 현재는 캔버스 UI만 제공.
 */
import { Paintbrush, Terminal, Cpu, ArrowRight, Activity } from 'lucide-react'

export default function SketchVibePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
            <Paintbrush className="w-5 h-5 text-corthex-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-widest text-corthex-text-primary">
              SketchVibe
            </h1>
            <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-wider mt-0.5">
              Claude Code MCP CLI 연결을 통한 코드 분석 캔버스
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">STANDBY</span>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-corthex-surface border border-corthex-border p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Terminal className="w-4 h-4 text-corthex-accent" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
            MCP 연동 상태
          </h2>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          <span className="text-sm text-corthex-text-secondary">
            대기 중 — Claude Code MCP CLI 연결 필요
          </span>
        </div>
        <p className="text-xs text-corthex-text-disabled leading-relaxed">
          SketchVibe는 Claude Code에서 MCP CLI를 통해 코드를 분석하고, 그 결과를 캔버스에 시각화합니다.
          터미널에서 &quot;현재 engine/ 구조를 캔버스에 그려줘&quot;와 같은 명령으로 사용합니다.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-corthex-surface border border-corthex-border p-6 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-6">
          사용 방법
        </h2>
        <div className="space-y-4">
          {[
            { icon: Terminal, title: 'Claude Code에서 명령', desc: '"현재 engine/ 구조를 캔버스에 그려줘"' },
            { icon: Cpu, title: '코드 분석 + 시각화', desc: 'Claude가 코드를 읽고 실시간 다이어그램 생성' },
            { icon: Paintbrush, title: '캔버스에서 편집', desc: '노드 드래그, 연결 수정, 구조 변경' },
            { icon: ArrowRight, title: '코드에 반영', desc: '캔버스 변경사항을 코드에 자동 적용 (승인 후)' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center flex-shrink-0">
                <step.icon className="w-4 h-4 text-corthex-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-corthex-text-primary">{step.title}</p>
                <p className="text-xs font-mono text-corthex-text-secondary mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase info */}
      <div className="border border-corthex-border p-4 flex items-center gap-3">
        <Activity className="w-4 h-4 text-corthex-text-disabled flex-shrink-0" />
        <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-wider">
          Phase 4 — MCP 8-Stage Lifecycle 연동 후 캔버스 기능 활성화 예정
        </p>
      </div>
    </div>
  )
}
