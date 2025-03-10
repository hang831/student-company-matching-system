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

  // Toggle slot availability
  const toggleSlotAvailability = (slotId: string) => {
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
        description: "Cannot change availability of a booked slot.",
        variant: "destructive",
      });
      return false;
    }

    const updatedSlot = { ...slot, isAvailable: !slot.isAvailable };
    
    setSlots(
      slots.map((s) => (s.id === slotId ? updatedSlot : s))
    );

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

    toast({
      title: updatedSlot.isAvailable ? "Slot Activated" : "Slot Deactivated",
      description: updatedSlot.isAvailable 
        ? "The interview slot is now available for booking." 
        : "The interview slot is now unavailable for booking.",
    });
    
    return true;
  };

  // Add student preference
  const addStudentPreference = (preference: StudentPreference) => {
    setStudents(
      students.map((student) => {
        if (student.id === preference.studentId) {
          const existingPrefIndex = student.preferences.findIndex(
            (pref) => pref.companyId === preference.companyId
          );

          let updatedPreferences = [...student.preferences];
          
          if (existingPrefIndex >= 0) {
            updatedPreferences[existingPrefIndex] = preference;
          } else {
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

    if (!slot.isAvailable) {
      toast({
        title: "Error",
        description: "This slot is not available for booking.",
        variant: "destructive",
      });
      return false;
    }

    const updatedSlot = { ...slot, booked: true, studentId };
    setSlots(
      slots.map((s) => (s.id === slotId ? updatedSlot : s))
    );

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
      (slot) => slot.companyId === companyId && !slot.booked && slot.isAvailable
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
    const sortedStudents = [...students].sort((a, b) => a.id.localeCompare(b.id));
    
    for (const student of sortedStudents) {
      const sortedPreferences = [...student.preferences].sort((a, b) => a.rank - b.rank);
      
      for (const preference of sortedPreferences) {
        const company = getCompanyById(preference.companyId);
        if (!company) continue;
        
        const availableSlots = getAvailableSlotsForCompany(company.id);
        
        if (availableSlots.length > 0) {
          bookInterviewSlot(availableSlots[0].id, student.id);
          break;
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
    toggleSlotAvailability,
  };
};
