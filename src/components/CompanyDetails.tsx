
import { useState } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Company } from "@/types";

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
}

const CompanyDetails = ({ company, onClose }: CompanyDetailsProps) => {
  const { updateCompany, getStudentById } = useInternshipSystem();
  const [editedCompany, setEditedCompany] = useState<Company>({ ...company });

  const handleSave = () => {
    updateCompany(editedCompany);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="interviews">Interview Slots</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={editedCompany.name}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editedCompany.description}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, description: e.target.value })
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
                  setEditedCompany({
                    ...editedCompany,
                    intakeNumber: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </TabsContent>
          
          <TabsContent value="interviews">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.availableSlots.map((slot) => {
                  const student = slot.studentId ? getStudentById(slot.studentId) : null;
                  
                  return (
                    <TableRow key={slot.id}>
                      <TableCell>{format(slot.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                      <TableCell>
                        {slot.booked ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Available
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
