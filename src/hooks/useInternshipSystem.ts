
import { useState } from "react";
import { Company, Student, InterviewSlot, StudentPreference } from "@/types";
import { mockCompanies, mockStudents, interviewSlots } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export const useInternshipSystem = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [slots, setSlots] = useState<InterviewSlot[]>(interviewSlots);

  // Add new company
  const addCompany = (company: Omit<Company, "id" | "availableSlots">) => {
    const newCompany: Company = {
      ...company,
      id: `c${companies.length + 1}`,
      availableSlots: [],
    };
    setCompanies([...companies, newCompany]);
    toast({
      title: "Company added",
      description: `${company.name} has been added successfully.`,
    });
  };

  // Update company details
  const updateCompany = (updatedCompany: Company) => {
    setCompanies(
      companies.map((company) =>
        company.id === updatedCompany.id ? updatedCompany : company
      )
    );
    toast({
      title: "Company updated",
      description: `${updatedCompany.name} has been updated successfully.`,
    });
  };

  // Add student preference
  const addStudentPreference = (preference: StudentPreference) => {
    setStudents(
      students.map((student) => {
        if (student.id === preference.studentId) {
          // Check if preference for this company already exists
          const existingPrefIndex = student.preferences.findIndex(
            (pref) => pref.companyId === preference.companyId
          );

          let updatedPreferences = [...student.preferences];
          
          if (existingPrefIndex >= 0) {
            // Update existing preference
            updatedPreferences[existingPrefIndex] = preference;
          } else {
            // Add new preference
            updatedPreferences.push(preference);
          }
          
          return {
            ...student,
            preferences: updatedPreferences,
          };
        }
        return student;
      })
    );
    toast({
      title: "Preference saved",
      description: "Student preference has been saved successfully.",
    });
  };

  // Book interview slot
  const bookInterviewSlot = (slotId: string, studentId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) {
      toast({
        title: "Error",
        description: "Interview slot not found.",
        variant: "destructive",
      });
      return false;
    }

    if (slot.booked) {
      toast({
        title: "Error",
        description: "This slot is already booked.",
        variant: "destructive",
      });
      return false;
    }

    // Update the slot
    const updatedSlot = { ...slot, booked: true, studentId };
    setSlots(
      slots.map((s) => (s.id === slotId ? updatedSlot : s))
    );

    // Update company's available slots
    setCompanies(
      companies.map((company) => {
        if (company.id === slot.companyId) {
          return {
            ...company,
            availableSlots: company.availableSlots.map((s) =>
              s.id === slotId ? updatedSlot : s
            ),
          };
        }
        return company;
      })
    );

    // Update student's booked interviews
    setStudents(
      students.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            bookedInterviews: [...student.bookedInterviews, updatedSlot],
          };
        }
        return student;
      })
    );

    toast({
      title: "Interview booked",
      description: "Interview slot has been booked successfully.",
    });
    return true;
  };

  // Get available slots for a company
  const getAvailableSlotsForCompany = (companyId: string) => {
    return slots.filter(
      (slot) => slot.companyId === companyId && !slot.booked
    );
  };

  // Get student by ID
  const getStudentById = (studentId: string) => {
    return students.find((student) => student.id === studentId);
  };

  // Get company by ID
  const getCompanyById = (companyId: string) => {
    return companies.find((company) => company.id === companyId);
  };

  // Auto-assign interviews based on student preferences
  const autoAssignInterviews = () => {
    // Sort students by ID to ensure consistent processing
    const sortedStudents = [...students].sort((a, b) => a.id.localeCompare(b.id));
    
    // For each student
    for (const student of sortedStudents) {
      // Sort preferences by rank (1 being highest priority)
      const sortedPreferences = [...student.preferences].sort((a, b) => a.rank - b.rank);
      
      // For each preference
      for (const preference of sortedPreferences) {
        const company = getCompanyById(preference.companyId);
        if (!company) continue;
        
        // Get available slots for this company
        const availableSlots = getAvailableSlotsForCompany(company.id);
        
        // Book the first available slot if any
        if (availableSlots.length > 0) {
          bookInterviewSlot(availableSlots[0].id, student.id);
          break; // Move to next student once a slot is booked
        }
      }
    }
    
    toast({
      title: "Auto-assignment complete",
      description: "Interviews have been automatically assigned based on preferences.",
    });
  };

  return {
    companies,
    students,
    slots,
    addCompany,
    updateCompany,
    addStudentPreference,
    bookInterviewSlot,
    getAvailableSlotsForCompany,
    getStudentById,
    getCompanyById,
    autoAssignInterviews,
  };
};
