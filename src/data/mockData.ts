
import { Company, Student, InterviewSlot } from "@/types";

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Tech Innovations Inc.",
    description: "A leading tech company focused on innovative solutions.",
    intakeNumber: 3,
    availableSlots: [],
  },
  {
    id: "2",
    name: "Global Finance Group",
    description: "International financial services provider.",
    intakeNumber: 2,
    availableSlots: [],
  },
  {
    id: "3",
    name: "Creative Media Solutions",
    description: "Digital media and content creation company.",
    intakeNumber: 4,
    availableSlots: [],
  },
  {
    id: "4",
    name: "Healthcare Systems",
    description: "Modern healthcare solutions provider.",
    intakeNumber: 2,
    availableSlots: [],
  },
  {
    id: "5",
    name: "Green Energy Innovations",
    description: "Sustainable energy research and development firm.",
    intakeNumber: 3,
    availableSlots: [],
  },
];

// Generate mock interview slots for companies
const generateInterviewSlots = () => {
  const slots: InterviewSlot[] = [];
  
  // We'll no longer generate default slots since users will add them manually
  
  return slots;
};

// Initialize slots
export const interviewSlots = generateInterviewSlots();

export const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    studentId: "ST12345",
    tel: "555-123-4567",
    gpa: "3.8",
    preferences: [],
    bookedInterviews: [],
  },
  {
    id: "s2",
    name: "Jamie Smith",
    email: "jamie.s@example.com",
    studentId: "ST23456",
    tel: "555-234-5678",
    gpa: "3.5",
    preferences: [],
    bookedInterviews: [],
  },
  {
    id: "s3",
    name: "Morgan Lee",
    email: "morgan.l@example.com",
    studentId: "ST34567",
    tel: "555-345-6789",
    gpa: "4.0",
    preferences: [],
    bookedInterviews: [],
  },
];
