"use client";
import React from "react";

const styles = `
body {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            -webkit-font-smoothing: antialiased;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        .font-serif {
            font-family: inherit /* FIXME: theme value not in map */;
            letter-spacing: -0.02em;
        }

        .card {
            background-color: inherit /* FIXME: theme value not in map */;
            border-radius: inherit /* FIXME: theme value not in map */;
            box-shadow: inherit /* FIXME: theme value not in map */;
            padding: 1.5rem;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            transition: box-shadow 0.3s ease;
        }

        .card:hover {
            box-shadow: inherit /* FIXME: theme value not in map */;
        }

        .btn-primary {
            background-color: inherit /* FIXME: theme value not in map */;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 2px 8px inherit /* FIXME: theme value not in map */;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-primary:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(90, 114, 71, 0.3);
        }

        .btn-secondary {
            background-color: inherit /* FIXME: theme value not in map */;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s ease-in-out;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-secondary:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            transform: translateY(-1px);
        }

        .btn-outline {
            background-color: transparent;
            color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            padding: 0.75rem 1.5rem;
            border-radius: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-outline:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
        }

        .btn-icon {
            padding: 0.5rem;
            border-radius: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            transition: all 0.2s;
        }

        .btn-icon:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: inherit /* FIXME: theme value not in map */;
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            transition: all 0.2s;
            font-family: inherit /* FIXME: theme value not in map */;
        }

        .input-field:focus {
            outline: none;
            border-color: inherit /* FIXME: theme value not in map */;
            box-shadow: 0 0 0 3px inherit /* FIXME: theme value not in map */;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .badge-primary {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .badge-accent {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: inherit /* FIXME: theme value not in map */;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: inherit /* FIXME: theme value not in map */;
        }
`;

