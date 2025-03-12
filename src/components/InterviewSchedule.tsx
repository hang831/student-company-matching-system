import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Trash2, Download } from "lucide-react";
import { InterviewSlot, Student, Company } from "@/types";
import { downloadExcelFile } from "@/utils/excelUtils";

interface InterviewScheduleProps {
  sortMode: string;
}

const InterviewSchedule = ({ sortMode }: InterviewScheduleProps) => {
  const { companies, students, slots, bookInterviewSlot, getStudentById, removeTimeslot, getCompanyById, sortSlotsByDate, sortSlotsByCompanyAndDate } = useInternshipSystem();
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [localSlots, setLocalSlots] = useState(slots);
  
  // Update local slots whenever the global slots change
  useEffect(() => {
    const sortedSlots = sortMode === "company" 
      ? sortSlotsByCompanyAndDate(slots)
      : sortSlotsByDate(slots);
    setLocalSlots(sortedSlots);
  }, [slots, sortMode, sortSlotsByDate, sortSlotsByCompanyAndDate]);

  // Group slots by date or by company based on sortMode
  const slotsByGroup = localSlots.reduce((acc, slot) => {
    let groupKey;
    
    if (sortMode === "company") {
      const company = companies.find(c => c.id === slot.companyId);
      groupKey = company ? company.name : "Unknown Company";
    } else {
      // Default is date
      groupKey = format(new Date(slot.date), "yyyy-MM-dd");
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(slot);
    return acc;
  }, {} as Record<string, InterviewSlot[]>);

  // Handle booking a slot
  const handleBookSlot = () => {
    if (selectedSlot && selectedStudentId) {
      bookInterviewSlot(selectedSlot.id, selectedStudentId);
      setSelectedSlot(null);
      setSelectedStudentId("");
    }
  };

  // Function to download interview details
  const downloadInterviewDetails = (slot: InterviewSlot) => {
    const student = slot.studentId ? getStudentById(slot.studentId) : null;
    const company = companies.find(c => c.id === slot.companyId);
    
    if (!student || !company) return;
    
    const content = `Dear ${student.name}
Interview Schedule:
${company.name}
${format(new Date(slot.date), "EEEE, MMMM d, yyyy")}, ${slot.startTime} - ${slot.endTime}
${company.interviewPlace || "TBA"}
${company.remarks || ""}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview_${student.name}_${company.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get students who have a preference for a specific company
  const getStudentsWithPreference = (companyId: string) => {
    return students.filter(student => 
      student.preferences.some(pref => pref.companyId === companyId && pref.rank >= 1 && pref.rank <= 5)
    );
  };

  // Function to download the preference matrix data as Excel
  const downloadPreferenceMatrix = () => {
    // Create header row with company names
    const headers = ["Student", ...companies.map(company => company.name)];
    
    // Create data rows
    const rows = students.map(student => {
      const rowData = [student.name];
      companies.forEach(company => {
        const preference = student.preferences.find(p => p.companyId === company.id);
        rowData.push(preference && preference.rank >= 1 && preference.rank <= 5 ? preference.rank.toString() : "");
      });
      return rowData;
    });
    
    // Add preference count row
    const preferenceCount = ["Preference Count"];
    companies.forEach(company => {
      const count = students.reduce((total, student) => {
        const hasPreference = student.preferences.some(
          pref => pref.companyId === company.id && pref.rank >= 1 && pref.rank <= 5
        );
        return hasPreference ? total + 1 : total;
      }, 0);
      preferenceCount.push(count.toString());
    });
    
    // Combine all rows with headers
    const allRows = [headers, preferenceCount, ...rows];
    
    // Download as Excel
    downloadExcelFile(allRows, "student_preferences_matrix.xlsx");
  };

  // Function to download the schedule matrix data as Excel
  const downloadScheduleMatrix = () => {
    // Create header row with company names
    const headers = ["Student", ...companies.map(company => company.name)];
    
    // Create data rows
    const rows = students.map(student => {
      const rowData = [student.name];
      
      companies.forEach(company => {
        let cellData = "";
        
        // Find if there's a booked slot for this student and company
        const slot = slots.find(
          s => s.studentId === student.id && s.companyId === company.id && s.booked
        );
        
        if (slot) {
          const date = format(new Date(slot.date), "MMM d");
          const time = `${slot.startTime} - ${slot.endTime}`;
          cellData = `${date}, ${time}`;
        }
        
        rowData.push(cellData);
      });
      
      return rowData;
    });
    
    // Add intake row
    const intakeRow = ["Intake"];
    companies.forEach(company => {
      intakeRow.push(company.intakeNumber.toString());
    });
    
    // Combine all rows with headers
    const allRows = [headers, intakeRow, ...rows];
    
    // Download as Excel
    downloadExcelFile(allRows, "interview_schedule_matrix.xlsx");
  };

  // Create preference matrix
  const preferenceMatrix = () => {
    if (companies.length === 0 || students.length === 0) {
      return null;
    }
    
    // Count preferences for each company
    const preferenceCount: Record<string, number> = {};
    companies.forEach(company => {
      preferenceCount[company.id] = students.reduce((count, student) => {
        const hasPreference = student.preferences.some(
          pref => pref.companyId === company.id && pref.rank >= 1 && pref.rank <= 5
        );
        return hasPreference ? count + 1 : count;
      }, 0);
    });
    
    return (
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Preferences Matrix</CardTitle>
          <Button variant="outline" size="sm" onClick={downloadPreferenceMatrix}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
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
                      <div className="text-xs font-normal">Selected: {preferenceCount[company.id]}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {companies.map(company => {
                      const preference = student.preferences.find(p => p.companyId === company.id);
                      return (
                        <TableCell 
                          key={company.id} 
                          className={preference && preference.rank >= 1 && preference.rank <= 5 ? "bg-yellow-100" : ""}
                        >
                          {preference && preference.rank >= 1 && preference.rank <= 5 ? preference.rank : ""}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interview Schedule Matrix</CardTitle>
          <Button variant="outline" size="sm" onClick={downloadScheduleMatrix}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
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
      {preferenceMatrix()}

      {Object.entries(slotsByGroup).map(([groupKey, groupSlots]) => {
        // Determine title based on sort mode
        const title = sortMode === "company" 
          ? groupKey // Just show company name
          : format(new Date(groupKey), "EEEE, MMMM d, yyyy"); // Format date
        
        return (
          <Card key={groupKey} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {sortMode === "company" 
                  ? <span>{title}</span>
                  : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      {title}
                    </>
                  )
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {sortMode === "company" && <TableHead>Date</TableHead>}
                    <TableHead>Time</TableHead>
                    <TableHead>{sortMode === "company" ? "Status" : "Company"}</TableHead>
                    <TableHead>{sortMode === "company" ? "Student" : "Status"}</TableHead>
                    <TableHead>{sortMode === "company" ? "Action" : "Student"}</TableHead>
                    {sortMode !== "company" && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupSlots.map((slot) => {
                    const company = companies.find(c => c.id === slot.companyId);
                    const student = slot.studentId ? getStudentById(slot.studentId) : null;
                    
                    return (
                      <TableRow key={slot.id} className={!slot.isAvailable ? "opacity-60" : ""}>
                        {sortMode === "company" && (
                          <TableCell>
                            {format(new Date(slot.date), "MMM d, yyyy")}
                          </TableCell>
                        )}
                        <TableCell className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>
                          {sortMode === "company" ? (
                            slot.booked ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Booked
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {slot.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            )
                          ) : (
                            company?.name || "Unknown"
                          )}
                        </TableCell>
                        <TableCell>
                          {sortMode === "company" ? (
                            student?.name || "-"
                          ) : (
                            slot.booked ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Booked
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {slot.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {sortMode === "company" ? (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot.booked ? "Edit" : "Book"}
                              </Button>
                              
                              {slot.booked && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadInterviewDetails(slot)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeTimeslot(slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            student?.name || "-"
                          )}
                        </TableCell>
                        {sortMode !== "company" && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot.booked ? "Edit" : "Book"}
                              </Button>
                              
                              {slot.booked && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadInterviewDetails(slot)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeTimeslot(slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {selectedSlot && (
        <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSlot.booked ? "Edit" : "Book"} Interview Slot</DialogTitle>
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
                    <SelectValue placeholder={selectedSlot.booked ? getStudentById(selectedSlot.studentId || "")?.name || "Select a student" : "Select a student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getStudentsWithPreference(selectedSlot.companyId).map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} 
                        {student.preferences.find(p => p.companyId === selectedSlot.companyId)
                          ? ` (Rank: ${student.preferences.find(p => p.companyId === selectedSlot.companyId)?.rank})`
                          : ""
                        }
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
