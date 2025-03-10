
import { useState } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, Edit } from "lucide-react";
import CompanyDetails from "./CompanyDetails";
import { Company } from "@/types";

const CompanyList = () => {
  const { companies, addCompany } = useInternshipSystem();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    intakeNumber: 1,
  });

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.description) {
      addCompany(newCompany);
      setNewCompany({
        name: "",
        description: "",
        intakeNumber: 1,
      });
      setIsAddDialogOpen(false);
    }
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
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Intake:</span> {company.intakeNumber} students
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCompany(company)}
                >
                  <Edit className="h-4 w-4 mr-1" /> View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCompany && (
        <CompanyDetails
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default CompanyList;