function DesignSystem() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header className="border-b border-border pb-8">
        <h1 className="text-4xl font-serif text-text-main mb-4">CORTHEX v2 Design System</h1>
        <p className="text-lg text-text-muted font-sans max-w-2xl leading-relaxed">
            "Natural Organic" 디자인 방향성. Notion, Things 3, Bear App에서 영감을 받아 따뜻하고 편안한 느낌을 주는 B2B SaaS UI입니다.
        </p>
    </header>

    <section>
        <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary block"></span> Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Backgrounds */}
            <div className="space-y-2">
                <div
                    className="h-24 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-text-muted">#faf8f5</span>
                </div>
                <p className="text-sm font-medium">Background Base</p>
            </div>
            <div className="space-y-2">
                <div
                    className="h-24 rounded-xl bg-background-alt border border-border flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-text-muted">#f5f0eb</span>
                </div>
                <p className="text-sm font-medium">Background Alt</p>
            </div>
            {/* Surface */}
            <div className="space-y-2">
                <div
                    className="h-24 rounded-xl bg-surface border border-border flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium text-text-muted">#ffffff</span>
                </div>
                <p className="text-sm font-medium">Card Surface</p>
            </div>
            {/* Primary */}
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-primary flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium text-white/90">#5a7247</span>
                </div>
                <p className="text-sm font-medium">Olive Green</p>
            </div>
            {/* Secondary */}
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-secondary flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium text-white/90">#c4622d</span>
                </div>
                <p className="text-sm font-medium">Terracotta</p>
            </div>
            {/* Accent */}
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-accent flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium text-white/90">#d4a843</span>
                </div>
                <p className="text-sm font-medium">Mustard</p>
            </div>

            {/* Text Colors */}
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-text-main flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-white/90">#2d2c2a</span>
                </div>
                <p className="text-sm font-medium">Text Main</p>
            </div>
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-text-muted flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-white/90">#73706c</span>
                </div>
                <p className="text-sm font-medium">Text Muted</p>
            </div>
        </div>
    </section>

    <section>
        <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-secondary block"></span> Typography
        </h2>
        <div className="card space-y-8">
            <div className="pb-6 border-b border-border">
                <p className="text-sm text-text-light mb-2 uppercase tracking-wide">Heading 1 (Serif)</p>
                <h1 className="text-4xl md:text-5xl font-serif">자연스럽고 편안한 업무 경험</h1>
            </div>
            <div className="pb-6 border-b border-border">
                <p className="text-sm text-text-light mb-2 uppercase tracking-wide">Heading 2 (Serif)</p>
                <h2 className="text-3xl font-serif">조직도 및 부서 관리</h2>
            </div>
            <div className="pb-6 border-b border-border">
                <p className="text-sm text-text-light mb-2 uppercase tracking-wide">Heading 3 (Serif)</p>
                <h3 className="text-xl font-serif">새로운 워크플로우 생성</h3>
            </div>
            <div className="pb-6 border-b border-border">
                <p className="text-sm text-text-light mb-2 uppercase tracking-wide">Body Text (Sans-serif)</p>
                <p className="text-base leading-relaxed text-text-muted max-w-3xl">
                    CORTHEX v2는 복잡한 B2B 솔루션의 무거운 느낌을 덜어내고, 사용자가 편안하게 시스템을 사용할 수 있도록 디자인되었습니다. 부드러운 여백과 따뜻한 색감은 장시간 화면을
                    보는 실무자의 피로도를 낮춥니다.
                </p>
            </div>
            <div>
                <p className="text-sm text-text-light mb-2 uppercase tracking-wide">Small Text (Sans-serif)</p>
                <p className="text-sm text-text-muted">마지막 업데이트: 2026년 3월 10일 오후 7시 45분</p>
            </div>
        </div>
    </section>

    <section>
        <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent block"></span> UI Components
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Buttons & Badges */}
            <div className="card space-y-8">
                <div>
                    <h3 className="font-serif text-lg mb-4">Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                        <button className="btn-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 4v16m8-8H4"></path>
                            </svg>
                            새 에이전트 생성
                        </button>
                        <button className="btn-secondary">
                            결제 업데이트
                        </button>
                        <button className="btn-outline">
                            취소
                        </button>
                        <button className="btn-outline text-red-600 hover:bg-red-50 hover:border-red-200">
                            삭제
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="font-serif text-lg mb-4">Badges & Tags</h3>
                    <div className="flex flex-wrap gap-3">
                        <span className="badge badge-primary">활성 상태</span>
                        <span className="badge badge-accent">검토 대기중</span>
                        <span className="badge bg-background-alt text-text-muted">보관됨</span>
                    </div>
                </div>
            </div>

            {/* Form Elements */}
            <div className="card space-y-6">
                <h3 className="font-serif text-lg mb-2">Form Elements</h3>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">에이전트 이름</label>
                    <input type="text" className="input-field" placeholder="ex. 데이터 분석가 알파" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">설명</label>
                    <textarea className="input-field min-h-[100px] resize-y"
                        placeholder="에이전트의 역할과 권한을 간단히 적어주세요..."></textarea>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="check1"
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-border" />
                    <label htmlFor="check1" className="text-sm text-text-main">공용 템플릿으로 저장하기</label>
                </div>
            </div>
        </div>
    </section>

    <section>
        <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full border border-border block"></span> Card Layouts
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Data Card */}
            <div className="card group cursor-pointer border border-transparent hover:border-border transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-4 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                            </path>
                        </svg>
                    </div>
                    <button className="btn-icon p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                            </path>
                        </svg>
                    </button>
                </div>
                <h3 className="text-xl font-serif text-text-main mb-2">분석 리포트 생성기</h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                    월간 매출 데이터 포맷을 정제하고 슬랙으로 자동 발송하는 역할을 수행합니다.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="badge badge-primary">활성</span>
                    <span className="text-xs text-text-light flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        3분 전 업데이트
                    </span>
                </div>
            </div>

            {/* Dashboard Metric Card */}
            <div className="card flex flex-col justify-center">
                <p className="text-sm font-medium text-text-muted mb-1">이번 달 사용 금액</p>
                <div className="flex items-baseline gap-2 mb-2">
                    <h2 className="text-4xl font-serif text-text-main">₩1,245,000</h2>
                    <span className="text-sm font-medium text-red-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        +12%
                    </span>
                </div>
                <p className="text-sm text-text-light mt-4">예상 청구 금액: ₩1,500,000</p>
            </div>
        </div>
    </section>
    </>
  );
}

export default DesignSystem;
