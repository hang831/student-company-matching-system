
import { InterviewSlot, Company, Student } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useSlotOperations = (
  slots: InterviewSlot[],
  setSlots: React.Dispatch<React.SetStateAction<InterviewSlot[]>>,
  companies: Company[],
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
) => {
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
    
    // Update global slots
    const updatedSlots = slots.map((s) => (s.id === slotId ? updatedSlot : s));
    setSlots(updatedSlots);

    // Update company availableSlots
    const updatedCompanies = companies.map((company) => {
      if (company.id === slot.companyId) {
        return {
          ...company,
          availableSlots: company.availableSlots.map((s) =>
            s.id === slotId ? updatedSlot : s
          ),
        };
      }
      return company;
    });
    setCompanies(updatedCompanies);

    // Save to localStorage immediately
    localStorage.setItem('slots', JSON.stringify(updatedSlots));
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));

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
    try {
      console.log("AddTimeslot - Adding timeslot with data:", { date, startTime, endTime, companyId });
      
      // Find the company
      const company = companies.find(c => c.id === companyId);
      if (!company) {
        toast({
          title: "Error",
          description: "Company not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Ensure date is a proper Date object
      const slotDate = new Date(date);
      if (isNaN(slotDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid date format.",
          variant: "destructive",
        });
        return false;
      }
      
      // Normalize time format (remove any colon if present)
      const normalizedStartTime = startTime.replace(':', '');
      const normalizedEndTime = endTime.replace(':', '');
      
      // Create new slot object with a unique ID
      const newSlot: InterviewSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: slotDate,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        companyId,
        booked: false,
        isAvailable: true,
      };
      
      console.log("AddTimeslot - Created new slot:", newSlot);
      
      // Get the latest company data from localStorage
      let currentCompany = company;
      try {
        const savedCompanies = localStorage.getItem('companies');
        if (savedCompanies) {
          const parsedCompanies = JSON.parse(savedCompanies);
          const foundCompany = parsedCompanies.find((c: Company) => c.id === companyId);
          if (foundCompany) {
            currentCompany = foundCompany;
          }
        }
      } catch (error) {
        console.error("AddTimeslot - Error getting company from localStorage:", error);
      }
      
      // Make sure availableSlots exists
      if (!currentCompany.availableSlots) {
        currentCompany.availableSlots = [];
      }
      
      // Update global slots state with immutable pattern
      const updatedSlots = [...slots, newSlot];
      setSlots(updatedSlots);
      
      // Update company state with immutable pattern, ensuring we preserve existing slots
      const updatedCompanies = companies.map((c) => {
        if (c.id === companyId) {
          const currentSlots = c.availableSlots || [];
          return {
            ...c,
            availableSlots: [...currentSlots, newSlot],
          };
        }
        return c;
      });
      
      // Set the updated companies state
      setCompanies(updatedCompanies);
      
      // Save to localStorage immediately to ensure persistence
      localStorage.setItem('slots', JSON.stringify(updatedSlots));
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      
      console.log("AddTimeslot - After adding timeslot - saved companies:", updatedCompanies);
      console.log("AddTimeslot - After adding timeslot - saved slots:", updatedSlots);
      
      toast({
        title: "Timeslot added",
        description: "A new interview timeslot has been added.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding timeslot:", error);
      toast({
        title: "Error",
        description: "Failed to add timeslot. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Remove timeslot - allows removal of booked slots
  const removeTimeslot = (slotId: string) => {
    try {
      const slot = slots.find((s) => s.id === slotId);
      
      if (!slot) {
        toast({
          title: "Error",
          description: "Interview slot not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // If slot is booked, remove it from student's booked interviews
      if (slot.booked && slot.studentId) {
        const updatedStudents = students.map(student => {
          if (student.id === slot.studentId) {
            return {
              ...student,
              bookedInterviews: student.bookedInterviews.filter(
                interview => interview.id !== slotId
              )
            };
          }
          return student;
        });
        setStudents(updatedStudents);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
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
      
      // Save to localStorage immediately to ensure persistence
      localStorage.setItem('slots', JSON.stringify(updatedSlots));
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      
      toast({
        title: slot.booked ? "Booked slot removed" : "Timeslot removed",
        description: slot.booked 
          ? "The booked interview slot has been removed and student notified." 
          : "The interview timeslot has been removed.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing timeslot:", error);
      toast({
        title: "Error",
        description: "Failed to remove timeslot. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Book interview slot
  const bookInterviewSlot = (slotId: string, studentId: string) => {
    try {
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
        const updatedStudents = students.map((student) => {
          if (student.id === slot.studentId) {
            return {
              ...student,
              bookedInterviews: student.bookedInterviews.filter(
                interview => interview.id !== slotId
              ),
            };
          }
          return student;
        });
        setStudents(updatedStudents);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
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
      
      // Update global slots
      const updatedSlots = slots.map((s) => (s.id === slotId ? updatedSlot : s));
      setSlots(updatedSlots);

      // Update companies
      const updatedCompanies = companies.map((company) => {
        if (company.id === slot.companyId) {
          return {
            ...company,
            availableSlots: company.availableSlots.map((s) =>
              s.id === slotId ? updatedSlot : s
            ),
          };
        }
        return company;
      });
      setCompanies(updatedCompanies);

      // Update students
      const updatedStudents = students.map((student) => {
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
      });
      setStudents(updatedStudents);
      
      // Save all updates to localStorage
      localStorage.setItem('slots', JSON.stringify(updatedSlots));
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      toast({
        title: slot.booked ? "Interview updated" : "Interview booked",
        description: slot.booked 
          ? "Interview booking has been updated successfully." 
          : "Interview slot has been booked successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error booking interview slot:", error);
      toast({
        title: "Error",
        description: "Failed to book interview slot. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get available slots for a company
  const getAvailableSlotsForCompany = (companyId: string) => {
    return slots.filter(
      (slot) => slot.companyId === companyId && !slot.booked && slot.isAvailable
    );
  };

  return {
    toggleSlotAvailability,
    addTimeslot,
    removeTimeslot,
    bookInterviewSlot,
    getAvailableSlotsForCompany
  };
};
