
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
import { toast } from "@/hooks/use-toast";

interface TimeslotManagerProps {
  companyId: string;
}

const TimeslotManager = ({ companyId }: TimeslotManagerProps) => {
  const { addTimeslot, removeTimeslot, getCompanyById, refresh } = useInternshipSystem();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [company, setCompany] = useState(getCompanyById(companyId));
  
  // Synchronize with the latest company data
  useEffect(() => {
    const refreshData = () => {
      console.log("TimeslotManager - Refreshing company data for ID:", companyId);
      const refreshedCompany = getCompanyById(companyId);
      
      if (refreshedCompany) {
        console.log("TimeslotManager - Refreshed company data:", refreshedCompany);
        console.log("TimeslotManager - Available slots count:", refreshedCompany.availableSlots?.length || 0);
        
        if (refreshedCompany.availableSlots && refreshedCompany.availableSlots.length > 0) {
          console.log("TimeslotManager - First slot:", refreshedCompany.availableSlots[0]);
        }
        
        setCompany(refreshedCompany);
      } else {
        console.error("TimeslotManager - Company not found:", companyId);
      }
    };
    
    // Initial refresh
    refreshData();
    
    // Set up refresh listener
    window.addEventListener('storage', refreshData);
    
    return () => {
      window.removeEventListener('storage', refreshData);
    };
  }, [companyId, getCompanyById]);
  
  const handleAddTimeslot = () => {
    if (!date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please provide date, start time, and end time.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate time format (just numerical digits, 3 or 4 characters)
    const timeRegex = /^\d{3,4}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      toast({
        title: "Invalid Time Format",
        description: "Please use time format like '1930' for 7:30 PM.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new date object to ensure it's passed properly
    const slotDate = new Date(date);
    
    console.log("Adding timeslot with data:", { date: slotDate, startTime, endTime, companyId });
    
    const success = addTimeslot({
      date: slotDate,
      startTime,
      endTime,
      companyId,
    });
    
    if (success) {
      // Reset form
      setDate(undefined);
      setStartTime("");
      setEndTime("");
      
      // Force refresh company data
      const refreshedCompany = getCompanyById(companyId);
      console.log("TimeslotManager - After adding, company data:", refreshedCompany);
      console.log("TimeslotManager - After adding, available slots count:", refreshedCompany?.availableSlots?.length || 0);
      
      if (refreshedCompany) {
        setCompany(refreshedCompany);
      }
      
      toast({
        title: "Timeslot Added",
        description: "New interview timeslot has been added successfully.",
      });
    }
  };

  // Format time for display (convert "1930" to "19:30")
  const formatTimeForDisplay = (time: string) => {
    // If the time contains a colon already, return it as is
    if (time.includes(':')) return time;
    
    // For 3-digit format like "930", add a leading 0 to make "0930"
    let formattedTime = time.length === 3 ? `0${time}` : time;
    
    // Add a colon before the last two digits: "0930" -> "09:30"
    return `${formattedTime.slice(0, -2)}:${formattedTime.slice(-2)}`;
  };

  // Debug log for available slots
  useEffect(() => {
    if (company) {
      console.log("TimeslotManager render - Company:", company.name);
      console.log("TimeslotManager render - Available slots count:", company.availableSlots?.length || 0);
    }
  }, [company]);

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
                placeholder="1930"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Use format: 1930 (for 7:30 PM)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endTime"
                placeholder="2000"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Use format: 2000 (for 8:00 PM)</p>
          </div>
        </div>
        
        <Button onClick={handleAddTimeslot} className="mt-4">
          Add Timeslot
        </Button>
      </div>
      
      {company && company.availableSlots && company.availableSlots.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Timeslots ({company.availableSlots.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {company.availableSlots.map((slot: InterviewSlot) => {
              console.log("Rendering slot:", slot);
              return (
                <div 
                  key={slot.id}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div>
                    <div className="font-medium">{format(new Date(slot.date), "MMM d, yyyy")}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (removeTimeslot(slot.id)) {
                        // Force refresh company data after removal
                        const refreshedCompany = getCompanyById(companyId);
                        if (refreshedCompany) {
                          setCompany(refreshedCompany);
                        }
                      }
                    }}
                    disabled={slot.booked}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No timeslots available. Add one above.
        </div>
      )}
    </div>
  );
};

export default TimeslotManager;
