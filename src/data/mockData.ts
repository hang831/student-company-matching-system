
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
  const currentDate = new Date();
  
  // Generate slots for the next 7 days
  for (let day = 1; day <= 7; day++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + day);
    
    // For each company
    mockCompanies.forEach(company => {
      // Generate 3 slots per day per company
      for (let hour = 9; hour <= 15; hour += 3) {
        const slot: InterviewSlot = {
          id: `${company.id}-${date.toISOString()}-${hour}`,
          date: new Date(date),
          startTime: `${hour}:00`,
          endTime: `${hour + 1}:00`,
          companyId: company.id,
          booked: false,
          isAvailable: true, // All slots start as available by default
        };
        slots.push(slot);
        
        // Add this slot to the company's available slots
        company.availableSlots.push(slot);
      }
    });
  }
  
  return slots;
};

// Initialize slots
export const interviewSlots = generateInterviewSlots();

export const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    preferences: [],
    bookedInterviews: [],
  },
  {
    id: "s2",
    name: "Jamie Smith",
    email: "jamie.s@example.com",
    preferences: [],
    bookedInterviews: [],
  },
  {
    id: "s3",
    name: "Morgan Lee",
    email: "morgan.l@example.com",
    preferences: [],
    bookedInterviews: [],
  },
];
