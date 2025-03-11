import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyList from "@/components/CompanyList";
import StudentList from "@/components/StudentList";
import InterviewSchedule from "@/components/InterviewSchedule";
import OffersManagement from "@/components/OffersManagement";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Upload, FileSpreadsheet, RefreshCcw, Settings } from "lucide-react";
import { downloadTemplate, generateCompanyTemplate, generateStudentTemplate, generatePreferencesTemplate, parseCSV, mapCSVToCompanyData, mapCSVToStudentData, mapCSVToPreferencesData } from "@/utils/excelUtils";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InterviewSortingOptions from "@/components/InterviewSortingOptions";

const Dashboard = () => {
  const {
    importCompanies,
    importStudents,
    importPreferences,
    refresh
  } = useInternshipSystem();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<"companies" | "students" | "preferences">("companies");
  const [activeTab, setActiveTab] = useState("companies");
  const [forceRender, setForceRender] = useState(0);
  const [maxPreferences, setMaxPreferences] = useState(() => {
    const saved = localStorage.getItem('maxPreferences');
    return saved ? parseInt(saved) : 5;
  });
  const [interviewSortMode, setInterviewSortMode] = useState("date");

  useEffect(() => {
    localStorage.setItem('maxPreferences', maxPreferences.toString());
  }, [maxPreferences]);
  
  const handleDownloadTemplate = (type: "companies" | "students" | "preferences") => {
    if (type === "companies") {
      const template = generateCompanyTemplate();
      downloadTemplate(template, "company_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Company template has been downloaded."
      });
    } else if (type === "students") {
      const template = generateStudentTemplate();
      downloadTemplate(template, "student_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Student template has been downloaded."
      });
    } else {
      const template = generatePreferencesTemplate();
      downloadTemplate(template, "preferences_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Student preferences template has been downloaded."
      });
    }
  };
  
  const handleImportClick = (type: "companies" | "students" | "preferences") => {
    setImportType(type);
    setIsImportDialogOpen(true);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        console.log("CSV Content:", csvContent);
        
        if (importType === "companies") {
          const parsedData = parseCSV(csvContent);
          console.log("Parsed Company Data:", parsedData);
          
          const companyData = mapCSVToCompanyData(parsedData);
          console.log("Mapped Company Data:", companyData);
          
          if (companyData.length === 0) {
            toast({
              title: "Import Failed",
              description: "No valid company data found in the file.",
              variant: "destructive"
            });
            return;
          }
          
          importCompanies(companyData);
          toast({
            title: "Import Successful",
            description: `${companyData.length} companies imported successfully.`
          });
        } else if (importType === "students") {
          const parsedData = parseCSV(csvContent);
          console.log("Parsed Student Data:", parsedData);
          
          const studentData = mapCSVToStudentData(parsedData);
          console.log("Mapped Student Data:", studentData);
          
          if (studentData.length === 0) {
            toast({
              title: "Import Failed",
              description: "No valid student data found in the file.",
              variant: "destructive"
            });
            return;
          }
          
          importStudents(studentData);
          toast({
            title: "Import Successful",
            description: `${studentData.length} students imported successfully.`
          });
        } else {
          const parsedData = parseCSV(csvContent);
          console.log("Parsed Preferences Data:", parsedData);
          
          const preferencesData = mapCSVToPreferencesData(parsedData);
          console.log("Mapped Preferences Data:", preferencesData);
          
          if (preferencesData.length === 0) {
            toast({
              title: "Import Failed",
              description: "No valid preference data found in the file.",
              variant: "destructive"
            });
            return;
          }
          
          importPreferences(preferencesData);
          toast({
            title: "Import Successful",
            description: `Student preferences imported successfully.`
          });
        }
        
        setIsImportDialogOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        refresh();
        setForceRender(prev => prev + 1);
        
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: "There was an error processing the file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };
  
  const handleRefresh = () => {
    refresh();
    setForceRender(prev => prev + 1);
    toast({
      title: "Refreshed",
      description: "The system data has been refreshed."
    });
  };
  
  return <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Internship Matching System</h1>
          <p className="text-muted-foreground">
            Manage companies, student preferences, and interview schedules
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
              <Label htmlFor="maxPreferences" className="mr-2">Max Preferences:</Label>
              <Select value={maxPreferences.toString()} onValueChange={value => setMaxPreferences(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(num => <SelectItem key={num} value={num.toString()}>{num}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={handleRefresh} className="bg-gray-50">
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
          </div>

          <div className="flex space-x-2">          
            <div className="dropdown-menu">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleImportClick("companies")}>
                    <Upload className="mr-2 h-4 w-4" /> Import Companies
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Import {importType === "companies" ? "Companies" : importType === "students" ? "Students" : "Student Preferences"}
                    </DialogTitle>
                    <DialogDescription>
                      Upload a CSV file to import {importType === "companies" ? "companies" : importType === "students" ? "students" : "student preferences"} in bulk.
                      Make sure to use the correct template format.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="file">Select CSV File</Label>
                      <input ref={fileInputRef} type="file" id="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-1" />
                    </div>
                    <div>
                      <p className="text-sm mb-2">Need a template?</p>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate(importType)}>
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="schedule">Interview Schedule</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>
          <TabsContent value="companies" key={`companies-${forceRender}`}>
            <CompanyList />
          </TabsContent>
          <TabsContent value="students" key={`students-${forceRender}`}>
            <StudentList maxPreferences={maxPreferences} />
          </TabsContent>
          <TabsContent value="schedule" key={`schedule-${forceRender}`}>
            <div>
              <InterviewSortingOptions 
                sortMode={interviewSortMode} 
                onSortChange={setInterviewSortMode} 
              />
              <InterviewSchedule sortMode={interviewSortMode} />
            </div>
          </TabsContent>
          <TabsContent value="offers" key={`offers-${forceRender}`}>
            <OffersManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};

export default Dashboard;
