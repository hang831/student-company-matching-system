
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";
import { InterviewSlot, Student, Company } from "@/types";

const InterviewSchedule = () => {
  const { companies, students, slots, bookInterviewSlot, getStudentById } = useInternshipSystem();
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [localSlots, setLocalSlots] = useState(slots);
  
  // Update local slots whenever the global slots change
  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);

  // Group slots by date
  const slotsByDate = localSlots.reduce((acc, slot) => {
    const dateStr = format(new Date(slot.date), "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(slot);
    return acc;
  }, {} as Record<string, InterviewSlot[]>);

  const handleBookSlot = () => {
    if (selectedSlot && selectedStudentId) {
      bookInterviewSlot(selectedSlot.id, selectedStudentId);
      setSelectedSlot(null);
      setSelectedStudentId("");
    }
  };

  // Create a matrix representation of the schedule for visualization
  const scheduleMatrix = () => {
    // Filter for only booked slots
    const bookedSlots = slots.filter(slot => slot.booked);
    
    // Skip if we don't have any booked slots or companies or students
    if (bookedSlots.length === 0 || companies.length === 0 || students.length === 0) {
      return null;
    }
    
    // Format for table cell display: {slotId: {date, time}}
    const formatSlotTime = (slot: InterviewSlot) => {
      return {
        date: format(new Date(slot.date), "MMM d"),
        time: `${slot.startTime} - ${slot.endTime}`
      };
    };
    
    // Create data structure for matrix: {studentId: {companyId: slotInfo}}
    const matrix: Record<string, Record<string, {date: string, time: string}>> = {};
    
    // Initialize matrix with all students and companies
    students.forEach(student => {
      matrix[student.id] = {};
    });
    
    // Fill in booked slots
    bookedSlots.forEach(slot => {
      if (slot.studentId && slot.companyId) {
        if (!matrix[slot.studentId]) {
          matrix[slot.studentId] = {};
        }
        matrix[slot.studentId][slot.companyId] = formatSlotTime(slot);
      }
    });
    
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Interview Schedule Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Student</TableHead>
                  {companies.map(company => (
                    <TableHead key={company.id}>{company.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {companies.map(company => {
                      const slotInfo = matrix[student.id]?.[company.id];
                      return (
                        <TableCell key={company.id} className={slotInfo ? "bg-orange-100" : ""}>
                          {slotInfo ? (
                            <div className="text-xs">
                              <div>{slotInfo.date}</div>
                              <div>{slotInfo.time}</div>
                            </div>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Interview Schedule</h2>
      </div>

      {scheduleMatrix()}

      {Object.entries(slotsByDate).map(([dateStr, daySlots]) => (
        <Card key={dateStr} className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {format(new Date(dateStr), "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daySlots.map((slot) => {
                  const company = companies.find(c => c.id === slot.companyId);
                  const student = slot.studentId ? getStudentById(slot.studentId) : null;
                  
                  return (
                    <TableRow key={slot.id} className={!slot.isAvailable ? "opacity-60" : ""}>
                      <TableCell className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell>{company?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {slot.booked ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {slot.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{student?.name || "-"}</TableCell>
                      <TableCell>
                        {!slot.booked && slot.isAvailable && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            Book
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {selectedSlot && (
        <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Interview Slot</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <p className="font-medium">Date & Time:</p>
                <p>{format(new Date(selectedSlot.date), "EEEE, MMMM d, yyyy")}, {selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>
              <div>
                <p className="font-medium">Company:</p>
                <p>{companies.find(c => c.id === selectedSlot.companyId)?.name}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Select Student:</p>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                Cancel
              </Button>
              <Button onClick={handleBookSlot} disabled={!selectedStudentId}>
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InterviewSchedule;
