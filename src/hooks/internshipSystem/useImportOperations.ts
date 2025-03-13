
import { CompanyImportData, StudentImportData, PreferenceImportData, Student, Company } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useImportOperations = (
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  students: Student[],
  companies: Company[]
) => {
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
      
      // Update state with new companies - REPLACE existing companies instead of adding to them
      setCompanies(newCompanies);
      console.log("Companies after import:", newCompanies); // Debug log
      
      // Save to local storage immediately
      localStorage.setItem('companies', JSON.stringify(newCompanies));
      
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
      
      // Update state with new students - REPLACE existing students instead of adding to them
      setStudents(newStudents);
      console.log("Students after import:", newStudents); // Debug log
      
      // Save to local storage immediately
      localStorage.setItem('students', JSON.stringify(newStudents));
      
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
        const preference = {
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
      
      // Save to local storage immediately
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
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
    importCompanies,
    importStudents,
    importPreferences
  };
};
