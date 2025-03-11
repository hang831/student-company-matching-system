
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { InterviewSlot } from "@/types";

// Define the offer status types
type OfferStatus = "pending" | "offered" | "accepted" | "rejected" | "withdrawn";

// Define the mapping between offer status and cell colors
const statusColorMap: Record<OfferStatus, string> = {
  pending: "bg-orange-100",
  offered: "bg-blue-100",
  accepted: "bg-green-100",
  rejected: "bg-red-100",
  withdrawn: "bg-gray-100"
};

const OffersManagement = () => {
  const { companies, students, slots } = useInternshipSystem();
  const [offerStatuses, setOfferStatuses] = useState<Record<string, Record<string, OfferStatus>>>({});
  
  // Initialize offer statuses for all booked interviews and load from localStorage on first load
  useEffect(() => {
    const savedStatuses = localStorage.getItem('offerStatuses');
    
    if (savedStatuses) {
      setOfferStatuses(JSON.parse(savedStatuses));
    } else {
      const bookedSlots = slots.filter(slot => slot.booked);
      const statusMap: Record<string, Record<string, OfferStatus>> = {};
      
      bookedSlots.forEach(slot => {
        if (slot.studentId && slot.companyId) {
          if (!statusMap[slot.studentId]) {
            statusMap[slot.studentId] = {};
          }
          statusMap[slot.studentId][slot.companyId] = "pending";
        }
      });
      
      setOfferStatuses(statusMap);
    }
  }, [slots]);
  
  // Save offer statuses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offerStatuses', JSON.stringify(offerStatuses));
  }, [offerStatuses]);

  // Handle offer status change
  const handleStatusChange = (studentId: string, companyId: string, status: OfferStatus) => {
    setOfferStatuses(prev => {
      const newStatuses = { ...prev };
      if (!newStatuses[studentId]) {
        newStatuses[studentId] = {};
      }
      newStatuses[studentId][companyId] = status;
      return newStatuses;
    });
    
    const company = companies.find(c => c.id === companyId);
    const student = students.find(s => s.id === studentId);
    
    toast({
      title: `Offer status updated`,
      description: `${student?.name}'s offer from ${company?.name} is now ${status}.`,
    });
  };
  
  // Format date and time for display
  const formatSlotTime = (slot: InterviewSlot) => {
    return {
      date: format(new Date(slot.date), "MMM d"),
      time: `${slot.startTime} - ${slot.endTime}`
    };
  };
  
  // Get the booked interview for a student-company pair
  const getBookedSlot = (studentId: string, companyId: string) => {
    return slots.find(slot => 
      slot.studentId === studentId && 
      slot.companyId === companyId &&
      slot.booked
    );
  };
  
  // Check if the matrix is empty
  const isMatrixEmpty = () => {
    const bookedSlots = slots.filter(slot => slot.booked);
    return bookedSlots.length === 0 || companies.length === 0 || students.length === 0;
  };
  
  if (isMatrixEmpty()) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-semibold mb-4">No Interviews Scheduled</h2>
        <p className="text-muted-foreground">
          Book interviews in the "Interview Schedule" tab to manage offers.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Offers Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Offers Status Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Student</TableHead>
                  {companies.map(company => (
                    <TableHead key={company.id}>
                      <div>{company.name}</div>
                      <div className="text-xs font-normal">Intake: {company.intakeNumber}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {companies.map(company => {
                      const slot = getBookedSlot(student.id, company.id);
                      const offerStatus = offerStatuses[student.id]?.[company.id] || "pending";
                      
                      if (slot) {
                        const slotInfo = formatSlotTime(slot);
                        return (
                          <TableCell 
                            key={company.id} 
                            className={statusColorMap[offerStatus]}
                          >
                            <div className="flex flex-col space-y-2">
                              <div className="text-xs">
                                <div>{slotInfo.date}</div>
                                <div>{slotInfo.time}</div>
                              </div>
                              <Select 
                                value={offerStatus} 
                                onValueChange={(value: OfferStatus) => 
                                  handleStatusChange(student.id, company.id, value)
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="offered">Offered</SelectItem>
                                  <SelectItem value="accepted">Accepted</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        );
                      }
                      return <TableCell key={company.id}></TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-100 mr-2"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 mr-2"></div>
          <span className="text-sm">Offered</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 mr-2"></div>
          <span className="text-sm">Accepted</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 mr-2"></div>
          <span className="text-sm">Rejected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 mr-2"></div>
          <span className="text-sm">Withdrawn</span>
        </div>
      </div>
    </div>
  );
};

export default OffersManagement;
