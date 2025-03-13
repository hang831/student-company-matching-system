
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  downloadTemplate, 
  generateCompanyTemplate, 
  generateStudentTemplate, 
  generatePreferencesTemplate,
  parseCSV,
  mapCSVToCompanyData,
  mapCSVToStudentData,
  mapCSVToPreferencesData
} from "@/utils/excelUtils";

type ImportType = "companies" | "students" | "preferences";

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  importType: ImportType;
  onImportSuccess: () => void;
  importCompanies: (data: any[]) => void;
  importStudents: (data: any[]) => void;
  importPreferences: (data: any[]) => void;
}

const ImportDialog = ({ 
  isOpen, 
  onOpenChange, 
  importType, 
  onImportSuccess,
  importCompanies,
  importStudents,
  importPreferences
}: ImportDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    if (importType === "companies") {
      const template = generateCompanyTemplate();
      downloadTemplate(template, "company_template.csv");
      toast({
        title: "Template Downloaded",
        description: "Company template has been downloaded."
      });
    } else if (importType === "students") {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async e => {
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
        
        onOpenChange(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onImportSuccess();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
