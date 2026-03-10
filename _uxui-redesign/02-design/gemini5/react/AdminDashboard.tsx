"use client";
import React from "react";

const styles = `
body {
            background-color: #000000;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }
        
        /* Admin specific styling usually has a distinct top nav or border */
        .admin-border {
            border-top: 4px solid #fff;
        }

        .metric-card {
            border: 1px solid #333;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
`;

function AdminDashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="flex justify-between items-center px-16 py-8 border-b border-mono-800 sticky top-0 bg-mono-900 z-50">
        <div className="flex items-center gap-8">
            <a href="/admin/dashboard" className="text-h2 font-bold tracking-tighter hover:text-mono-400 transition-colors">CORTHEX</a>
            <div className="text-caption text-mono-900 uppercase tracking-widest bg-mono-100 px-3 py-1 font-bold">
                WORKSPACE ADMIN
            </div>
        </div>
        
        <div className="flex gap-8 text-caption font-mono uppercase tracking-widest text-mono-500 items-center">
            <a href="/app/home" className="hover:text-mono-100 transition-colors">EXIT BACK TO APP -></a>
        </div>
    </nav>

    <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
        
        {/* Left Sidebar: Admin Navigation */}
        <aside className="lg:col-span-3 border-r border-mono-800 p-16 pt-32 lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] overflow-y-auto">
            
            <div className="space-y-12 text-body-s font-mono uppercase tracking-widest">
                
                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Overview</h3>
                    <ul className="space-y-4">
                        <li><a href="/admin/dashboard" className="text-mono-100 font-bold border-l-2 border-mono-100 pl-3 -ml-4 block">Dashboard</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Monitoring</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Organization</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Agents</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Departments</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Employees</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Org Chart</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Resources</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Credentials & API Keys</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Tools</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Costs & Billing</a></li>
                    </ul>
                </div>
                
                 <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Marketplace</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Soul Templates</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Agent Market</a></li>
                    </ul>
                </div>

            </div>
        </aside>

        {/* Right Content: Dashboard */}
        <section className="lg:col-span-9 p-16 lg:px-32 pt-32 pb-32">
            
            <header className="mb-section pb-16 border-b border-mono-800 flex justify-between items-end">
                <div>
                    <div className="text-mono-500 font-mono text-caption uppercase tracking-widest mb-6">Workspace: ACME Corp</div>
                    <h1 className="text-hero leading-tight tracking-tighter">Admin Overview</h1>
                </div>
                <div className="text-right font-mono text-caption uppercase tracking-widest text-mono-500 space-y-2">
                    <div>PLAN: <span className="text-mono-100">ENTERPRISE</span></div>
                    <div>STATUS: <span className="text-status-green mix-blend-screen">ACTIVE</span></div>
                </div>
            </header>

            {/* Key Metrics */}
            {/* API: GET /api/admin/dashboard/metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-section">
                
                <div className="metric-card">
                    <div className="font-mono text-caption text-mono-500 uppercase tracking-widest mb-12">Active Agents</div>
                    <div>
                        <div className="text-[4rem] font-bold leading-none tracking-tighter font-mono">142</div>
                        <div className="mt-4 font-mono text-caption text-mono-600 uppercase tracking-widest">/ Limit: 500</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="font-mono text-caption text-mono-500 uppercase tracking-widest mb-12">MTD Compute Spend</div>
                    <div>
                        <div className="text-[4rem] font-bold leading-none tracking-tighter font-mono">$4.2<span className="text-h1 text-mono-500">K</span></div>
                        <div className="mt-4 font-mono text-caption text-status-red uppercase tracking-widest">+18% vs Last Month</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="font-mono text-caption text-mono-500 uppercase tracking-widest mb-12">System Health</div>
                    <div>
                        <div className="text-[4rem] font-bold leading-none tracking-tighter font-mono text-status-green mix-blend-screen">100<span className="text-h1 opacity-50">%</span></div>
                        <div className="mt-4 font-mono text-caption text-mono-600 uppercase tracking-widest">All Services Operational</div>
                    </div>
                </div>

            </div>

            {/* Recent Activity / Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
                
                {/* Admin Audit Log */}
                {/* API: GET /api/admin/audit-log */}
                <div>
                    <h2 className="text-mono-600 text-caption tracking-widest uppercase mb-8 font-mono border-b border-mono-800 pb-2 flex justify-between">
                        <span>Recent Admin Actions</span>
                        <a href="#" className="hover:text-mono-100 transition-colors">VIEW ALL -></a>
                    </h2>
                    
                    <ul className="space-y-6 font-mono text-body-s">
                        <li className="group cursor-pointer">
                            <div className="text-mono-500 mb-1 text-[10px] uppercase tracking-widest">Today 14:22 | By: CEO</div>
                            <div className="text-mono-100 group-hover:underline decoration-mono-600 underline-offset-4">Created new Department 'Global Expansion TF'</div>
                        </li>
                        <li className="group cursor-pointer">
                            <div className="text-mono-500 mb-1 text-[10px] uppercase tracking-widest">Yesterday 09:15 | By: SYSTEM</div>
                            <div className="text-mono-100 group-hover:underline decoration-mono-600 underline-offset-4">Auto-scaled Agent 'DATA_CRAWLER' instances to 5.</div>
                        </li>
                        <li className="group cursor-pointer">
                            <div className="text-mono-500 mb-1 text-[10px] uppercase tracking-widest">Mar 08 17:40 | By: IT_ADMIN</div>
                            <div className="text-mono-100 group-hover:underline decoration-mono-600 underline-offset-4">Revoked API Key (AWS_PROD_READ) from '마케팅팀'.</div>
                        </li>
                    </ul>
                </div>

                {/* Usage Warnings */}
                <div>
                    <h2 className="text-mono-600 text-caption tracking-widest uppercase mb-8 font-mono border-b border-mono-800 pb-2">Resource Warnings</h2>
                    
                    <ul className="space-y-6 font-mono text-body-s">
                        <li className="flex gap-4 items-start p-4 border border-mono-800 bg-mono-900 group cursor-pointer hover:border-mono-600 transition-colors">
                            <span className="text-status-red mt-1">!</span>
                            <div>
                                <div className="text-mono-100 mb-1 tracking-widest uppercase text-caption">Database Storage at 85%</div>
                                <div className="text-mono-400">Vector DB 'V-1536' requires scaling soon. Recommend adding 500GB volume.</div>
                            </div>
                        </li>
                        <li className="flex gap-4 items-start p-4 border border-mono-800 bg-mono-900 group cursor-pointer hover:border-mono-600 transition-colors">
                            <span className="text-mono-400 mt-1">i</span>
                            <div>
                                <div className="text-mono-100 mb-1 tracking-widest uppercase text-caption">Unused Agent Detected</div>
                                <div className="text-mono-400">Agent 'TEMP_TESTER' has 0 invocations in 30 days. Consider terminating to save costs.</div>
                            </div>
                        </li>
                    </ul>
                </div>

            </div>

        </section>
    </main>
    </>
  );
}

export default AdminDashboard;
