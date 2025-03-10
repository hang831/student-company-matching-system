
import { useState, useEffect } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterviewSlot } from "@/types";

interface TimeslotManagerProps {
  companyId: string;
}

const TimeslotManager = ({ companyId }: TimeslotManagerProps) => {
  const { addTimeslot, removeTimeslot, getCompanyById } = useInternshipSystem();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [company, setCompany] = useState(getCompanyById(companyId));
  
  // Refresh company data whenever it changes
  useEffect(() => {
    setCompany(getCompanyById(companyId));
  }, [companyId, getCompanyById]);
  
  const handleAddTimeslot = () => {
    if (!date || !startTime || !endTime) {
      return;
    }
    
    addTimeslot({
      date,
      startTime,
      endTime,
      companyId,
    });
    
    // Update the company data after adding a timeslot
    setCompany(getCompanyById(companyId));
    
    // Reset form
    setDate(undefined);
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Add Interview Timeslot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startTime"
                placeholder="HH:MM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endTime"
                placeholder="HH:MM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Button onClick={handleAddTimeslot} className="mt-4">
          Add Timeslot
        </Button>
      </div>
      
      {company && company.availableSlots.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Timeslots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {company.availableSlots.map((slot: InterviewSlot) => (
              <div 
                key={slot.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div>
                  <div className="font-medium">{format(new Date(slot.date), "MMM d, yyyy")}</div>
                  <div className="text-sm text-muted-foreground">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    removeTimeslot(slot.id);
                    // Update the company data after removing a timeslot
                    setCompany(getCompanyById(companyId));
                  }}
                  disabled={slot.booked}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeslotManager;
