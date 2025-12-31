
import React from 'react';
import { LayoutDashboard, FileText, ClipboardList, ShieldAlert, LogOut, UserCheck, ShieldCheck, Database as DatabaseIcon, Download } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSaveToPC: () => void;
  onImportFromPC: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, onSaveToPC, onImportFromPC }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases & Files', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: ClipboardList },
    { id: 'database', label: 'Database / Save', icon: DatabaseIcon },
    { id: 'reports', label: 'Reports', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-72 bg-emerald-900 text-white flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-800 rounded-lg flex items-center justify-center border border-emerald-700 flex-shrink-0">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[10px] font-black leading-tight uppercase text-white tracking-tight">Inspector General of Treasuries & Accounts</h1>
              <p className="text-[8px] text-emerald-300 uppercase tracking-widest font-bold mt-1">Finance Department, Sindh</p>
            </div>
          </div>
          
          <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-full"><UserCheck size={16} className="text-white" /></div>
            <div>
              <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider">Inspector General</p>
              <p className="text-xs font-black text-white uppercase">Kashif Almani</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg scale-[1.02]' 
                  : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-emerald-400'} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-800 space-y-4 text-center">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-red-700 hover:text-white transition-all group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">WARIS NAWAB PANHWAR</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="bg-white border-b px-8 py-4 sticky top-0 z-40 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{activeTab}</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors">
                Load from PC
                <input type="file" accept=".json" className="hidden" onChange={onImportFromPC} />
              </label>
              <button 
                onClick={onSaveToPC}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                <Download size={14} /> Save to PC (Backup)
              </button>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Authorized Portal</p>
              <p className="text-[11px] font-black text-emerald-700 uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
