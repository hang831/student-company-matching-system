
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyList from "@/components/CompanyList";
import StudentList from "@/components/StudentList";
import InterviewSchedule from "@/components/InterviewSchedule";
import OffersManagement from "@/components/OffersManagement";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InterviewSortingOptions from "@/components/InterviewSortingOptions";
import LocalStorageUtils from "@/components/LocalStorageUtils";
import ImportDialog from "@/components/ImportDialog";

const Dashboard = () => {
  const {
    importCompanies,
    importStudents,
    importPreferences,
    refresh
  } = useInternshipSystem();
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
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

  const handleImportClick = (type: "companies" | "students" | "preferences") => {
    setImportType(type);
    setIsImportDialogOpen(true);
  };

  const handleRefresh = () => {
    refresh();
    setForceRender(prev => prev + 1);
    toast({
      title: "Refreshed",
      description: "The system data has been refreshed."
    });
  };
  
  const handleDataImportSuccess = () => {
    refresh();
    setForceRender(prev => prev + 1);
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
            
            <LocalStorageUtils onImportSuccess={handleDataImportSuccess} />
          </div>

          <div className="flex space-x-2">          
            <Button onClick={() => handleImportClick("companies")}>
              <Upload className="mr-2 h-4 w-4" /> Import Companies
            </Button>
            
            <Button onClick={() => handleImportClick("students")}>
              <Upload className="mr-2 h-4 w-4" /> Import Students
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
              <InterviewSortingOptions sortMode={interviewSortMode} onSortChange={setInterviewSortMode} />
              <InterviewSchedule sortMode={interviewSortMode} />
            </div>
          </TabsContent>
          <TabsContent value="offers" key={`offers-${forceRender}`}>
            <OffersManagement />
          </TabsContent>
        </Tabs>
      </div>
      
      <ImportDialog 
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        importType={importType}
        onImportSuccess={handleDataImportSuccess}
        importCompanies={importCompanies}
        importStudents={importStudents}
        importPreferences={importPreferences}
      />
    </div>
  );
};

export default Dashboard;

// Missing import
import { toast } from "@/hooks/use-toast";
