
import { Company, Student, InterviewSlot } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useCompanyOperations = (
  companies: Company[],
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  slots: InterviewSlot[],
  setSlots: React.Dispatch<React.SetStateAction<InterviewSlot[]>>
) => {
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
    // Create a deep copy to avoid reference issues
    const updatedCompanyCopy = JSON.parse(JSON.stringify(updatedCompany));
    
    // Update the companies array
    const updatedCompanies = companies.map((company) =>
      company.id === updatedCompanyCopy.id ? updatedCompanyCopy : company
    );
    
    // Set the new companies array
    setCompanies(updatedCompanies);
    
    // Immediately save to localStorage to ensure persistence
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    
    toast({
      title: "Company updated",
      description: `${updatedCompanyCopy.name} has been updated successfully.`,
    });
    
    // Return the updated company for immediate use if needed
    return updatedCompanyCopy;
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

  return {
    addCompany,
    updateCompany,
    deleteCompany
  };
};
