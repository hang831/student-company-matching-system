
import { useState, useEffect, useCallback } from "react";
import { Company, Student, InterviewSlot } from "@/types";
import { mockCompanies, mockStudents, interviewSlots } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useCompanyOperations } from "./useCompanyOperations";
import { useStudentOperations } from "./useStudentOperations";
import { useSlotOperations } from "./useSlotOperations";
import { useImportOperations } from "./useImportOperations";
import { useScheduleOperations } from "./useScheduleOperations";

export const useInternshipSystem = () => {
  // Initialize state from localStorage or fallback to mock data
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        // Ensure dates are properly converted back to Date objects
        return parsed.map((company: Company) => ({
          ...company,
          availableSlots: company.availableSlots.map((slot) => ({
            ...slot,
            date: new Date(slot.date)
          }))
        }));
      }
      return mockCompanies;
    } catch (error) {
      console.error("Error loading companies from localStorage:", error);
      return mockCompanies;
    }
  });
  
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        // Ensure dates are properly converted back to Date objects
        return parsed.map((student: Student) => ({
          ...student,
          bookedInterviews: student.bookedInterviews.map((slot) => ({
            ...slot,
            date: new Date(slot.date)
          }))
        }));
      }
      return mockStudents;
    } catch (error) {
      console.error("Error loading students from localStorage:", error);
      return mockStudents;
    }
  });
  
  const [slots, setSlots] = useState<InterviewSlot[]>(() => {
    try {
      const savedSlots = localStorage.getItem('slots');
      if (savedSlots) {
        const parsed = JSON.parse(savedSlots);
        // Ensure dates are properly converted back to Date objects
        return parsed.map((slot: InterviewSlot) => ({
          ...slot,
          date: new Date(slot.date)
        }));
      }
      return interviewSlots;
    } catch (error) {
      console.error("Error loading slots from localStorage:", error);
      return interviewSlots;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('companies', JSON.stringify(companies));
      localStorage.setItem('students', JSON.stringify(students));
      localStorage.setItem('slots', JSON.stringify(slots));
      
      console.log("UseEffect: Saved to localStorage - companies:", companies);
      console.log("UseEffect: Saved to localStorage - slots:", slots);
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Failed to save data locally. Your changes may not persist.",
        variant: "destructive",
      });
    }
  }, [companies, students, slots]);

  // Refresh function to force a UI update
  const refresh = useCallback(() => {
    try {
      // Load the latest data from localStorage
      const savedCompanies = localStorage.getItem('companies');
      const savedStudents = localStorage.getItem('students');
      const savedSlots = localStorage.getItem('slots');
      
      console.log("Refresh function called - reading from localStorage");
      
      if (savedCompanies) {
        const parsedCompanies = JSON.parse(savedCompanies);
        console.log("Found saved companies:", parsedCompanies);
        // Ensure dates are properly converted back to Date objects
        setCompanies(parsedCompanies.map((company: Company) => ({
          ...company,
          availableSlots: company.availableSlots.map((slot) => ({
            ...slot,
            date: new Date(slot.date)
          }))
        })));
      }
      
      if (savedStudents) {
        const parsedStudents = JSON.parse(savedStudents);
        // Ensure dates are properly converted back to Date objects
        setStudents(parsedStudents.map((student: Student) => ({
          ...student,
          bookedInterviews: student.bookedInterviews.map((slot) => ({
            ...slot,
            date: new Date(slot.date)
          }))
        })));
      }
      
      if (savedSlots) {
        const parsedSlots = JSON.parse(savedSlots);
        console.log("Found saved slots:", parsedSlots);
        // Ensure dates are properly converted back to Date objects
        setSlots(parsedSlots.map((slot: InterviewSlot) => ({
          ...slot,
          date: new Date(slot.date)
        })));
      }
    } catch (error) {
      console.error("Error refreshing data from localStorage:", error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Get student by ID
  const getStudentById = useCallback((studentId: string) => {
    return students.find((student) => student.id === studentId);
  }, [students]);

  // Get company by ID - updated to always get fresh data from state
  const getCompanyById = useCallback((companyId: string) => {
    return companies.find((company) => company.id === companyId);
  }, [companies]);

  // Utility hooks that contain the actual implementation
  const companyOps = useCompanyOperations(companies, setCompanies, students, setStudents, slots, setSlots);
  const studentOps = useStudentOperations(students, setStudents, companies, setCompanies, slots, setSlots);
  const slotOps = useSlotOperations(slots, setSlots, companies, setCompanies, students, setStudents);
  const importOps = useImportOperations(setCompanies, setStudents, students, companies);
  const scheduleOps = useScheduleOperations(companies);

  return {
    companies,
    students,
    slots,
    refresh,
    getStudentById,
    getCompanyById,
    ...companyOps,
    ...studentOps,
    ...slotOps,
    ...importOps,
    ...scheduleOps
  };
};
