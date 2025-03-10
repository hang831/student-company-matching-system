
export interface Company {
  id: string;
  name: string;
  description: string;
  intakeNumber: number;
  availableSlots: InterviewSlot[];
}

export interface InterviewSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  companyId: string;
  booked: boolean;
  studentId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  preferences: StudentPreference[];
  bookedInterviews: InterviewSlot[];
}

export interface StudentPreference {
  studentId: string;
  companyId: string;
  rank: number; // 1-5, 1 being the most preferred
}
