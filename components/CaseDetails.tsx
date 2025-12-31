
import React, { useState } from 'react';
import { IGCase, IGDocument, Communication, Designation, ResponseStatus, CaseStatus, Officer } from '../types';
import { 
  ArrowLeft, FileText, MessageSquare, History, Users, 
  Plus, CheckCircle2, Clock, Trash2, ShieldAlert, Edit2, Save, Printer, Building, StickyNote, FileCheck, UserPlus
} from 'lucide-react';
import { processLargeDocument } from '../services/geminiService';
import { CASE_STATUSES, DESIGNATIONS } from '../constants';

interface CaseDetailsProps {
  caseData: IGCase;
  onBack: () => void;
  onUpdate: (updatedCase: IGCase) => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'reminders' | 'timeline' | 'officers'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingComm, setIsAddingComm] = useState(false);
  const [isAddingOfficer, setIsAddingOfficer] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(caseData.internalNotes);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const triggerSaveFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

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
        fileName: file.name,
        summary: summary,
        approved: false,
        ocrText: text,
        uploadDate: new Date().toISOString(),
      };
      onUpdate({
        ...caseData,
        documents: [...caseData.documents, newDoc],
        timeline: [...caseData.timeline, { id: Date.now().toString(), timestamp: new Date().toISOString(), action: `File Uploaded: ${file.name}`, remarks: 'OCR Analysis completed.' }]
      });
      triggerSaveFeedback();
    } finally {
      setIsProcessing(false);
    }
  };

  // Fix: Implemented missing handleSaveNotes function to persist internal notes updates.
  const handleSaveNotes = () => {
    onUpdate({
      ...caseData,
      internalNotes: notesDraft,
      timeline: [...caseData.timeline, { 
        id: Date.now().toString(), 
        timestamp: new Date().toISOString(), 
        action: 'Notes Updated', 
        remarks: 'Internal inspector notes were modified.' 
      }]
    });
    setIsEditingNotes(false);
    triggerSaveFeedback();
  };

  const handleAddOfficer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOfficer: Officer = {
      id: Date.now().toString(),
      name: formData.get('name') as string || 'None',
      designation: formData.get('designation') as Designation,
      department: formData.get('department') as string || 'IGTA',
      district: caseData.district,
      role: formData.get('role') as any || 'None'
    };
    onUpdate({
      ...caseData,
      officers: [...caseData.officers, newOfficer],
      timeline: [...caseData.timeline, { id: Date.now().toString(), timestamp: new Date().toISOString(), action: 'Team Assigned', remarks: `${newOfficer.designation} ${newOfficer.name} joined the case.` }]
    });
    setIsAddingOfficer(false);
    triggerSaveFeedback();
  };

  const handleAddCommunication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as any;
    const recipients = (formData.get('recipients') as string).split(',').map(s => s.trim());
    
    const count = caseData.communications.length + 1;
    const newComm: Communication = {
      id: Date.now().toString(),
      type,
      outgoingFileRef: caseData.id,
      incomingFileRef: '',
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: formData.get('dueDate') as string,
      status: 'Awaiting',
      reminderCount: count,
      recipients,
      recipientCount: recipients.length
    };

    onUpdate({
      ...caseData,
      status: type.includes('Reminder') ? `${type} issued` as CaseStatus : caseData.status,
      communications: [newComm, ...caseData.communications],
      timeline: [...caseData.timeline, { id: Date.now().toString(), timestamp: new Date().toISOString(), action: `Letter Sent: ${type}`, remarks: `Official correspondence dispatched (Entry #${count}/10).` }]
    });
    setIsAddingComm(false);
    triggerSaveFeedback();
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border shadow-sm group bg-gray-50"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              {caseData.id}
              <span className={`text-[10px] px-2 py-0.5 rounded border ${caseData.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{caseData.priority} PRIORITY</span>
            </h2>
            <p className="text-xs font-black text-emerald-700 uppercase">{caseData.officeConcerned} • {caseData.status}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {saveFeedback && <span className="text-[10px] font-black text-emerald-600 uppercase">Saved</span>}
          <button onClick={() => triggerSaveFeedback()} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 shadow-sm"><Save size={14} /> Save Progress</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md"><Printer size={14} /> Print Final Report</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b bg-gray-50/50">
          {[
            { id: 'info', label: 'Summary', icon: ShieldAlert },
            { id: 'documents', label: 'File Archive', icon: FileText },
            { id: 'reminders', label: '10 Correspondence', icon: MessageSquare },
            { id: 'officers', label: 'Assigned Team', icon: Users },
            { id: 'timeline', label: 'Audit Trail', icon: History },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-900 bg-white' : 'border-transparent text-gray-400 hover:text-emerald-700'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-10 min-h-[500px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-emerald-900 uppercase border-b-2 pb-2">Administrative Profile</h4>
                <div className="grid grid-cols-2 gap-6 text-sm">
                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Source</p><p className="font-black">{caseData.source}</p></div>
                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">District</p><p className="font-black">{caseData.district}</p></div>
                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Priority</p><p className="font-black text-emerald-600">{caseData.priority}</p></div>
                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Received</p><p className="font-black">{caseData.dateReceived}</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h4 className="text-[11px] font-black text-emerald-900 uppercase">Internal Inspector Notes</h4><button onClick={() => setIsEditingNotes(!isEditingNotes)} className="text-[10px] font-black text-emerald-600 uppercase"><Edit2 size={12} className="inline mr-1" /> Edit</button></div>
                {isEditingNotes ? (
                  <div className="space-y-2"><textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} className="w-full h-32 p-3 border rounded-xl text-sm outline-none focus:border-emerald-500" /><button onClick={handleSaveNotes} className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-[10px] font-black">Save Notes</button></div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm italic text-gray-500">{caseData.internalNotes || 'No notes added yet.'}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div><h3 className="text-xl font-black text-emerald-900 uppercase">Correspondence Tracking</h3><p className="text-xs text-emerald-600 font-bold">{caseData.communications.length} of 10 letters issued</p></div>
                <button onClick={() => setIsAddingComm(true)} disabled={caseData.communications.length >= 10} className="bg-emerald-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg disabled:opacity-50"><Plus size={16} className="inline mr-2" /> New Letter</button>
              </div>

              {isAddingComm && (
                <form onSubmit={handleAddCommunication} className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-100 space-y-4 animate-scale-up">
                  <div className="grid grid-cols-2 gap-4">
                    <select name="type" className="p-3 border rounded-xl text-sm font-black outline-none">
                      <option value="Initial Letter">Initial Letter</option>
                      {Array.from({ length: 9 }, (_, i) => <option key={i} value={`Reminder ${i+1}`}>Reminder {i+1}</option>)}
                      <option value="Final Reminder">Final Warning</option>
                    </select>
                    <input name="dueDate" type="date" className="p-3 border rounded-xl text-sm outline-none" required />
                  </div>
                  <input name="recipients" required placeholder="DAO Karachi West, Sub-Treasury officer, etc." className="w-full p-3 border rounded-xl text-sm outline-none" />
                  <div className="flex gap-2"><button type="submit" className="bg-emerald-700 text-white px-6 py-2 rounded-lg text-[10px] font-black">Dispatch Letter</button><button type="button" onClick={() => setIsAddingComm(false)} className="text-gray-400 text-[10px] font-black">Cancel</button></div>
                </form>
              )}

              <div className="space-y-4">
                {caseData.communications.map(comm => (
                  <div key={comm.id} className="p-6 bg-white border rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><MessageSquare size={20} /></div>
                      <div><h4 className="text-lg font-black text-gray-800">{comm.type}</h4><p className="text-[10px] font-bold text-gray-400">Issued to: {comm.recipients.join(', ')}</p></div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-100 uppercase">{comm.status}</span>
                      <p className="text-[10px] font-bold text-gray-300 mt-1">Due: {comm.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Assigned Team</h3>
                <button onClick={() => setIsAddingOfficer(true)} className="flex items-center gap-2 bg-emerald-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-black transition-all">
                  <UserPlus size={16} /> Assign Member
                </button>
              </div>

              {isAddingOfficer && (
                <form onSubmit={handleAddOfficer} className="p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-emerald-200 animate-scale-up space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Member Name</label><input name="name" className="w-full p-3 border rounded-xl outline-none focus:border-emerald-500" placeholder="e.g., Waris Nawab" /></div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Designation</label>
                      <select name="designation" className="w-full p-3 border rounded-xl outline-none font-bold text-sm">
                        {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Role</label>
                      <select name="role" className="w-full p-3 border rounded-xl outline-none font-bold text-sm">
                        <option value="Primary">Primary Inspector</option>
                        <option value="Supporting">Supporting Member</option>
                        <option value="Supervisory">Supervisor</option>
                        <option value="None">None (Unassigned)</option>
                      </select>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Department</label><input name="department" defaultValue="IGTA" className="w-full p-3 border rounded-xl outline-none" /></div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="bg-emerald-700 text-white px-8 py-3 rounded-xl text-[10px] font-black shadow-lg">Confirm Assignment</button>
                    <button type="button" onClick={() => setIsAddingOfficer(false)} className="text-gray-400 text-[10px] font-black">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 gap-6">
                {caseData.officers.length === 0 && <p className="col-span-2 text-center py-10 text-gray-400 font-bold uppercase text-xs">No team members assigned yet.</p>}
                {caseData.officers.map(officer => (
                  <div key={officer.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:border-emerald-500 transition-all">
                    <div className="w-16 h-16 bg-emerald-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">{officer.name[0]}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-gray-800">{officer.name}</h4>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{officer.designation} • {officer.role}</p>
                    </div>
                    <button onClick={() => onUpdate({...caseData, officers: caseData.officers.filter(o => o.id !== officer.id)})} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative pl-8 space-y-8 py-4">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-100"></div>
              {caseData.timeline.slice().reverse().map(entry => (
                <div key={entry.id} className="relative group">
                  <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-emerald-900 border-2 border-white"></div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:border-emerald-200 transition-all">
                    <p className="text-[10px] font-black text-emerald-900 uppercase mb-1">{entry.action}</p>
                    <p className="text-xs text-gray-500 font-medium italic">"{entry.remarks}"</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-dashed border-emerald-200 text-center">
                <p className="text-xs font-black text-emerald-800 uppercase mb-4 tracking-widest">Secure Document Repository</p>
                <label className="bg-emerald-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-black transition-all">
                  Upload Official File (PDF)
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing} />
                </label>
                {isProcessing && <p className="text-[10px] font-black text-emerald-600 mt-2 animate-pulse uppercase">Extracting Document Data...</p>}
              </div>
              <div className="space-y-4">
                {caseData.documents.map(doc => (
                  <div key={doc.id} className="p-5 bg-white border rounded-2xl flex items-center gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center"><FileText size={24} /></div>
                    <div className="flex-1"><h5 className="text-sm font-black text-gray-800">{doc.fileName}</h5><p className="text-[10px] text-gray-400 uppercase font-bold">REF: {doc.fileNumber} • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p></div>
                    <button className="text-emerald-900 hover:text-black font-black text-[10px] uppercase">View Details</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
