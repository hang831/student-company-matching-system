
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
    
    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);
    
    // Save immediately to localStorage
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    
    toast({
      title: "Company added",
      description: `${company.name} has been added successfully.`,
    });
  };

  // Update company details
  const updateCompany = (updatedCompany: Company) => {
    // Log before update
    console.log("UpdateCompany - Company to update:", updatedCompany);
    
    // Find the current company from localStorage directly to get the most up-to-date data
    let currentCompany: Company | undefined;
    
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsedCompanies = JSON.parse(savedCompanies);
        currentCompany = parsedCompanies.find((c: Company) => c.id === updatedCompany.id);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    
    // If not found in localStorage, fall back to the companies array
    if (!currentCompany) {
      currentCompany = companies.find(c => c.id === updatedCompany.id);
    }
    
    if (!currentCompany) {
      console.error("UpdateCompany - Company not found:", updatedCompany.id);
      toast({
        title: "Error",
        description: "Company not found. Cannot update.",
        variant: "destructive",
      });
      return updatedCompany;
    }
    
    // Make sure we preserve the existing timeslots/availableSlots
    // Ensure we're using the most up-to-date availableSlots
    console.log("UpdateCompany - Current company availableSlots:", currentCompany.availableSlots?.length || 0);
    console.log("UpdateCompany - Updated company availableSlots:", updatedCompany.availableSlots?.length || 0);
    
    // Use the slots from updatedCompany if they exist, otherwise use the current company's slots
    const slotsToKeep = 
      (updatedCompany.availableSlots && updatedCompany.availableSlots.length > 0) 
        ? updatedCompany.availableSlots 
        : (currentCompany.availableSlots || []);
    
    // Create the merged company with preserved data
    const mergedCompany = {
      ...updatedCompany,
      availableSlots: slotsToKeep
    };
    
    console.log("UpdateCompany - Merged company with preserved slots:", mergedCompany);
    console.log("UpdateCompany - Preserved availableSlots count:", mergedCompany.availableSlots.length);
    
    // Update the companies array
    const updatedCompanies = companies.map((company) =>
      company.id === mergedCompany.id ? mergedCompany : company
    );
    
    // Set the new companies array
    setCompanies(updatedCompanies);
    
    // Immediately save to localStorage to ensure persistence
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    console.log("UpdateCompany - Saved to localStorage, companies count:", updatedCompanies.length);
    
    toast({
      title: "Company updated",
      description: `${mergedCompany.name} has been updated successfully.`,
    });
    
    // Return the updated company for immediate use if needed
    return mergedCompany;
  };

  // Delete company
  const deleteCompany = (companyId: string) => {
    // First, remove all interview slots associated with this company
    const companySlotIds = slots.filter(slot => slot.companyId === companyId).map(slot => slot.id);
    
    // Update bookings for any students who had booked with this company
    const updatedStudents = students.map(student => ({
      ...student,
      bookedInterviews: student.bookedInterviews.filter(
        interview => !companySlotIds.includes(interview.id)
      ),
      preferences: student.preferences.filter(
        pref => pref.companyId !== companyId
      )
    }));
    setStudents(updatedStudents);
    
    // Remove slots associated with this company
    const updatedSlots = slots.filter(slot => slot.companyId !== companyId);
    setSlots(updatedSlots);
    
    // Remove the company itself
    const updatedCompanies = companies.filter(company => company.id !== companyId);
    setCompanies(updatedCompanies);
    
    // Save all changes to localStorage
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.setItem('slots', JSON.stringify(updatedSlots));
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    
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
