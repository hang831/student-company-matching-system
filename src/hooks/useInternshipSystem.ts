import { useState, useEffect } from "react";
import { Company, Student, InterviewSlot, StudentPreference, CompanyImportData, StudentImportData, PreferenceImportData } from "@/types";
import { mockCompanies, mockStudents, interviewSlots } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

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

  // Add new company
  const addCompany = (company: Omit<Company, "id" | "availableSlots">) => {
    const newCompany: Company = {
      ...company,
      id: `c${Date.now()}`, // Use timestamp for unique IDs
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

  // Add student
  const addStudent = (student: Omit<Student, "id" | "preferences" | "bookedInterviews">) => {
    const newStudent: Student = {
      ...student,
      id: `s${Date.now()}`,
      preferences: [],
      bookedInterviews: [],
    };
    setStudents([...students, newStudent]);
    toast({
      title: "Student added",
      description: `${student.name} has been added successfully.`,
    });
  };

  // Delete student
  const deleteStudent = (studentId: string) => {
    // First, remove all bookings associated with this student
    const studentBookedSlotIds = slots.filter(slot => slot.studentId === studentId).map(slot => slot.id);
    
    // Update companies that had slots booked by this student
    setCompanies(
      companies.map(company => ({
        ...company,
        availableSlots: company.availableSlots.map(slot => {
          if (slot.studentId === studentId) {
            return {
              ...slot,
              booked: false,
              studentId: undefined
            };
          }
          return slot;
        })
      }))
    );
    
    // Update slots to remove the student ID and set as not booked
    setSlots(
      slots.map(slot => {
        if (slot.studentId === studentId) {
          return {
            ...slot,
            booked: false,
            studentId: undefined
          };
        }
        return slot;
      })
    );
    
    // Remove the student
    setStudents(students.filter(student => student.id !== studentId));
    
    toast({
      title: "Student deleted",
      description: "The student and all associated preferences have been removed.",
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
    
    // Remove from student booked interviews if it was booked
    if (slot.booked && slot.studentId) {
      setStudents(
        students.map(student => {
          if (student.id === slot.studentId) {
            return {
              ...student,
              bookedInterviews: student.bookedInterviews.filter(
                interview => interview.id !== slotId
              )
            };
          }
          return student;
        })
      );
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
          // If rank is 0, remove the preference
          if (preference.rank === 0) {
            return {
              ...student,
              preferences: student.preferences.filter(
                (pref) => pref.companyId !== preference.companyId
              ),
            };
          }
          
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

    // If this slot was previously booked by another student, update that student's bookings
    if (slot.booked && slot.studentId && slot.studentId !== studentId) {
      setStudents(
        students.map((student) => {
          if (student.id === slot.studentId) {
            return {
              ...student,
              bookedInterviews: student.bookedInterviews.filter(
                interview => interview.id !== slotId
              ),
            };
          }
          return student;
        })
      );
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

    // If the student already has this slot booked, don't duplicate it
    setStudents(
      students.map((student) => {
        if (student.id === studentId) {
          const hasBooking = student.bookedInterviews.some(
            interview => interview.id === slotId
          );
          
          if (hasBooking) {
            return {
              ...student,
              bookedInterviews: student.bookedInterviews.map(
                interview => interview.id === slotId ? updatedSlot : interview
              ),
            };
          } else {
            return {
              ...student,
              bookedInterviews: [...student.bookedInterviews, updatedSlot],
            };
          }
        }
        return student;
      })
    );

    toast({
      title: slot.booked ? "Interview updated" : "Interview booked",
      description: slot.booked 
        ? "Interview booking has been updated successfully." 
        : "Interview slot has been booked successfully.",
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

  // Import companies from CSV data
  const importCompanies = (companyDataList: CompanyImportData[]) => {
    try {
      if (!companyDataList || companyDataList.length === 0) {
        toast({
          title: "Import Error",
          description: "No valid company data found in the file.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Importing companies:", companyDataList); // Debug log
      
      // Generate unique IDs for new companies
      const newCompanies = companyDataList.map(companyData => ({
        ...companyData,
        id: `c${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        availableSlots: []
      }));
      
      // Update state with new companies
      setCompanies(prevCompanies => {
        const updatedCompanies = [...prevCompanies, ...newCompanies];
        console.log("Updated companies:", updatedCompanies); // Debug log
        
        // Save to local storage immediately
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        
        return updatedCompanies;
      });
      
      toast({
        title: "Companies Imported",
        description: `${newCompanies.length} companies have been imported successfully.`,
      });
    } catch (error) {
      console.error("Import companies error:", error);
      toast({
        title: "Import Error",
        description: "Failed to import companies. Please check the file format.",
        variant: "destructive",
      });
    }
  };
  
  // Import students from CSV data
  const importStudents = (studentDataList: StudentImportData[]) => {
    try {
      if (!studentDataList || studentDataList.length === 0) {
        toast({
          title: "Import Error",
          description: "No valid student data found in the file.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Importing students:", studentDataList); // Debug log
      
      // Generate unique IDs for new students
      const newStudents = studentDataList.map(studentData => ({
        ...studentData,
        id: `s${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preferences: [],
        bookedInterviews: []
      }));
      
      // Update state with new students
      setStudents(prevStudents => {
        const updatedStudents = [...prevStudents, ...newStudents];
        console.log("Updated students:", updatedStudents); // Debug log
        
        // Save to local storage immediately
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        
        return updatedStudents;
      });
      
      toast({
        title: "Students Imported",
        description: `${newStudents.length} students have been imported successfully.`,
      });
    } catch (error) {
      console.error("Import students error:", error);
      toast({
        title: "Import Error",
        description: "Failed to import students. Please check the file format.",
        variant: "destructive",
      });
    }
  };
  
  // Import student preferences from CSV data
  const importPreferences = (preferencesDataList: PreferenceImportData[]) => {
    try {
      if (!preferencesDataList || preferencesDataList.length === 0) {
        toast({
          title: "Import Error",
          description: "No valid preference data found in the file.",
          variant: "destructive",
        });
        return;
      }
      
      let updatedStudents = [...students];
      let processedCount = 0;

      // Process each preference in the import data
      preferencesDataList.forEach(prefData => {
        // Find student by student ID
        const studentIndex = updatedStudents.findIndex(s => s.studentId === prefData.studentId);
        if (studentIndex === -1) {
          console.warn(`Student with ID ${prefData.studentId} not found`);
          return;
        }
        
        // Find company by name
        const company = companies.find(c => c.name === prefData.companyName);
        if (!company) {
          console.warn(`Company with name ${prefData.companyName} not found`);
          return;
        }
        
        // Create the preference
        const preference: StudentPreference = {
          studentId: updatedStudents[studentIndex].id,
          companyId: company.id,
          rank: prefData.rank
        };
        
        // Add the preference directly to the student
        const student = updatedStudents[studentIndex];
        const existingPrefIndex = student.preferences.findIndex(
          (pref) => pref.companyId === preference.companyId
        );
        
        if (existingPrefIndex >= 0) {
          student.preferences[existingPrefIndex] = preference;
        } else {
          student.preferences.push(preference);
        }
        
        processedCount++;
      });
      
      // Update the state with all changes at once
      setStudents(updatedStudents);
      
      toast({
        title: "Preferences Imported",
        description: `${processedCount} student preferences have been imported successfully.`,
      });
    } catch (error) {
      console.error("Import preferences error:", error);
      toast({
        title: "Import Error",
        description: "Failed to import preferences. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  return {
    companies,
    students,
    slots,
    addCompany,
    updateCompany,
    deleteCompany,
    addStudent,
    deleteStudent,
    updateStudent,
    addTimeslot,
    removeTimeslot,
    addStudentPreference,
    bookInterviewSlot,
    getAvailableSlotsForCompany,
    getStudentById,
    getCompanyById,
    toggleSlotAvailability,
    importCompanies,
    importStudents,
    importPreferences,
    refresh
  };
};
