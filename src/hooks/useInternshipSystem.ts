
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

  // Delete company
  const deleteCompany = (companyId: string) => {
    // First, remove all interview slots associated with this company
    const companySlotIds = slots.filter(slot => slot.companyId === companyId).map(slot => slot.id);
    
    // Update bookings for any students who had booked with this company
    setStudents(
      students.map(student => ({
        ...student,
        bookedInterviews: student.bookedInterviews.filter(
          interview => !companySlotIds.includes(interview.id)
        ),
        preferences: student.preferences.filter(
          pref => pref.companyId !== companyId
        )
      }))
    );
    
    // Remove slots associated with this company
    setSlots(slots.filter(slot => slot.companyId !== companyId));
    
    // Remove the company itself
    setCompanies(companies.filter(company => company.id !== companyId));
    
    toast({
      title: "Company deleted",
      description: "The company and all its associated data have been removed.",
    });
  };

  // Update student details
  const updateStudent = (updatedStudent: Student) => {
    setStudents(
      students.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
    toast({
      title: "Student updated",
      description: `${updatedStudent.name} has been updated successfully.`,
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

  // Add timeslot for a company
  const addTimeslot = ({ 
    date, 
    startTime, 
    endTime, 
    companyId 
  }: { 
    date: Date; 
    startTime: string; 
    endTime: string; 
    companyId: string; 
  }) => {
    const newSlot: InterviewSlot = {
      id: `slot-${Date.now()}`,
      date: new Date(date),
      startTime,
      endTime,
      companyId,
      booked: false,
      isAvailable: true,
    };
    
    // Add to global slots
    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
    
    // Add to company available slots
    const updatedCompanies = companies.map((company) => {
      if (company.id === companyId) {
        return {
          ...company,
          availableSlots: [...company.availableSlots, newSlot],
        };
      }
      return company;
    });
    
    setCompanies(updatedCompanies);
    
    toast({
      title: "Timeslot added",
      description: "A new interview timeslot has been added.",
    });
  };
  
  // Remove timeslot
  const removeTimeslot = (slotId: string) => {
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
        description: "Cannot remove a booked slot.",
        variant: "destructive",
      });
      return false;
    }
    
    // Remove from global slots
    const updatedSlots = slots.filter((s) => s.id !== slotId);
    setSlots(updatedSlots);
    
    // Remove from company available slots
    const updatedCompanies = companies.map((company) => {
      if (company.id === slot.companyId) {
        return {
          ...company,
          availableSlots: company.availableSlots.filter((s) => s.id !== slotId),
        };
      }
      return company;
    });
    
    setCompanies(updatedCompanies);
    
    toast({
      title: "Timeslot removed",
      description: "The interview timeslot has been removed.",
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
    deleteCompany,
    updateStudent,
    addTimeslot,
    removeTimeslot,
    addStudentPreference,
    bookInterviewSlot,
    getAvailableSlotsForCompany,
    getStudentById,
    getCompanyById,
    autoAssignInterviews,
    toggleSlotAvailability,
  };
};
