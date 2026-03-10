"use client";
import React from "react";
import { ArrowLeft, Download, Eye, EyeOff, FileKey2, FileLock2, FileSpreadsheet, FileText, Key, Lock, Search, ShieldCheck, Upload } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-black text-gray-300 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-gold/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-gold/5 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-red/5 blur-[150px]; }
            
            .glass-panel { @apply bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-glass rounded-xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-accent-gold bg-accent-gold/5 border border-accent-gold/10 shadow-[inset_2px_0_0_0_rgba(251,191,36,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-black font-semibold hover:shadow-glow hover:opacity-90; }
            .btn-icon { @apply p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            /* Classified styling */
            .classified-badge { @apply absolute top-4 right-4 border border-accent-gold/30 text-accent-gold bg-accent-gold/10 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase; }
            .file-row { @apply flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors; }
            
            .scanline {
                width: 100%;
                height: 100px;
                z-index: 9999;
                position: absolute;
                pointer-events: none;
                background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(251,191,36,0.05) 50%, rgba(0,0,0,0) 100%);
                opacity: 0.1;
                animation: scanline 8s linear infinite;
            }
            @keyframes scanline {
                0% { top: -100px; }
                100% { top: 100%; }
            }
        }
`;

function Classified() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>
    <div className="scanline"></div>

    <aside className="w-64 border-r border-white/[0.05] bg-dark-200/50 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-gray-400">CORTHEX</h1>
            <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-500 border border-red-500/30">RESTRICTED</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/app/home" className="nav-item"><ArrowLeft className="w-4 h-4" /> Exit Vault</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-mono text-gray-600 uppercase tracking-widest mb-2 mt-4">Secure Storage</p>
                <a href="/app/credentials" className="nav-item"><Key className="w-4 h-4" /> API
                    Credentials</a>
                <a href="/app/classified" className="nav-item active"><FileLock2 className="w-4 h-4" />
                    Classified Files</a>
            </div>
        </div>

        <div className="p-4 border-t border-white/5">
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] text-red-400 font-mono text-center">ACCESS LOGGED AND MONITORED</p>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden bg-dot-pattern">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-200/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-accent-gold font-mono tracking-wide"><Lock
                        className="w-4 h-4 inline mr-2" /> LEVEL 5 ENCRYPTED VAULT</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5 px-6 font-mono"><Upload
                        className="w-3 h-3" /> SECURE UPLOAD</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide flex gap-10 max-w-7xl mx-auto w-full">

            <div className="flex-1 flex flex-col">

                <h2 className="text-2xl font-light text-white mb-2">Confidential Assets</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-2xl">Files in this vault are encrypted at rest using
                    AES-256-GCM. Contents are only accessible to authorized personnel with Level 5 clearance. Access
                    attempts are permanently logged.</p>

                {/* Vault File List (API: GET /api/workspace/classified/vault) */}
                <div className="glass-panel border-white/10 relative">
                    <div className="classified-badge">Top Secret</div>

                    <div className="p-6 border-b border-white/5 flex gap-4 bg-dark-100/50">
                        <div className="relative flex-1 max-w-md">
                            <Search
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input type="text" placeholder="Decrypt & Search Index..."
                                className="w-full bg-dark-300 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-accent-gold font-mono placeholder-gray-600 focus:outline-none focus:border-accent-gold/50" />
                        </div>
                    </div>

                    <div className="flex flex-col">

                        {/* File 1 */}
                        <div className="file-row bg-dark-200/50 hover:bg-white/[0.03]">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex-center text-red-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white font-mono mb-0.5">
                                        Project_Phoenix_Briefing.pdf</h4>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span>4.2 MB</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><ShieldCheck
                                                className="w-3 h-3 text-emerald-500" /> Encrypted</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-gray-600 font-mono">Last accessed: 2d ago by CEO</span>
                                <div className="flex gap-2">
                                    <button className="btn-icon p-1.5 hover:text-accent-gold"><Eye
                                            className="w-4 h-4" /></button>
                                    <button className="btn-icon p-1.5 hover:text-white border border-white/10"><Download className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* File 2 */}
                        <div className="file-row bg-dark-200/50 hover:bg-white/[0.03]">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-center text-blue-400">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 font-mono mb-0.5">
                                        Q4_Board_Financials_Draft.xlsx</h4>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span>1.8 MB</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><ShieldCheck
                                                className="w-3 h-3 text-emerald-500" /> Encrypted</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-gray-600 font-mono">Last accessed: 1h ago by CFO</span>
                                <div className="flex gap-2">
                                    <button className="btn-icon p-1.5 hover:text-accent-gold"><Eye
                                            className="w-4 h-4" /></button>
                                    <button className="btn-icon p-1.5 hover:text-white border border-white/10"><Download className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* File 3 */}
                        <div className="file-row bg-dark-200/50 hover:bg-white/[0.03]">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex-center text-accent-gold">
                                    <FileKey2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 font-mono mb-0.5">Master_PGP_Keys.asc
                                    </h4>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span>12 KB</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><ShieldCheck
                                                className="w-3 h-3 text-emerald-500" /> Deep Archive Vault</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-gray-600 font-mono">Last accessed: 184d ago by Root</span>
                                <div className="flex gap-2">
                                    <button className="btn-icon p-1.5 hover:text-accent-gold" disabled><EyeOff className="w-4 h-4 opacity-50" /></button>
                                    <button className="btn-icon p-1.5 hover:text-white border border-white/10"><Download className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div
                        className="p-4 bg-dark-100 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                        <span>End of Vault Index</span>
                        <span>Auto-lock in: <span className="text-accent-gold">04:59</span></span>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Classified;
