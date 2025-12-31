
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseDetails from './components/CaseDetails';
import { IGCase, CaseType, InitiationSource, CasePriority } from './types';
import { AlertCircle, X, CheckCircle2, Lock, LogIn, ShieldCheck, Download, Save } from 'lucide-react';
import { DISTRICTS, CASE_TYPES, INITIATION_SOURCES, PRIORITIES } from './constants';

const MOCK_CASES: IGCase[] = Array.from({ length: 16 }, (_, i) => {
  const types: CaseType[] = ['Complaint', 'Inquiry', 'Inspection', 'Monitoring'];
  const type = types[i % 4];
  const priority: CasePriority = i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low';
  return {
    id: `IGTA/${type.toUpperCase()}/2024/${(i + 1).toString().padStart(3, '0')}`,
    type: type,
    source: i % 2 === 0 ? 'Finance' : 'DAO',
    priority: priority,
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
      { id: '1', name: 'Sajid Ali', designation: 'AIG', department: 'IGTA', district: 'Sindh', role: 'Primary' }
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState<IGCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  
  const [formCaseType, setFormCaseType] = useState<CaseType>('Complaint');
  const [manualCaseId, setManualCaseId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('igta_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validated = parsed.map((c: any) => ({
          ...c,
          priority: c.priority || 'Medium',
          internalNotes: c.internalNotes || '',
          cooperative: c.cooperative !== undefined ? c.cooperative : true,
          documents: c.documents || [],
          communications: c.communications || [],
          timeline: c.timeline || []
        }));
        setCases(validated);
      } catch (e) {
        setCases(MOCK_CASES);
      }
    } else {
      setCases(MOCK_CASES);
    }
  }, []);

  useEffect(() => {
    if (cases.length > 0) {
      localStorage.setItem('igta_cases', JSON.stringify(cases));
    }
  }, [cases]);

  const handleExportData = () => {
    const dataStr = JSON.stringify(cases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `IGTA_PC_BACKUP_${new Date().toISOString().replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          if (window.confirm("Overwrite current browser data with this backup file?")) {
            setCases(importedData);
            alert("Database successfully restored from PC.");
          }
        }
      } catch (err) {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
    const priority = formData.get('priority') as CasePriority;
    const district = formData.get('district') as string;
    const office = formData.get('office') as string;
    const customId = formData.get('customId') as string;

    const newCase: IGCase = {
      id: customId || manualCaseId,
      type,
      source,
      priority,
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

        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-12 animate-fade-in relative z-10 border border-emerald-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner border border-emerald-100">
                <ShieldCheck size={48} className="text-emerald-700" />
              </div>
            </div>
            <h1 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight mb-2">Inspector General of Treasuries & Accounts</h1>
            <p className="text-sm text-emerald-600 uppercase tracking-[0.25em] font-black">Finance Department</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Administrative Role</label>
              <input type="text" defaultValue="Inspector General / System Admin" readOnly className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-600 text-sm font-bold outline-none cursor-default" />
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50" size={18} />
                <input type="password" name="password" placeholder="••••••••••••" required className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-emerald-900 text-sm font-bold focus:border-emerald-500 outline-none" />
              </div>
              {loginError && <div className="mt-3 text-red-500 text-[10px] font-black uppercase tracking-tight"><AlertCircle size={14} className="inline mr-1"/>{loginError}</div>}
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
              <LogIn size={20} /> Access Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)} onSaveToPC={handleExportData} onImportFromPC={handleImportData}>
      {backupSuccess && (
        <div className="fixed top-6 right-6 z-[60] bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={16} /> Saved to PC (Downloads folder)
        </div>
      )}
      {selectedCaseId ? (
        <CaseDetails caseData={cases.find(c => c.id === selectedCaseId)!} onBack={() => setSelectedCaseId(null)} onUpdate={updateCase} />
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard cases={cases} onCaseClick={setSelectedCaseId} />}
          {activeTab === 'cases' && <CaseList cases={cases} onCaseClick={setSelectedCaseId} onAddCase={() => setIsCreateModalOpen(true)} />}
          {activeTab === 'database' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] p-12 border border-emerald-100 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Save size={32} /></div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">System Data Management</h3>
                      <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">Export / Import & Disaster Recovery</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="p-10 rounded-[2rem] border-4 border-dashed border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
                      <div><h4 className="text-xl font-black text-emerald-900 uppercase mb-4 flex items-center gap-2"><Download size={24}/> SAVE COMPLETE DATASET</h4><p className="text-gray-600 font-medium leading-relaxed mb-8">Downloads your entire application state as a secure JSON file.</p></div>
                      <button onClick={handleExportData} className="w-full flex items-center justify-center gap-4 bg-emerald-900 text-white py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-black transition-all"><Save size={20} /> Download Database (.json)</button>
                    </div>
                    <div className="p-10 rounded-[2rem] border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-between">
                      <div><h4 className="text-xl font-black text-gray-800 uppercase mb-4 flex items-center gap-2"><Download size={24} className="rotate-180"/> IMPORT DATASET</h4><p className="text-gray-500 font-medium leading-relaxed mb-8">Upload a previously saved backup file to restore all your data.</p></div>
                      <label className="w-full flex items-center justify-center gap-4 bg-white border-4 border-gray-100 text-gray-700 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-md cursor-pointer hover:bg-gray-100 transition-all">Select File to Import<input type="file" accept=".json" className="hidden" onChange={handleImportData} /></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 uppercase">Initialize New Case File</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateCase} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Case Type</label>
                  <select name="type" value={formCaseType} onChange={(e) => setFormCaseType(e.target.value as CaseType)} className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm outline-none">
                    {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Case Priority</label>
                  <select name="priority" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm outline-none">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initiation Source</label>
                  <select name="source" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm outline-none">
                    {INITIATION_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
                  <select name="district" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm outline-none">
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Office Concerned</label>
                <input name="office" required placeholder="DAO Karachi West" className="w-full p-3 rounded-xl border-2 border-gray-100 font-bold text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manual File Reference (Optional)</label>
                <input name="customId" value={manualCaseId} onChange={(e) => setManualCaseId(e.target.value)} className="w-full p-3 rounded-xl border-2 border-emerald-100 bg-emerald-50 font-black text-emerald-800 text-sm outline-none" placeholder="IGTA/ABC/2024/001" />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-800 transition-all">Save & Open Case</button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 text-gray-500 font-black uppercase text-xs tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
