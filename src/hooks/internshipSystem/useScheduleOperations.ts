
import { InterviewSlot, Company } from "@/types";

export const useScheduleOperations = (companies: Company[]) => {
  // Sort booked slots by date
  const sortSlotsByDate = (bookedSlots: InterviewSlot[]) => {
    return [...bookedSlots].sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      
      // If dates are equal, sort by time
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
  };

  // Sort booked slots by company and then date
  const sortSlotsByCompanyAndDate = (bookedSlots: InterviewSlot[]) => {
    return [...bookedSlots].sort((a, b) => {
      // First sort by company
      const companyA = companies.find(c => c.id === a.companyId)?.name || '';
      const companyB = companies.find(c => c.id === b.companyId)?.name || '';
      if (companyA < companyB) return -1;
      if (companyA > companyB) return 1;
      
      // If companies are equal, sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      
      // If dates are equal, sort by time
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
  };

  return {
    sortSlotsByDate,
    sortSlotsByCompanyAndDate
  };
};
