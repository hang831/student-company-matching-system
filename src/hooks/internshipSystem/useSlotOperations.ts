
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

  return {
    toggleSlotAvailability,
    addTimeslot,
    removeTimeslot,
    bookInterviewSlot,
    getAvailableSlotsForCompany
  };
};
