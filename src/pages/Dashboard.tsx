
import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyList from "@/components/CompanyList";
import StudentList from "@/components/StudentList";
import InterviewSchedule from "@/components/InterviewSchedule";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { downloadTemplate, generateCompanyTemplate, generateStudentTemplate, parseCSV, mapCSVToCompanyData, mapCSVToStudentData } from "@/utils/excelUtils";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { importCompanies, importStudents } = useInternshipSystem();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<"companies" | "students">("companies");
  
  const handleDownloadTemplate = (type: "companies" | "students") => {
    if (type === "companies") {
      const template = generateCompanyTemplate();
      downloadTemplate(template, "company_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Company template has been downloaded.",
      });
    } else {
      const template = generateStudentTemplate();
      downloadTemplate(template, "student_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Student template has been downloaded.",
      });
    }
  };
  
  const handleImportClick = (type: "companies" | "students") => {
    setImportType(type);
    setIsImportDialogOpen(true);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        if (importType === "companies") {
          const parsedData = parseCSV(csvContent);
          const companyData = mapCSVToCompanyData(parsedData);
          importCompanies(companyData);
          toast({
            title: "Import Successful",
            description: `${companyData.length} companies imported successfully.`,
          });
        } else {
          const parsedData = parseCSV(csvContent);
          const studentData = mapCSVToStudentData(parsedData);
          importStudents(studentData);
          toast({
            title: "Import Successful",
            description: `${studentData.length} students imported successfully.`,
          });
        }
        setIsImportDialogOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: "There was an error processing the file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Internship Matching System</h1>
          <p className="text-muted-foreground">
            Manage companies, student preferences, and interview schedules
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <div className="dropdown-menu">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleImportClick("companies")}>
                  <Upload className="mr-2 h-4 w-4" /> Import Companies
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import {importType === "companies" ? "Companies" : "Students"}</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import {importType === "companies" ? "companies" : "students"} in bulk.
                    Make sure to use the correct template format.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="file">Select CSV File</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm mb-2">Need a template?</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadTemplate(importType)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button onClick={() => handleImportClick("students")}>
            <Upload className="mr-2 h-4 w-4" /> Import Students
          </Button>
          
          <Button variant="outline" onClick={() => handleDownloadTemplate("companies")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Company Template
          </Button>
          
          <Button variant="outline" onClick={() => handleDownloadTemplate("students")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Student Template
          </Button>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="schedule">Interview Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="companies">
            <CompanyList />
          </TabsContent>
          <TabsContent value="students">
            <StudentList />
          </TabsContent>
          <TabsContent value="schedule">
            <InterviewSchedule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
