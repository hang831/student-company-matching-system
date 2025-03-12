
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Import, Save, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocalStorageUtilsProps {
  onImportSuccess: () => void;
}

const LocalStorageUtils = ({ onImportSuccess }: LocalStorageUtilsProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportData = () => {
    // Get all data from localStorage
    const companies = localStorage.getItem('companies') || '[]';
    const students = localStorage.getItem('students') || '[]';
    const slots = localStorage.getItem('slots') || '[]';
    const maxPreferences = localStorage.getItem('maxPreferences') || '5';
    
    // Create a JSON object with all data
    const exportData = {
      companies: JSON.parse(companies),
      students: JSON.parse(students),
      slots: JSON.parse(slots),
      maxPreferences: maxPreferences
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'internship-system-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully."
    });
  };
  
  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate imported data structure
        if (!importedData.companies || !importedData.students || !importedData.slots) {
          throw new Error("Invalid data format");
        }
        
        // Store in localStorage
        localStorage.setItem('companies', JSON.stringify(importedData.companies));
        localStorage.setItem('students', JSON.stringify(importedData.students));
        localStorage.setItem('slots', JSON.stringify(importedData.slots));
        
        if (importedData.maxPreferences) {
          localStorage.setItem('maxPreferences', importedData.maxPreferences.toString());
        }
        
        // Notify success
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully."
        });
        
        // Notify parent component to refresh data
        onImportSuccess();
        
        // Close dialog and reset file input
        setIsImportDialogOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
    <div className="flex space-x-2">
      <Button onClick={handleExportData} variant="outline">
        <Save className="mr-2 h-4 w-4" /> Export Data
      </Button>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handleImportClick}>
            <Import className="mr-2 h-4 w-4" /> Import Data
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import System Data</DialogTitle>
            <DialogDescription>
              Upload a JSON file to import all system data. This will replace all existing data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-1"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocalStorageUtils;
