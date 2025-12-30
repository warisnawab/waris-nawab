
import React, { useState } from 'react';
import { IGCase, IGDocument, Communication } from '../types';
import { 
  ArrowLeft, FileText, MessageSquare, History, Users, 
  Plus, CheckCircle2, Clock, AlertTriangle, Printer, Trash2, ShieldAlert
} from 'lucide-react';
import { processLargeDocument } from '../services/geminiService';

interface CaseDetailsProps {
  caseData: IGCase;
  onBack: () => void;
  onUpdate: (updatedCase: IGCase) => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'reminders' | 'timeline' | 'officers'>('info');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { text, summary } = await processLargeDocument(file);
      const newDoc: IGDocument = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Finance Letter',
        fileNumber: 'TEMP-' + Date.now(),
        fileName: file.name,
        summary: summary,
        approved: false,
        ocrText: text,
        uploadDate: new Date().toISOString(),
      };

      const updatedCase = {
        ...caseData,
        documents: [...caseData.documents, newDoc],
        timeline: [
          ...caseData.timeline,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: `Document Uploaded: ${file.name}`,
            remarks: 'System automatically extracted and summarized content.'
          }
        ]
      };
      onUpdate(updatedCase);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const approveSummary = (docId: string) => {
    const updatedDocs = caseData.documents.map(doc => 
      doc.id === docId ? { ...doc, approved: true } : doc
    );
    onUpdate({ ...caseData, documents: updatedDocs });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white rounded-full transition-colors border shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:text-emerald-700 transition-colors" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{caseData.id}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{caseData.officeConcerned}</span>
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-tight">{caseData.type}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
            <Printer size={14} /> Export Final PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 shadow-md transition-all active:scale-[0.98]">
            Update Case Status
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b bg-gray-50/50">
          {[
            { id: 'info', label: 'Basic Info', icon: FileText },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'reminders', label: 'Communications', icon: MessageSquare },
            { id: 'officers', label: 'Officers', icon: Users },
            { id: 'timeline', label: 'Audit Trail', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                  : 'border-transparent text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/20'
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-emerald-700' : 'text-gray-300'} />
              {tab.label}
              {tab.id === 'documents' && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-100 text-gray-500'}`}>
                  {caseData.documents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-8 min-h-[400px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-4">Core Identification</h4>
                  <dl className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Source Office</dt>
                      <dd className="text-sm font-black text-emerald-900">{caseData.source}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Receipt Date</dt>
                      <dd className="text-sm font-black text-emerald-900">{caseData.dateReceived}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">Target District</dt>
                      <dd className="text-sm font-black text-emerald-900">{caseData.district}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-gray-400 font-bold uppercase mb-1">SLA Compliance</dt>
                      <dd className="text-sm font-black">
                        {caseData.slaBreach ? (
                          <span className="text-red-600 flex items-center gap-1 uppercase text-[11px]"><AlertTriangle size={14}/> SLA BREACHED</span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1 uppercase text-[11px]"><CheckCircle2 size={14}/> WITHIN LIMITS</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-emerald-50/30 border border-emerald-100 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    {/* Fix: Added missing ShieldAlert icon component */}
                    <ShieldAlert size={48} className="text-emerald-900" />
                  </div>
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest pb-2 mb-3 border-b border-emerald-100">Inspector General Internal Notes</h4>
                  <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                    {caseData.internalNotes || 'No administrative notes currently recorded by the IG office.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex justify-between items-center">
                  <span>Linked References</span>
                  <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded text-[9px]">CROSS-DIVisional</span>
                </h4>
                <div className="space-y-4">
                  {caseData.externalFiles.map((file, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-300 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">{file.source} DEPARTMENT FILE</p>
                        <span className="text-[10px] font-bold text-gray-400">{file.date}</span>
                      </div>
                      <p className="text-sm font-black text-gray-800 mb-1 group-hover:text-emerald-900">Ref: {file.letterRef}</p>
                      <p className="text-xs font-semibold text-gray-400">Archive No: {file.fileNumber}</p>
                      <div className="mt-3 text-[10px] text-gray-500 italic bg-gray-50 px-2 py-1 rounded">
                        {file.remarks}
                      </div>
                    </div>
                  ))}
                  {caseData.externalFiles.length === 0 && <p className="text-xs text-gray-400 text-center py-8 font-medium italic">No external department files linked.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Document Repository</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">AI-Powered Text Extraction & Summarization</p>
                </div>
                <label className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Plus size={16} />
                  Add Official PDF
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing} />
                </label>
              </div>

              {isProcessing && (
                <div className="bg-emerald-900 text-white p-6 rounded-2xl flex items-center gap-6 shadow-xl animate-pulse">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-emerald-300 rounded-full animate-spin flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Processing High-Volume Document...</p>
                    <p className="text-xs text-emerald-200 mt-1 font-semibold uppercase">Chunking OCR data and generating neutral administrative summary</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className={`border rounded-2xl p-6 flex flex-col lg:flex-row gap-8 transition-all ${doc.approved ? 'bg-white border-gray-200' : 'bg-emerald-50/20 border-emerald-200 shadow-inner'}`}>
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-4 w-24 flex-shrink-0 border border-gray-200">
                      <FileText className="text-emerald-700" size={40} />
                      <span className="text-[9px] font-black mt-3 text-emerald-800 uppercase tracking-tighter">TREASURY PDF</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-black text-gray-800">{doc.fileName}</h4>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{doc.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Uploaded On</p>
                          <p className="text-xs font-bold text-gray-600">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 block">AI Administrative Summary</label>
                        {doc.approved ? (
                          <div className="bg-gray-50 border-l-4 border-emerald-600 p-4 rounded-r-xl">
                            <p className="text-sm text-gray-700 leading-relaxed font-semibold italic">{doc.summary}</p>
                          </div>
                        ) : (
                          <textarea 
                            className="w-full mt-1 p-4 text-sm border-2 border-emerald-100 rounded-xl bg-white font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none h-24 shadow-sm"
                            defaultValue={doc.summary}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-wider text-gray-400">
                         <span>Archive Ref: {doc.fileNumber}</span>
                         <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                         <span>System Verified: TRUE</span>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-3 justify-center min-w-[180px]">
                      {!doc.approved ? (
                        <button 
                          onClick={() => approveSummary(doc.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md whitespace-nowrap"
                        >
                          <CheckCircle2 size={16} /> Approve Summary
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm whitespace-nowrap">
                          <CheckCircle2 size={16} /> Summary Verified
                        </div>
                      )}
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 bg-white text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all">
                        View Full OCR
                      </button>
                    </div>
                  </div>
                ))}
                {caseData.documents.length === 0 && !isProcessing && (
                  <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <FileText className="mx-auto text-emerald-100 mb-6" size={64} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Treasury Archives Empty</p>
                    <p className="text-gray-300 text-[10px] mt-1 font-semibold italic">Upload official documentation to begin analysis</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Communication Logs</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">Official Letters & Reminders</p>
                </div>
                <button className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Plus size={16} />
                  Initiate Correspondence
                </button>
              </div>

              <div className="space-y-5">
                {caseData.communications.map((comm) => (
                  <div key={comm.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="px-8 py-5 border-b flex items-center justify-between bg-gray-50/30">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl border ${
                          comm.type.includes('Reminder') ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-gray-800">{comm.type}</h4>
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">IGTA REF: {comm.outgoingFileRef}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                          comm.status === 'Awaiting' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {comm.status}
                        </span>
                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">
                          <Clock size={12} />
                          Deadline: {comm.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-white flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="flex gap-6">
                        <span>Issued: {comm.dateIssued}</span>
                        {comm.receivedDate && <span className="text-emerald-600">Response: {comm.receivedDate}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Escalation Level</span>
                        <div className="flex gap-1">
                          {[1,2,3].map(i => (
                            <div key={i} className={`h-1.5 w-4 rounded-full ${i <= comm.reminderCount ? 'bg-red-500' : 'bg-gray-100'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {caseData.communications.length === 0 && (
                  <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <MessageSquare className="mx-auto text-emerald-100 mb-6" size={64} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Official Correspondence</p>
                    <p className="text-gray-300 text-[10px] mt-1 font-semibold italic">Begin legal correspondence to track DAO response speed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="max-w-4xl mx-auto py-10">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-100"></div>
                <div className="space-y-12">
                  {caseData.timeline.slice().reverse().map((entry, i) => (
                    <div key={entry.id} className="relative pl-16 group">
                      <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                        i === 0 ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-600 border-emerald-50'
                      }`}>
                        {i === 0 ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-black text-gray-800 uppercase tracking-tight">{entry.action}</h4>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono bg-gray-50 px-3 py-1 rounded-lg">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.oldStatus && entry.newStatus && (
                          <div className="flex items-center gap-3 text-[10px] font-black mb-4">
                            <span className="text-gray-300 line-through tracking-widest uppercase">{entry.oldStatus}</span>
                            <div className="h-0.5 w-6 bg-emerald-100"></div>
                            <span className="text-emerald-700 tracking-widest uppercase bg-emerald-50 px-2 py-1 rounded">{entry.newStatus}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 leading-relaxed italic border-l-2 border-emerald-100 pl-4">
                          {entry.remarks}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseData.officers.map((officer, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-6 group hover:border-emerald-300 transition-all">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 font-black text-xl shadow-inner group-hover:bg-emerald-700 group-hover:text-white transition-all">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-black text-gray-800">{officer.name}</h4>
                      <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] border ${
                        officer.role === 'Primary' ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {officer.role}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{officer.designation}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      {/* Fix: Added missing ShieldAlert icon component */}
                      <ShieldAlert size={12} />
                      {officer.department} | {officer.district}
                    </div>
                  </div>
                </div>
              ))}
              <button className="border-2 border-dashed border-emerald-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-emerald-300 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group">
                <div className="p-3 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Assign Treasury Officer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
