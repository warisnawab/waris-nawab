
import React, { useState } from 'react';
import { IGCase, IGDocument, Communication, DocumentSection, ResponseStatus } from '../types';
import { 
  ArrowLeft, FileText, MessageSquare, History, Users, 
  Plus, CheckCircle2, Clock, AlertTriangle, Printer, Trash2, ShieldAlert, Edit2, Save, Send, Building
} from 'lucide-react';
import { processLargeDocument } from '../services/geminiService';
import { CASE_STATUSES } from '../constants';

interface CaseDetailsProps {
  caseData: IGCase;
  onBack: () => void;
  onUpdate: (updatedCase: IGCase) => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'reminders' | 'timeline' | 'officers'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingComm, setIsAddingComm] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { text, metadata, summary, sections } = await processLargeDocument(file);
      
      const newDoc: IGDocument = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Finance Letter',
        fileNumber: metadata.fileNumber,
        date: metadata.date,
        district: metadata.district,
        signingAuthority: metadata.authority,
        fileName: file.name,
        summary: summary,
        approved: false,
        ocrText: text,
        uploadDate: new Date().toISOString(),
        sections: sections
      };

      onUpdate({
        ...caseData,
        documents: [...caseData.documents, newDoc],
        timeline: [
          ...caseData.timeline,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: `New Document Processed: ${file.name}`,
            remarks: 'AI automatically extracted File No, Date, District, and Signing Authority.'
          }
        ]
      });
      setActiveTab('documents');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCaseStatus = (newStatus: any) => {
    onUpdate({
      ...caseData,
      status: newStatus,
      timeline: [
        ...caseData.timeline,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          action: 'Status Change',
          oldStatus: caseData.status,
          newStatus: newStatus,
          remarks: `Administrative status updated to ${newStatus}.`
        }
      ]
    });
  };

  const handleAddCommunication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const recipients = (formData.get('recipients') as string).split(',').map(s => s.trim());
    
    const newComm: Communication = {
      id: Date.now().toString(),
      type: formData.get('type') as any,
      outgoingFileRef: formData.get('ref') as string,
      incomingFileRef: '',
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: formData.get('dueDate') as string,
      status: 'Awaiting',
      reminderCount: 0,
      recipients: recipients,
      recipientCount: recipients.length
    };

    onUpdate({
      ...caseData,
      communications: [newComm, ...caseData.communications],
      timeline: [
        ...caseData.timeline,
        { id: Date.now().toString(), timestamp: new Date().toISOString(), action: 'Correspondence Initiated', remarks: `Letter sent to ${recipients.length} recipients.` }
      ]
    });
    setIsAddingComm(false);
  };

  const evaluateResponse = (commId: string, result: ResponseStatus) => {
    onUpdate({
      ...caseData,
      communications: caseData.communications.map(c => c.id === commId ? { ...c, status: result, receivedDate: new Date().toISOString().split('T')[0] } : c)
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border shadow-sm group">
            <ArrowLeft size={20} className="group-hover:text-emerald-700 transition-colors" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{caseData.id}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{caseData.officeConcerned}</span>
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-tight">{caseData.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={caseData.status}
            onChange={(e) => updateCaseStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all outline-none"
          >
            {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-md transition-all active:scale-[0.98]">
            <Send size={14} /> Send Decision to Finance
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b bg-gray-50/50">
          {[
            { id: 'info', label: 'Case Info', icon: FileText },
            { id: 'documents', label: 'File Archive', icon: FileText },
            { id: 'reminders', label: 'Correspondence', icon: MessageSquare },
            { id: 'officers', label: 'Officers', icon: Users },
            { id: 'timeline', label: 'Audit Trail', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-400 hover:text-emerald-600'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 min-h-[400px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-4">Workflow Identification</h4>
                  <dl className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Source Office</dt>
                      <dd className="text-sm font-black text-emerald-900">{caseData.source}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Receipt Date</dt>
                      <dd className="text-sm font-black text-emerald-900">{caseData.dateReceived}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Administrative Current Progress</dt>
                      <dd className="text-sm font-black text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                        {caseData.status}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-emerald-900 uppercase">Document Records</h3>
                <label className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 cursor-pointer text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Plus size={16} /> Upload & Analyze PDF
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing} />
                </label>
              </div>

              {caseData.documents.map((doc) => (
                <div key={doc.id} className="border-2 rounded-2xl p-6 bg-white border-gray-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-4">
                      <FileText className="text-emerald-700" size={32} />
                      <div>
                        <h4 className="text-base font-black text-gray-800">{doc.fileName}</h4>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Ref No: {doc.fileNumber} | Dist: {doc.district}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Summary of Administrative Points</p>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium italic">{doc.summary}</p>
                    </div>
                    {doc.sections && doc.sections.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doc.sections.map((sec, idx) => (
                          <div key={idx} className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                             <h6 className="text-[9px] font-black text-emerald-900 uppercase mb-1 flex items-center gap-2"><Building size={12}/> {sec.department}</h6>
                             <p className="text-xs text-emerald-800 font-medium">{sec.summary}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-emerald-900 uppercase">Correspondence History</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">Recipients and Response Evaluation</p>
                </div>
                <button onClick={() => setIsAddingComm(true)} className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Plus size={16} /> New Correspondence
                </button>
              </div>

              {isAddingComm && (
                <form onSubmit={handleAddCommunication} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 animate-scale-up space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-emerald-900 uppercase mb-1">Letter Type</label>
                      <select name="type" className="w-full p-2 rounded-lg border text-sm font-bold">
                        <option value="Initial Letter">Initial Letter</option>
                        <option value="Reminder 1">Reminder 1</option>
                        <option value="Reminder 2">Reminder 2</option>
                        <option value="Final Reminder">Final Reminder</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-emerald-900 uppercase mb-1">IGTA Reference</label>
                      <input name="ref" defaultValue={caseData.id} className="w-full p-2 rounded-lg border text-sm font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-emerald-900 uppercase mb-1">Recipients (Comma separated names/designations)</label>
                    <input name="recipients" required placeholder="DAO Karachi, Secretary Health, etc." className="w-full p-2 rounded-lg border text-sm font-bold" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-black text-emerald-900 uppercase mb-1">Response Due Date</label>
                      <input name="dueDate" type="date" required className="w-full p-2 rounded-lg border text-sm font-bold" />
                    </div>
                    <div className="flex-1 flex items-end gap-2">
                      <button type="submit" className="flex-1 bg-emerald-700 text-white p-2 rounded-lg font-black uppercase text-[10px] tracking-widest">Send Letter</button>
                      <button type="button" onClick={() => setIsAddingComm(false)} className="px-4 py-2 text-gray-500 font-black uppercase text-[10px] tracking-widest">Cancel</button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-5">
                {caseData.communications.map((comm) => (
                  <div key={comm.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-6 border-b flex items-center justify-between bg-gray-50/30">
                      <div>
                        <h4 className="text-base font-black text-gray-800">{comm.type}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {comm.recipients.map((r, i) => (
                            <span key={i} className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                          comm.status === 'Awaiting' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                          comm.status === 'Satisfactory' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {comm.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex gap-4">
                        <span>Issued: {comm.dateIssued}</span>
                        <span>Due: {comm.dueDate}</span>
                      </div>
                      {comm.status === 'Awaiting' && (
                        <div className="flex gap-2">
                          <button onClick={() => evaluateResponse(comm.id, 'Satisfactory')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Satisfactory Response</button>
                          <button onClick={() => evaluateResponse(comm.id, 'New letter required')} className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all">New Letter Required</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-8 py-4">
              {caseData.timeline.slice().reverse().map((entry) => (
                <div key={entry.id} className="flex gap-6 relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 z-10">
                    <History className="text-emerald-700" size={20} />
                  </div>
                  <div className="flex-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{entry.action}</h4>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium italic">{entry.remarks}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseData.officers.map((officer, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-6 group hover:border-emerald-300 transition-all">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 font-black text-xl group-hover:bg-emerald-700 group-hover:text-white transition-all">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-gray-800">{officer.name}</h4>
                    <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{officer.designation}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      <ShieldAlert size={12} /> {officer.department} | {officer.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
