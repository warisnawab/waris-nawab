
export type CaseType = 'Complaint' | 'Inquiry' | 'Inspection' | 'Monitoring' | 'Re-Inspection' | 'Surprise Visit' | 'Pension Verification';
export type InitiationSource = 'Finance' | 'DAO' | 'Other Department' | 'Complainant';
export type CasePriority = 'Low' | 'Medium' | 'High';

export type CaseStatus = 
  | 'No action taken/necessary' 
  | 'Letter sent to concerned' 
  | 'Reminder 1 issued' 
  | 'Reminder 2 issued' 
  | 'Final reminder issued'
  | 'Decision sent to Finance Department';

export type CommunicationType = 'Initial Letter' | 'Reminder 1' | 'Reminder 2' | 'Final Reminder' | 'Response';
export type ResponseStatus = 'Awaiting' | 'Received' | 'Satisfactory' | 'New letter required';
export type ResponseQuality = 'Complete' | 'Partial' | 'Irrelevant' | 'Evasive';
export type DocumentType = 'Finance Letter' | 'Complaint Application' | 'DAO Reply' | 'Reminder Letter' | 'Inspection Report' | 'Inquiry Report' | 'Pension Verification' | 'Final Report';

export type Designation = 'DIG' | 'AIG' | 'Assistant' | 'Inspector' | 'Senior Computer Operator' | 'Sub-Accountant' | 'Clerk' | 'None';

export interface IGCase {
  id: string; 
  type: CaseType;
  source: InitiationSource;
  priority: CasePriority;
  dateReceived: string;
  district: string;
  officeConcerned: string;
  assignedDIG: string;
  assignedAIGs: string[];
  status: CaseStatus;
  daysPending: number;
  slaBreach: boolean;
  externalFiles: ExternalFile[];
  officers: Officer[];
  communications: Communication[];
  documents: IGDocument[];
  timeline: AuditEntry[];
  internalNotes: string;
  cooperative: boolean;
}

export interface ExternalFile {
  source: 'Finance' | 'DAO' | 'Other';
  fileNumber: string;
  letterRef: string;
  date: string;
  remarks: string;
}

export interface Officer {
  id: string;
  name: string;
  designation: Designation;
  department: string;
  district: string;
  role: 'Primary' | 'Supporting' | 'Supervisory' | 'None';
}

export interface Communication {
  id: string;
  outgoingFileRef: string;
  incomingFileRef: string;
  type: CommunicationType;
  dateIssued: string;
  dueDate: string;
  receivedDate?: string;
  status: ResponseStatus;
  quality?: ResponseQuality;
  reminderCount: number;
  recipients: string[]; 
  recipientCount: number;
}

export interface DocumentSection {
  department: string;
  summary: string;
}

export interface IGDocument {
  id: string;
  type: DocumentType;
  fileNumber: string; 
  date?: string;
  district?: string;
  signingAuthority?: string;
  fileName: string;
  summary: string;
  approved: boolean;
  ocrText?: string;
  uploadDate: string;
  sections?: DocumentSection[]; 
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  remarks: string;
}

export interface DashboardStats {
  totalActive: number;
  pending15: number;
  pending30: number;
  nonCooperative: number;
  financeInitiated: number;
}
