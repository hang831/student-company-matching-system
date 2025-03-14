
import { useState, useEffect, useCallback } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Company } from "@/types";
import { Clock } from "lucide-react";
import TimeslotManager from "./TimeslotManager";
import { toast } from "@/hooks/use-toast";

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
}

const CompanyDetails = ({ company, onClose }: CompanyDetailsProps) => {
  const { updateCompany, getStudentById, toggleSlotAvailability, getCompanyById, refresh } = useInternshipSystem();
  const [editedCompany, setEditedCompany] = useState<Company>({...company});
  const [activeTab, setActiveTab] = useState("details");
  
  // Refresh company data whenever tab changes
  useEffect(() => {
    // Initial full refresh when component mounts or tab changes
    refresh();
    const refreshedCompany = getCompanyById(company.id);
    if (refreshedCompany) {
      // Only update the availableSlots part to preserve form edits
      setEditedCompany(prev => ({
        ...prev,
        availableSlots: refreshedCompany.availableSlots || []
      }));
    }
  }, [company.id, getCompanyById, activeTab, refresh]);

  // Format time for display (convert "1930" to "19:30")
  const formatTimeForDisplay = (time: string) => {
    // If the time contains a colon already, return it as is
    if (time.includes(':')) return time;
    
    // For 3-digit format like "930", add a leading 0 to make "0930"
    let formattedTime = time.length === 3 ? `0${time}` : time;
    
    // Add a colon before the last two digits: "0930" -> "09:30"
    return `${formattedTime.slice(0, -2)}:${formattedTime.slice(-2)}`;
  };

  const handleInputChange = (field: keyof Company, value: string | number) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = useCallback(() => {
    try {
      // Create a copy of the edited company data to update
      const companyToUpdate = {
        ...editedCompany,
        // Ensure we have the latest availableSlots
        availableSlots: getCompanyById(company.id)?.availableSlots || editedCompany.availableSlots || []
      };

      // Call the update function
      updateCompany(companyToUpdate);
      
      toast({
        title: "Company Updated",
        description: "Company information has been saved successfully.",
      });
      
      // Give time for data to be saved before closing
      setTimeout(() => {
        refresh();
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error saving company details:", error);
      toast({
        title: "Error",
        description: "Failed to save company details. Please try again.",
        variant: "destructive",
      });
    }
  }, [editedCompany, company.id, getCompanyById, updateCompany, onClose, refresh]);

  const handleToggleAvailability = useCallback((slotId: string) => {
    if (toggleSlotAvailability(slotId)) {
      // Update the company data after toggling
      refresh();
      const refreshedCompany = getCompanyById(company.id);
      if (refreshedCompany) {
        setEditedCompany(prev => ({
          ...prev,
          availableSlots: refreshedCompany.availableSlots || []
        }));
      }
    }
  }, [toggleSlotAvailability, company.id, getCompanyById, refresh]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
          <DialogDescription>View and edit company information</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeslots">Timeslots</TabsTrigger>
            <TabsTrigger value="interviews">Booked Interviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={editedCompany.name}
                onChange={(e) =>
                  handleInputChange('name', e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editedCompany.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="intake">Intake Number</Label>
              <Input
                id="intake"
                type="number"
                min={1}
                value={editedCompany.intakeNumber}
                onChange={(e) =>
                  handleInputChange('intakeNumber', parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interviewPlace">Interview Place</Label>
              <Input
                id="interviewPlace"
                value={editedCompany.interviewPlace || ""}
                onChange={(e) =>
                  handleInputChange('interviewPlace', e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={editedCompany.contactPerson || ""}
                onChange={(e) =>
                  handleInputChange('contactPerson', e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allowance">Allowance</Label>
              <Input
                id="allowance"
                value={editedCompany.allowance || ""}
                onChange={(e) =>
                  handleInputChange('allowance', e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={editedCompany.remarks || ""}
                onChange={(e) =>
                  handleInputChange('remarks', e.target.value)
                }
              />
            </div>
          </TabsContent>
          
          <TabsContent value="timeslots">
            <TimeslotManager companyId={company.id} />
          </TabsContent>
          
          <TabsContent value="interviews">
            {editedCompany.availableSlots && editedCompany.availableSlots.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Student</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedCompany.availableSlots.map((slot) => {
                    const student = slot.studentId ? getStudentById(slot.studentId) : null;
                    
                    return (
                      <TableRow key={slot.id} className={!slot.isAvailable ? "opacity-60" : ""}>
                        <TableCell>{format(new Date(slot.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={slot.isAvailable}
                            onCheckedChange={() => handleToggleAvailability(slot.id)}
                            disabled={slot.booked}
                          />
                        </TableCell>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No interview slots available.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetails;
