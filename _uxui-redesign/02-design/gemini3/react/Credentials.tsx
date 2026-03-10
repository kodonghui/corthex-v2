"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            line-height: 1.5;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
            background: transparent;
            border: 1px solid transparent;
            color: #9ca3af;
            border-radius: 0.5rem;
            padding: 0.5rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-icon:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .vault-grid {
            background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 20px 20px;
        }

        .credential-card {
            background: linear-gradient(180deg, rgba(21, 21, 37, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }

        .credential-card:hover {
            border-color: rgba(34, 211, 238, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 211, 238, 0.1);
            transform: translateY(-2px);
        }
`;

function Credentials() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Resources</div>
                <nav className="space-y-1">
                    <a href="/app/credentials"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-key w-4 text-accent-cyan"></i> <span>자격 증명 (API 키)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-database w-4"></i> <span>연동 데이터 소스</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8 relative vault-grid">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-semibold mb-1 flex items-center gap-3">
                    보안 금고 (Vault) <i className="fas fa-shield-alt text-accent-purple text-xl"></i>
                </h2>
                {/* API: GET /api/workspace/credentials */}
                <p className="text-white/40 text-sm">에이전트들이 외부 서비스와 통신하기 위해 사용하는 API 키와 인증 정보를 안전하게 관리합니다.</p>
            </div>
            <div className="flex gap-2">
                <button className="btn-glass"><i className="fas fa-lock text-xs mr-2 text-white/50"></i>전체 잠금</button>
                <button className="btn-primary"><i className="fas fa-plus mr-2 text-xs"></i>새 자격증명 등록</button>
            </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-5 bg-white/5 border-l-2 border-l-accent-cyan rounded-l-none">
                <div className="text-white/40 text-xs mb-1">활성 키 (Active Keys)</div>
                <div className="text-2xl num-bold text-white">12 <span className="text-sm font-normal text-white/30 ml-1">/
                        15</span></div>
            </div>
            <div className="glass-panel p-5 bg-white/5 border-l-2 border-l-yellow-400 rounded-l-none">
                <div className="text-white/40 text-xs mb-1">만료 임박 (Expiring Soon)</div>
                <div className="text-2xl num-bold text-yellow-400">2 <span
                        className="text-sm font-normal text-white/30 ml-1">keys</span></div>
            </div>
            <div className="glass-panel p-5 bg-white/5 border-l-2 border-l-red-500 rounded-l-none">
                <div className="text-white/40 text-xs mb-1">경고/오류 (Alerts)</div>
                <div className="text-2xl num-bold text-white">0</div>
            </div>
        </div>

        {/* Filter/Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
            <button
                className="text-accent-cyan font-medium text-sm px-2 relative after:content-[''] after:absolute after:-bottom-[17px] after:left-0 after:w-full after:h-0.5 after:bg-accent-cyan">LLM
                Providers</button>
            <button className="text-white/50 hover:text-white transition-colors text-sm px-2">Cloud / Infra</button>
            <button className="text-white/50 hover:text-white transition-colors text-sm px-2">SaaS / Tools</button>
            <button className="text-white/50 hover:text-white transition-colors text-sm px-2">Database</button>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* OpenAI Credential Card */}
            <div className="credential-card rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-transparent opacity-50">
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center p-2.5">
                            {/* Placeholder for logo, using FA */}
                            <i className="fas fa-brain text-white/80 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                OpenAI API <i className="fas fa-check-circle text-green-400 text-xs" title="연결 정상"></i>
                            </h3>
                            <div className="flex gap-2 mt-1">
                                <span
                                    className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">Production</span>
                                <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded">ID:
                                    cred_882a</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-icon !p-1.5"><i className="fas fa-ellipsis-v"></i></button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <div className="text-xs text-white/40 mb-1.5">API Key (sk-proj-...)</div>
                        <div className="flex items-center gap-2">
                            <input type="password" value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
                                className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-green-400 font-mono tracking-widest focus:outline-none"
                                readOnly />
                            <button className="btn-glass !p-2" title="보기/숨기기"><i
                                    className="fas fa-eye text-white/50"></i></button>
                            <button className="btn-glass !p-2" title="복사"><i className="fas fa-copy text-white/50"></i></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-white/40 mb-1">접근 권한 (에이전트)</div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-base-200 border border-white/20 flex items-center justify-center text-[8px]"
                                    title="비서실장">🤖</div>
                                <div className="w-6 h-6 rounded-full bg-base-200 border border-white/20 flex items-center justify-center text-[8px]"
                                    title="데이터분석가">📊</div>
                                <div
                                    className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                    +4</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/40 mb-1">월 지출 한도 (Hard Limit)</div>
                            <div className="text-sm font-medium text-white">$ 1,000.00</div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-white/40">마지막 사용: <span className="text-white/60">2분 전</span></div>
                    <button className="text-xs text-accent-cyan hover:underline">상세 설정</button>
                </div>
            </div>

            {/* Anthropic Credential Card */}
            <div className="credential-card rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-transparent opacity-50">
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-lg bg-[#d97757]/10 border border-[#d97757]/30 flex items-center justify-center p-2.5">
                            <span className="font-bold text-[#d97757] text-xl">A</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                Anthropic (Claude) <i className="fas fa-check-circle text-green-400 text-xs"></i>
                            </h3>
                            <div className="flex gap-2 mt-1">
                                <span
                                    className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">Production</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-icon !p-1.5"><i className="fas fa-ellipsis-v"></i></button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <div className="text-xs text-white/40 mb-1.5">API Key (sk-ant-...)</div>
                        <div className="flex items-center gap-2">
                            <input type="password" value="sk-ant-1234567890abcdefghijklmnopqrstuvwxyz"
                                className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-green-400 font-mono tracking-widest focus:outline-none"
                                readOnly />
                            <button className="btn-glass !p-2" title="보기/숨기기"><i
                                    className="fas fa-eye text-white/50"></i></button>
                            <button className="btn-glass !p-2" title="복사"><i className="fas fa-copy text-white/50"></i></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-white/40 mb-1">접근 권한 (에이전트)</div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-base-200 border border-white/20 flex items-center justify-center text-[8px]"
                                    title="정작가">✍️</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/40 mb-1">월 지출 한도 (Hard Limit)</div>
                            <div className="text-sm font-medium text-white/40 italic">제한 없음</div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-white/40">마지막 사용: <span className="text-white/60">어제</span></div>
                    <button className="text-xs text-accent-cyan hover:underline">상세 설정</button>
                </div>
            </div>

            {/* AWS Credential Card */}
            <div className="credential-card rounded-xl p-6 relative overflow-hidden group opacity-60">
                <div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-transparent opacity-50">
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center p-2.5">
                            <i className="fab fa-aws text-[#FF9900] text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                AWS IAM User <i className="fas fa-exclamation-triangle text-yellow-400 text-xs"></i>
                            </h3>
                            <div className="flex gap-2 mt-1">
                                <span
                                    className="bg-gray-500/20 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-500/30">Dev/Test</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-icon !p-1.5"><i className="fas fa-ellipsis-v"></i></button>
                </div>

                <div className="space-y-4 mb-6">
                    <div
                        className="bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-lg text-xs text-yellow-400/80 mb-2">
                        <i className="fas fa-info-circle mr-1"></i> 이 키는 3일 후 만료됩니다. 시스템 중단을 방지하려면 교체(Rotate)하십시오.
                    </div>

                    <div>
                        <div className="text-xs text-white/40 mb-1.5">Access Key ID</div>
                        <div className="flex items-center gap-2 mb-3">
                            <input type="text" value="AKIAIOSFODNN7EXAMPLE"
                                className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-yellow-400 font-mono focus:outline-none"
                                readOnly />
                            <button className="btn-glass !p-2"><i className="fas fa-copy text-white/50"></i></button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                    <button
                        className="btn-glass !py-1 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10 text-xs">Key
                        Rotate</button>
                    <button className="text-xs text-accent-cyan hover:underline">상세 설정</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Credentials;
