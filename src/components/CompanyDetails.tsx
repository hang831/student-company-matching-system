
import { useState, useEffect } from "react";
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

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
}

const CompanyDetails = ({ company, onClose }: CompanyDetailsProps) => {
  const { updateCompany, getStudentById, toggleSlotAvailability, getCompanyById } = useInternshipSystem();
  const [editedCompany, setEditedCompany] = useState<Company>(() => {
    // Create a deep copy of the company object
    return JSON.parse(JSON.stringify(company));
  });
  const [activeTab, setActiveTab] = useState("details");
  
  // Refresh only the slots data whenever company changes
  useEffect(() => {
    const refreshData = () => {
      const refreshedCompany = getCompanyById(company.id);
      if (refreshedCompany) {
        // Only update slots data to preserve form edits
        setEditedCompany(prevCompany => {
          // Create a deep copy of the previous state to avoid mutation
          const updatedCompany = JSON.parse(JSON.stringify(prevCompany));
          // Only update availableSlots to preserve edits in details tab
          updatedCompany.availableSlots = JSON.parse(JSON.stringify(refreshedCompany.availableSlots));
          return updatedCompany;
        });
      }
    };
    
    refreshData();
    // Set up a small interval to refresh data periodically
    const intervalId = setInterval(refreshData, 1000);
    
    return () => clearInterval(intervalId);
  }, [company.id, getCompanyById]);

  const handleInputChange = (field: keyof Company, value: string | number) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Make a copy of the edited company with all form changes
    const companyToUpdate = JSON.parse(JSON.stringify(editedCompany));
    
    // Get the latest availableSlots data directly from the source
    const latestCompany = getCompanyById(company.id);
    if (latestCompany) {
      companyToUpdate.availableSlots = JSON.parse(JSON.stringify(latestCompany.availableSlots));
    }
    
    // Call the update function with our updated company object
    updateCompany(companyToUpdate);
    
    // Update the local state to reflect changes immediately
    setEditedCompany(companyToUpdate);
    
    // Close the dialog after saving
    onClose();
  };

  const handleToggleAvailability = (slotId: string) => {
    if (toggleSlotAvailability(slotId)) {
      // Update the company data after toggling
      const refreshedCompany = getCompanyById(company.id);
      if (refreshedCompany) {
        setEditedCompany(prevState => {
          // Create a deep copy of the previous state
          const updatedCompany = JSON.parse(JSON.stringify(prevState));
          // Update only the availableSlots property
          updatedCompany.availableSlots = JSON.parse(JSON.stringify(refreshedCompany.availableSlots));
          return updatedCompany;
        });
      }
    }
  };

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
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={slot.isAvailable}
                          onCheckedChange={() => handleToggleAvailability(slot.id)}
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
