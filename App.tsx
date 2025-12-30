
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseDetails from './components/CaseDetails';
import { IGCase, CaseType, InitiationSource } from './types';
import { AlertCircle, X, CheckCircle2, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { DISTRICTS, CASE_TYPES, INITIATION_SOURCES } from './constants';

const MOCK_CASES: IGCase[] = Array.from({ length: 16 }, (_, i) => {
  const types: CaseType[] = ['Complaint', 'Inquiry', 'Inspection', 'Monitoring'];
  const type = types[i % 4];
  return {
    id: `IGTA/${type.toUpperCase()}/2024/${(i + 1).toString().padStart(3, '0')}`,
    type: type,
    source: i % 2 === 0 ? 'Finance' : 'DAO',
    dateReceived: `2024-0${(i % 5) + 1}-10`,
    district: i % 2 === 0 ? 'Karachi South' : 'Hyderabad',
    officeConcerned: i % 2 === 0 ? 'DAO Karachi' : 'Treasury Office Hyderabad',
    assignedDIG: 'DIG HQ',
    assignedAIGs: ['AIG Inspection'],
    status: i === 0 ? 'Letter sent to concerned' : i === 1 ? 'Decision sent to Finance Department' : 'No action taken/necessary',
    daysPending: (i + 1) * 7,
    slaBreach: (i + 1) * 7 > 20,
    cooperative: i % 4 !== 0,
    internalNotes: 'Initial check completed. Finance Department is tracking this closely.',
    externalFiles: [
      { source: 'Finance', fileNumber: 'FD/CASE/123', letterRef: 'REF-889', date: '2024-01-05', remarks: 'High priority' }
    ],
    officers: [
      { name: 'Sajid Ali', designation: 'AIG', department: 'IGTA', district: 'Sindh', role: 'Primary' }
    ],
    communications: [
      { id: '1', outgoingFileRef: 'IGTA/11', incomingFileRef: '', type: 'Initial Letter', dateIssued: '2024-01-10', dueDate: '2024-01-25', status: 'Awaiting', reminderCount: 0, recipients: ['DAO Karachi'], recipientCount: 1 }
    ],
    documents: [
      { id: 'doc1', type: 'Finance Letter', fileNumber: 'FD-77', fileName: 'initiation_letter.pdf', summary: 'Formal initiation of inquiry regarding misallocation of treasury funds.', approved: true, uploadDate: '2024-01-10T10:00:00Z' }
    ],
    timeline: [
      { id: 't1', timestamp: '2024-01-10T10:00:00Z', action: 'Case Created', remarks: 'Case initialized from Finance Department request.' }
    ]
  };
});

// App component with state and logic for managing cases and authentication
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState<IGCase[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [formCaseType, setFormCaseType] = useState<CaseType>('Complaint');
  const [manualCaseId, setManualCaseId] = useState('');

  // Update auto-generated ID when case type changes
  useEffect(() => {
    const year = new Date().getFullYear();
    const serial = (cases.filter(c => c.type === formCaseType).length + 1).toString().padStart(3, '0');
    setManualCaseId(`IGTA/${formCaseType.toUpperCase()}/${year}/${serial}`);
  }, [formCaseType, cases]);

  // Load cases from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('igta_cases');
    if (saved) {
      setCases(JSON.parse(saved));
    }
  }, []);

  // Sync cases to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('igta_cases', JSON.stringify(cases));
  }, [cases]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pass = formData.get('password');
    if (pass === 'igta123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrative Security Key');
    }
  };

  const updateCase = (updatedCase: IGCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const handleCreateCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const type = formData.get('type') as CaseType;
    const source = formData.get('source') as InitiationSource;
    const district = formData.get('district') as string;
    const office = formData.get('office') as string;
    const customId = formData.get('customId') as string;

    const newCase: IGCase = {
      id: customId || manualCaseId,
      type,
      source,
      dateReceived: new Date().toISOString().split('T')[0],
      district,
      officeConcerned: office,
      assignedDIG: 'DIG HQ',
      assignedAIGs: [],
      status: 'No action taken/necessary',
      daysPending: 0,
      slaBreach: false,
      cooperative: true,
      internalNotes: '',
      externalFiles: [],
      officers: [],
      communications: [],
      documents: [],
      timeline: [{ 
        id: Date.now().toString(), 
        timestamp: new Date().toISOString(), 
        action: 'Case Initialized', 
        remarks: `Case formally opened via administrative dashboard for ${office}.` 
      }],
    };

    setCases([newCase, ...cases]);
    setIsCreateModalOpen(false);
    setSelectedCaseId(newCase.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] max-w-xl w-full p-12 animate-fade-in relative z-10 border border-emerald-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-48 h-24 bg-white rounded-3xl p-2 shadow-inner border border-gray-100 flex items-center justify-center group overflow-hidden relative">
                <img 
                  src="https://raw.githubusercontent.com/GovOfSindh/logos/main/finance_dept_black.png" 
                  alt="Government of Sindh Finance Department Logo" 
                  className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            
            <h1 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight mb-2">
              Inspector General of Treasuries & Accounts
            </h1>
            <p className="text-sm text-emerald-600 uppercase tracking-[0.25em] font-black">Finance Department</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-[1px] w-12 bg-gray-100"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Government of Sindh</span>
              <div className="h-[1px] w-12 bg-gray-100"></div>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Administrative Role</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Inspector General / System Admin" 
                  readOnly 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-600 text-sm font-bold outline-none cursor-default"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Security Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50" size={18} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-emerald-900 text-sm font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              {loginError && (
                <div className="mt-3 flex items-center gap-2 text-red-500">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{loginError}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
            >
              <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              Access Portal
            </button>

            <div className="text-center pt-4 border-t border-gray-50">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.4em] mb-1">
                Authorized Personnel Only • Audit Trail Active
              </p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                MADE BY WARIS NAWAB PANHWAR
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)}>
      {selectedCase ? (
        <CaseDetails 
          caseData={selectedCase} 
          onBack={() => setSelectedCaseId(null)} 
          onUpdate={updateCase}
        />
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard cases={cases} onCaseClick={setSelectedCaseId} />}
          {activeTab === 'cases' && <CaseList cases={cases} onCaseClick={setSelectedCaseId} onAddCase={() => setIsCreateModalOpen(true)} />}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-800 uppercase mb-6">Central Audit Log</h3>
              <div className="space-y-4">
                {cases.flatMap(c => c.timeline.map(t => ({...t, caseId: c.id}))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, i) => (
                  <div key={i} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded h-fit">{log.caseId}</div>
                    <div>
                      <div className="text-sm font-black text-gray-800">{log.action}</div>
                      <div className="text-xs text-gray-500 mt-1">{log.remarks}</div>
                      <div className="text-[9px] text-gray-400 mt-2 font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
              <ShieldAlert size={64} className="mx-auto text-emerald-100 mb-6" />
              <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Compliance Reports</h3>
              <p className="text-gray-500 font-medium">Monthly reporting module is under maintenance for system migration.</p>
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 uppercase">Initialize New Case File</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Case Type</label>
                  <select 
                    name="type" 
                    value={formCaseType}
                    onChange={(e) => setFormCaseType(e.target.value as CaseType)}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                  >
                    {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initiation Source</label>
                  <select name="source" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm focus:border-emerald-500 outline-none transition-all">
                    {INITIATION_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
                  <select name="district" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm focus:border-emerald-500 outline-none transition-all">
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Office Concerned</label>
                  <input name="office" required placeholder="e.g. DAO Karachi West" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">File Number (Auto-Generated)</label>
                <input name="customId" value={manualCaseId} onChange={(e) => setManualCaseId(e.target.value)} className="w-full p-3 rounded-xl border-2 border-emerald-100 bg-emerald-50 font-black text-emerald-800 text-sm focus:border-emerald-500 outline-none transition-all" />
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all">
                  Open File
                </button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 text-gray-500 font-black uppercase text-xs tracking-widest">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
