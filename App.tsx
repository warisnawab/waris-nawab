
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseDetails from './components/CaseDetails';
import { IGCase, AuditEntry, CaseType } from './types';
import { ShieldAlert, LogIn, AlertCircle } from 'lucide-react';

const MOCK_CASES: IGCase[] = Array.from({ length: 16 }, (_, i) => {
  const types: CaseType[] = ['Complaint', 'Inquiry', 'Inspection', 'Monitoring'];
  return {
    id: `IGTA/${types[i % 4].toUpperCase()}/2024/${(i + 1).toString().padStart(3, '0')}`,
    type: types[i % 4],
    source: i % 2 === 0 ? 'Finance' : 'DAO',
    dateReceived: `2024-0${(i % 5) + 1}-10`,
    district: i % 2 === 0 ? 'Karachi South' : 'Hyderabad',
    officeConcerned: i % 2 === 0 ? 'DAO Karachi' : 'Treasury Office Hyderabad',
    assignedDIG: 'DIG HQ',
    assignedAIGs: ['AIG Inspection'],
    status: i === 0 ? 'Awaiting Response' : i === 1 ? 'Closed' : 'Under Process',
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
      { id: '1', outgoingFileRef: 'IGTA/11', incomingFileRef: '', type: 'Initial Letter', dateIssued: '2024-01-10', dueDate: '2024-01-25', status: 'Awaiting', reminderCount: 0 }
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
  const [cases, setCases] = useState<IGCase[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  // Persist to localStorage for demo "reliability"
  useEffect(() => {
    const saved = localStorage.getItem('igta_cases');
    if (saved) {
      setCases(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('igta_cases', JSON.stringify(cases));
  }, [cases]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pass = formData.get('password');
    // Simple demo password
    if (pass === 'igta123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Credentials');
    }
  };

  const updateCase = (updatedCase: IGCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const addCase = () => {
    const newCase: IGCase = {
      id: `IGTA/NEW/${new Date().getFullYear()}/${(cases.length + 1).toString().padStart(3, '0')}`,
      type: 'Complaint',
      source: 'Finance',
      dateReceived: new Date().toISOString().split('T')[0],
      district: 'Karachi South',
      officeConcerned: 'DAO Karachi',
      assignedDIG: 'DIG HQ',
      assignedAIGs: [],
      status: 'Received',
      daysPending: 0,
      slaBreach: false,
      cooperative: true,
      internalNotes: '',
      externalFiles: [],
      officers: [],
      communications: [],
      documents: [],
      timeline: [{ id: Date.now().toString(), timestamp: new Date().toISOString(), action: 'Case Created', remarks: 'Case manually initialized by Admin.' }],
    };
    setCases([newCase, ...cases]);
    setSelectedCaseId(newCase.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-50 rounded-full opacity-50 blur-3xl"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4 border border-emerald-200">
              <ShieldAlert className="w-10 h-10 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IGTA Sindh</h1>
            <p className="text-sm text-emerald-600 mt-1 uppercase tracking-widest font-black">Finance Department</p>
            <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg inline-block border text-xs font-semibold text-gray-500">
              Inspector General: Kashif Almani
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-tight mb-2">Authorized Officer</label>
              <input 
                type="text" 
                defaultValue="Inspector General / Admin" 
                readOnly 
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-500 outline-none cursor-not-allowed font-medium" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-tight mb-2">Administrative Key</label>
              <input 
                name="password"
                type="password" 
                placeholder="Enter Secure Key" 
                autoFocus
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm focus:border-emerald-500" 
              />
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold border border-red-100">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Secure Login
            </button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 relative z-10">
             <div className="w-8 h-[1px] bg-gray-200"></div>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Government of Sindh</p>
             <div className="w-8 h-[1px] bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)}>
      {selectedCaseId ? (
        <CaseDetails 
          caseData={cases.find(c => c.id === selectedCaseId)!} 
          onBack={() => setSelectedCaseId(null)} 
          onUpdate={updateCase}
        />
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard cases={cases} onCaseClick={setSelectedCaseId} />}
          {activeTab === 'cases' && <CaseList cases={cases} onCaseClick={setSelectedCaseId} onAddCase={addCase} />}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Comprehensive System Audit Log</h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">SECURE REPOSITORY</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Case ID</th>
                      <th className="px-6 py-4">Action Taken</th>
                      <th className="px-6 py-4">Outcome / Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cases.flatMap(c => c.timeline.map(t => ({ ...t, caseId: c.id })))
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((entry, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-[11px] text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-800">{entry.caseId}</td>
                          <td className="px-6 py-4 font-medium">{entry.action}</td>
                          <td className="px-6 py-4 text-gray-500 italic">{entry.remarks}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Internal Performance Reports</h3>
                    <p className="text-sm text-gray-500 mt-1">Select a report module for detailed analysis</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <ShieldAlert className="text-emerald-700" size={24} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Monthly Pendency Analysis', desc: 'SLA breach tracking and district heatmaps.' },
                    { title: 'DAO Cooperation Audit', desc: 'Ranking of treasury offices by response speed.' },
                    { title: 'Inspector Performance', desc: 'Case clearance rate by assigned DIG/AIG.' },
                    { title: 'Annual Finance Report', desc: 'Comprehensive summary of all IGTA findings.' },
                  ].map((report, i) => (
                    <div key={i} className="group p-6 border rounded-xl hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full group-hover:bg-emerald-100 transition-colors"></div>
                      <h4 className="font-bold text-emerald-900 mb-1 relative z-10">{report.title}</h4>
                      <p className="text-sm text-gray-500 mb-4 relative z-10">{report.desc}</p>
                      <button className="text-xs font-bold text-emerald-600 uppercase tracking-widest group-hover:text-emerald-800 underline flex items-center gap-2 relative z-10">
                        Generate PDF Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
