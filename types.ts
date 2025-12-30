
export type CaseType = 'Complaint' | 'Inquiry' | 'Inspection' | 'Monitoring' | 'Re-Inspection' | 'Surprise Visit' | 'Pension Verification';
export type InitiationSource = 'Finance' | 'DAO' | 'Other Department' | 'Complainant';
export type CaseStatus = 'Received' | 'Under Process' | 'Awaiting Response' | 'Inspection Completed' | 'Inquiry in Progress' | 'Report Submitted' | 'Closed' | 'On Hold';
export type CommunicationType = 'Initial Letter' | 'Reminder 1' | 'Reminder 2' | 'Final Reminder' | 'Response';
export type ResponseStatus = 'Awaiting' | 'Received' | 'Partial' | 'No Response';
export type ResponseQuality = 'Complete' | 'Partial' | 'Irrelevant' | 'Evasive';
export type DocumentType = 'Finance Letter' | 'Complaint Application' | 'DAO Reply' | 'Reminder Letter' | 'Inspection Report' | 'Inquiry Report' | 'Pension Verification' | 'Final Report';

export interface IGCase {
  id: string; // IGTA/TYPE/YEAR/SERIAL
  type: CaseType;
  source: InitiationSource;
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
  name: string;
  designation: string;
  department: string;
  district: string;
  role: 'Primary' | 'Supporting' | 'Supervisory';
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
}

export interface IGDocument {
  id: string;
  type: DocumentType;
  fileNumber: string;
  fileName: string;
  summary: string;
  approved: boolean;
  ocrText?: string;
  uploadDate: string;
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
