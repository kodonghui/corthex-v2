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

        /* Log Table Styles */
        .log-table th {
            background-color: rgba(0, 0, 0, 0.5);
            font-weight: 500;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 1rem;
            text-align: left;
            position: sticky;
            top: 0;
            z-index: 10;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .log-table td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.875rem;
            vertical-align: middle;
        }

        .log-table tr:hover td {
            background-color: rgba(255, 255, 255, 0.02);
        }

        .log-table tr:last-child td {
            border-bottom: none;
        }
`;

function OpsLog() {
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
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Audit & History
                </div>
                <nav className="space-y-1">
                    <a href="/app/ops-log"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-list-alt w-4 text-accent-cyan"></i> <span>작업 로그 (Ops Log)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-chart-bar w-4"></i> <span>리포트 관리</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col overflow-hidden relative">
        <header
            className="p-8 pb-6 shrink-0 flex flex-col md:flex-row md:justify-between md:items-end border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
            <div>
                <h2 className="text-3xl font-semibold mb-2">에이전트 작업 로그</h2>
                {/* API: GET /api/workspace/logs */}
                <p className="text-white/40 text-sm">시스템 내 모든 에이전트와 사용자의 활동 내역을 감사(Audit) 목적으로 기록합니다.</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
                <button className="btn-glass"><i className="fas fa-download mr-2 text-white/50"></i>CSV 내보내기</button>
            </div>
        </header>

        {/* Filters & Search */}
        <div className="px-8 py-4 shrink-0 flex flex-wrap gap-4 border-b border-white/5 bg-black/20">
            <div className="relative w-64">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs"></i>
                <input type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/50 transition-colors placeholder-white/40"
                    placeholder="이벤트 ID, 메시지 검색..." />
            </div>

            <select
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none appearance-none pr-8 relative">
                <option value="">모든 주체 (Actor)</option>
                <option value="user">사용자 (Humans)</option>
                <option value="agent">에이전트 (AI)</option>
                <option value="system">시스템 (System)</option>
            </select>

            <select
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none appearance-none pr-8">
                <option value="">모든 수준 (Level)</option>
                <option value="info">정보 (INFO)</option>
                <option value="warn">경고 (WARN)</option>
                <option value="error">오류 (ERROR)</option>
                <option value="fatal">치명적 (FATAL)</option>
            </select>

            <button className="btn-icon"><i className="fas fa-calendar-alt text-white/50"></i> <span
                    className="text-sm ml-1 text-white/80">오늘</span></button>
        </div>

        {/* Log Table (API: GET /api/workspace/logs) */}
        <div className="flex-1 overflow-auto bg-[#0a0a0f]">
            <table className="w-full log-table whitespace-nowrap">
                <thead>
                    <tr>
                        <th className="w-48">Timestamp</th>
                        <th className="w-32">Level</th>
                        <th className="w-48">Actor</th>
                        <th>Event / Message</th>
                        <th className="w-32">Duration</th>
                        <th className="w-24 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="font-light text-white/80">

                    {/* INFO Log (Agent) */}
                    <tr>
                        <td className="font-mono text-white/50 text-xs">2026-10-27 14:32:01.442</td>
                        <td>
                            <span
                                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">INFO</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-robot text-accent-purple text-[10px]"></i>
                                <span className="text-sm">비서실장</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-white mb-0.5">Workflow <span
                                    className="text-accent-cyan font-mono text-xs">wf_marketing_q4</span> Triggered</div>
                            <div className="text-xs text-white/40">Initiated parallel execution for nodes: 정작가, 데이터분석가</div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">45ms</td>
                        <td className="text-right">
                            <button className="text-white/30 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        </td>
                    </tr>

                    {/* INFO Log (System) */}
                    <tr>
                        <td className="font-mono text-white/50 text-xs">2026-10-27 14:31:15.002</td>
                        <td>
                            <span
                                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">INFO</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-server text-white/40 text-[10px]"></i>
                                <span className="text-sm text-white/60">System Scheduler</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-white mb-0.5">Database Backup Completed</div>
                            <div className="text-xs text-white/40">S3 Bucket: corp-backup-seoul-1. Size: 4.2GB</div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">12.4s</td>
                        <td className="text-right">
                            <button className="text-white/30 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        </td>
                    </tr>

                    {/* WARN Log (API Limit) */}
                    <tr className="bg-yellow-400/5">
                        <td className="font-mono text-yellow-400/50 text-xs">2026-10-27 14:28:44.911</td>
                        <td>
                            <span
                                className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded text-[10px] font-mono">WARN</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-robot text-green-400 text-[10px]"></i>
                                <span className="text-sm">CS 매니저</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-yellow-400/90 mb-0.5">LLM API Rate Limit Approaching</div>
                            <div className="text-xs text-yellow-400/50">Anthropic Claude 3.5 Sonnet usage at 85% of tier
                                limit (15,200/20,000 TPM)</div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">12ms</td>
                        <td className="text-right">
                            <button className="text-white/30 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        </td>
                    </tr>

                    {/* ERROR Log (Agent fail) */}
                    <tr className="bg-red-500/5 border-l-2 border-l-red-500">
                        <td className="font-mono text-red-400/60 text-xs">2026-10-27 14:15:02.126</td>
                        <td>
                            <span
                                className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-mono shadow-[0_0_10px_rgba(239,68,68,0.3)]">ERROR</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-robot text-accent-cyan text-[10px]"></i>
                                <span className="text-sm">최데옵</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-red-400 mb-0.5">Tool Execution Failed: AWS_EC2_DESCRIBE</div>
                            <div
                                className="text-xs text-red-400/60 font-mono mt-1 bg-black/30 p-1.5 rounded border border-red-500/20 inline-block">
                                AccessDeniedException: User is not authorized to perform: ec2:DescribeInstances</div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">840ms</td>
                        <td className="text-right">
                            <button className="text-red-400 hover:text-red-300"><i className="fas fa-bug"></i></button>
                        </td>
                    </tr>

                    {/* INFO Log (User Action) */}
                    <tr>
                        <td className="font-mono text-white/50 text-xs">2026-10-27 14:02:11.005</td>
                        <td>
                            <span
                                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">INFO</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-user-circle text-white/60 text-[10px]"></i>
                                <span className="text-sm">elddl (Admin)</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-white mb-0.5">Credential Updated</div>
                            <div className="text-xs text-white/40">Rotated API key for: <span
                                    className="font-mono text-accent-cyan text-[10px]">cred_aws_prod</span></div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">156ms</td>
                        <td className="text-right">
                            <button className="text-white/30 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        </td>
                    </tr>

                    {/* INFO Log */}
                    <tr>
                        <td className="font-mono text-white/50 text-xs">2026-10-27 13:45:22.310</td>
                        <td>
                            <span
                                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">INFO</span>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-robot text-accent-cyan text-[10px]"></i>
                                <span className="text-sm">데이터분석가</span>
                            </div>
                        </td>
                        <td className="whitespace-normal min-w-[300px]">
                            <div className="text-white mb-0.5">Query Executed</div>
                            <div className="text-xs text-white/40">SELECT region, SUM(revenue) FROM sales_q3 GROUP BY
                                region; (Rows: 14)</div>
                        </td>
                        <td className="font-mono text-white/40 text-xs">1,245ms</td>
                        <td className="text-right">
                            <button className="text-white/30 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

    </main>
    </>
  );
}

export default OpsLog;
