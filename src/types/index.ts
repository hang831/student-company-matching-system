
export interface Company {
  id: string;
  name: string;
  description: string;
  intakeNumber: number;
  interviewPlace: string; // New field
  contactPerson: string;  // New field
  allowance: string;      // New field
  remarks: string;        // New field
  availableSlots: InterviewSlot[];
}

export interface InterviewSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  companyId: string;
  booked: boolean;
  isAvailable: boolean;
  studentId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  tel: string;
  gpa: string;
  preferences: StudentPreference[];
  bookedInterviews: InterviewSlot[];
}

export interface StudentPreference {
  studentId: string;
  companyId: string;
  rank: number; // 1-5, 1 being the most preferred
}

// Excel import/export interfaces
export interface CompanyImportData {
  name: string;
  description: string;
  intakeNumber: number;
  interviewPlace: string;
  contactPerson: string;
  allowance: string;
  remarks: string;
}

export interface StudentImportData {
  name: string;
  email: string;
  studentId: string;
  tel: string;
  gpa: string;
}
