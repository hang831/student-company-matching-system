
import { Student, Company, InterviewSlot, StudentPreference } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useStudentOperations = (
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  companies: Company[],
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  slots: InterviewSlot[],
  setSlots: React.Dispatch<React.SetStateAction<InterviewSlot[]>>
) => {
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

  return {
    addStudent,
    deleteStudent,
    updateStudent,
    addStudentPreference
  };
};
