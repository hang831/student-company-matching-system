
import { Company, Student, InterviewSlot } from "@/types";

// Mock data for companies
export const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "Tech Innovations Inc.",
    description: "Leading technology company specializing in AI and machine learning solutions.",
    intakeNumber: 5,
    interviewPlace: "Room 101",
    contactPerson: "John Smith",
    allowance: "$500",
    remarks: "Looking for students with strong programming skills",
    availableSlots: [],
  },
  {
    id: "c2",
    name: "Global Finance Group",
    description: "International financial services and consulting firm.",
    intakeNumber: 3,
    interviewPlace: "Building A, 2nd Floor",
    contactPerson: "Mary Johnson",
    allowance: "$450",
    remarks: "Finance or accounting background preferred",
    availableSlots: [],
  },
  {
    id: "c3",
    name: "Creative Design Studios",
    description: "Award-winning design agency working with global brands.",
    intakeNumber: 4,
    interviewPlace: "Design Center",
    contactPerson: "David Lee",
    allowance: "$480",
    remarks: "Portfolio review required",
    availableSlots: [],
  },
  {
    id: "c4",
    name: "Health Sciences Ltd",
    description: "Research and development in healthcare and biomedical sciences.",
    intakeNumber: 2,
    interviewPlace: "Science Park, Block C",
    contactPerson: "Sarah Wong",
    allowance: "$550",
    remarks: "Lab experience is a plus",
    availableSlots: [],
  },
  {
    id: "c5",
    name: "Sustainable Solutions",
    description: "Environmental consulting and green technology implementation.",
    intakeNumber: 3,
    interviewPlace: "Eco Building",
    contactPerson: "Michael Green",
    allowance: "$470",
    remarks: "Interest in sustainability required",
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
