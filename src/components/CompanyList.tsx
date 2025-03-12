
import { useState, useEffect } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, Edit, Trash } from "lucide-react";
import CompanyDetails from "./CompanyDetails";
import { Company } from "@/types";

const CompanyList = () => {
  const { companies, addCompany, deleteCompany, refresh } = useInternshipSystem();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    intakeNumber: 1,
    interviewPlace: "",
    contactPerson: "",
    allowance: "",
    remarks: ""
  });
  
  // Force re-render when companies change
  const [, setForceUpdate] = useState<number>(0);
  
  useEffect(() => {
    // Force component to re-render when companies change
    setForceUpdate(prev => prev + 1);
  }, [companies]);

  // Additional effect to periodically refresh data from storage
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh(); // Call the refresh function from the hook
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [refresh]);

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.description) {
      addCompany(newCompany);
      setNewCompany({
        name: "",
        description: "",
        intakeNumber: 1,
        interviewPlace: "",
        contactPerson: "",
        allowance: "",
        remarks: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteCompany = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
    }
  };
  
  const handleCompanyDetailsClosed = () => {
    // Get fresh data from storage
    refresh();
    setSelectedCompany(null);
    // Force re-render to reflect updates
    setForceUpdate(prev => prev + 1);
  };

  // Function to open company details with the latest data
  const openCompanyDetails = (company: Company) => {
    refresh(); // Refresh data first
    // Use the latest company data
    setSelectedCompany(company);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Companies</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Complete the form to add a new company.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCompany.description}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="intake">Intake Number</Label>
                <Input
                  id="intake"
                  type="number"
                  min={1}
                  value={newCompany.intakeNumber}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      intakeNumber: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interviewPlace">Interview Place</Label>
                <Input
                  id="interviewPlace"
                  value={newCompany.interviewPlace}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, interviewPlace: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newCompany.contactPerson}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowance">Allowance</Label>
                <Input
                  id="allowance"
                  value={newCompany.allowance}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, allowance: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={newCompany.remarks}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, remarks: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAddCompany}>Add Company</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{company.name}</CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {company.description}
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-medium">Intake:</span> {company.intakeNumber} students</p>
                <p className="text-sm"><span className="font-medium">Place:</span> {company.interviewPlace || "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Contact:</span> {company.contactPerson || "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Allowance:</span> {company.allowance || "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Remarks:</span> {company.remarks || "N/A"}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompanyToDelete(company);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the company "{company.name}" and all its associated data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCompany} className="bg-red-500 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCompanyDetails(company);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCompany && (
        <CompanyDetails
          company={selectedCompany}
          onClose={handleCompanyDetailsClosed}
        />
      )}
    </div>
  );
};

export default CompanyList;
