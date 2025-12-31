
import { CaseType, CaseStatus, InitiationSource, DocumentType, Designation, CasePriority } from './types';

export const CASE_TYPES: CaseType[] = [
  'Complaint', 'Inquiry', 'Inspection', 'Monitoring', 'Re-Inspection', 'Surprise Visit', 'Pension Verification'
];

export const INITIATION_SOURCES: InitiationSource[] = [
  'Finance', 'DAO', 'Other Department', 'Complainant'
];

export const CASE_STATUSES: CaseStatus[] = [
  'No action taken/necessary',
  'Letter sent to concerned',
  'Reminder 1 issued',
  'Reminder 2 issued',
  'Final reminder issued',
  'Decision sent to Finance Department'
];

export const DESIGNATIONS: Designation[] = [
  'DIG', 'AIG', 'Assistant', 'Inspector', 'Senior Computer Operator', 'Sub-Accountant', 'Clerk', 'None'
];

export const PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];

export const DOCUMENT_TYPES: DocumentType[] = [
  'Finance Letter', 'Complaint Application', 'DAO Reply', 'Reminder Letter', 'Inspection Report', 'Inquiry Report', 'Pension Verification', 'Final Report'
];

export const DISTRICTS = [
  'Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Korangi', 'Malir', 'Keamari',
  'Hyderabad', 'Jamshoro', 'Matiari', 'Tando Allahyar', 'Tando Muhammad Khan', 'Badin', 'Thatta', 'Sujawal',
  'Sukkur', 'Ghotki', 'Khairpur', 'Larkana', 'Shikarpur', 'Jacobabad', 'Kashmore', 'Qambar Shahdadkot',
  'Mirpurkhas', 'Umerkot', 'Tharparkar', 'Shaheed Benazirabad', 'Sanghar', 'Naushahro Feroze'
];

export const DIG_OFFICERS = ['DIG HQ', 'DIG Inspection', 'DIG Pensions', 'DIG Complaints'];

export const SLA_THRESHOLDS = {
  DAO: 15,
  DEPARTMENT: 21
};
