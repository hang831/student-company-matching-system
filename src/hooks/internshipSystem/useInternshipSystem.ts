
import { useState, useEffect } from "react";
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
    const savedCompanies = localStorage.getItem('companies');
    return savedCompanies ? JSON.parse(savedCompanies) : mockCompanies;
  });
  
  const [students, setStudents] = useState<Student[]>(() => {
    const savedStudents = localStorage.getItem('students');
    return savedStudents ? JSON.parse(savedStudents) : mockStudents;
  });
  
  const [slots, setSlots] = useState<InterviewSlot[]>(() => {
    const savedSlots = localStorage.getItem('slots');
    return savedSlots ? JSON.parse(savedSlots) : interviewSlots;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('slots', JSON.stringify(slots));
  }, [companies, students, slots]);

  // Refresh function to force a UI update
  const refresh = () => {
    // Load the latest data from localStorage
    const savedCompanies = localStorage.getItem('companies');
    const savedStudents = localStorage.getItem('students');
    const savedSlots = localStorage.getItem('slots');
    
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedSlots) setSlots(JSON.parse(savedSlots));
  };

  // Get student by ID
  const getStudentById = (studentId: string) => {
    return students.find((student) => student.id === studentId);
  };

  // Get company by ID - updated to always get fresh data from state
  const getCompanyById = (companyId: string) => {
    return companies.find((company) => company.id === companyId);
  };

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
