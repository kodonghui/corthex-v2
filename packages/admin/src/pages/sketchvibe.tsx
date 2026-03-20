/**
 * SketchVibe — Admin 전용 코드 분석 캔버스
 * Claude Code MCP CLI 연결을 통한 코드 시각화 + 편집
 * Phase 4에서 MCP 연동 예정. 현재는 캔버스 UI만 제공.
 */
import { olive, oliveBg, cream, sand, warmBrown, muted, terracotta } from '../lib/colors'
import { Paintbrush, Terminal, Cpu, ArrowRight } from 'lucide-react'

export default function SketchVibePage() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: cream, fontFamily: "'Pretendard', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
            <Paintbrush className="w-6 h-6" style={{ color: olive }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>
              SketchVibe
            </h1>
            <p className="text-sm" style={{ color: muted }}>
              Claude Code MCP CLI 연결을 통한 코드 분석 캔버스
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: sand }}>
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5" style={{ color: terracotta }} />
            <h2 className="text-lg font-bold" style={{ color: warmBrown }}>MCP 연동 상태</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm" style={{ color: muted }}>대기 중 — Claude Code MCP CLI 연결 필요</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: muted }}>
            SketchVibe는 Claude Code에서 MCP CLI를 통해 코드를 분석하고, 그 결과를 캔버스에 시각화합니다.
            터미널에서 &quot;현재 engine/ 구조를 캔버스에 그려줘&quot;와 같은 명령으로 사용합니다.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: sand }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: warmBrown }}>사용 방법</h2>
          <div className="space-y-4">
            {[
              { icon: Terminal, title: 'Claude Code에서 명령', desc: '"현재 engine/ 구조를 캔버스에 그려줘"' },
              { icon: Cpu, title: '코드 분석 + 시각화', desc: 'Claude가 코드를 읽고 실시간 다이어그램 생성' },
              { icon: Paintbrush, title: '캔버스에서 편집', desc: '노드 드래그, 연결 수정, 구조 변경' },
              { icon: ArrowRight, title: '코드에 반영', desc: '캔버스 변경사항을 코드에 자동 적용 (승인 후)' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: oliveBg }}>
                  <step.icon className="w-4 h-4" style={{ color: olive }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: warmBrown }}>{step.title}</p>
                  <p className="text-xs" style={{ color: muted }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase info */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: muted }}>
            Phase 4 — MCP 8-Stage Lifecycle 연동 후 캔버스 기능 활성화 예정
          </p>
        </div>
      </div>
    </div>
  )
}
