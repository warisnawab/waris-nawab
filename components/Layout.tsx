
import React from 'react';
import { LayoutDashboard, FileText, ClipboardList, ShieldAlert, Settings, LogOut, UserCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases & Files', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-emerald-900 text-white flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-inner flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-700">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 60 L30 75 L35 55 L20 40 L40 40 Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-[10px] font-black leading-tight uppercase text-white tracking-tight">Inspector General of Treasuries & Accounts</h1>
              <p className="text-[8px] text-emerald-300 uppercase tracking-widest font-bold mt-1">Finance Department, Sindh</p>
            </div>
          </div>
          
          <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-full">
              <UserCheck size={16} className="text-white" />
            </div>
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

        <div className="p-4 border-t border-emerald-800 space-y-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-red-700 hover:text-white transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
          
          <div className="text-center">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">MADE BY WARIS NAWAB PANHWAR</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="bg-white border-b px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-black uppercase">Government of Sindh</p>
              <p className="text-xs font-black text-emerald-700 uppercase">Finance Department | IG Treasuries & Accounts</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-4">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-md border border-emerald-200 shadow-sm uppercase tracking-widest">Administrator</span>
              <div className="text-sm text-gray-500 font-medium">{new Date().toLocaleDateString('en-GB', { dateStyle: 'long' })}</div>
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
