
import { CompanyImportData, StudentImportData, PreferenceImportData } from "@/types";

// Function to generate Excel template for companies
export const generateCompanyTemplate = () => {
  // Create a simple CSV file for company template
  const headers = ["Name", "Description", "Intake Number", "Interview Place", "Contact Person", "Allowance", "Remarks"];
  const sampleData = ["Sample Company", "Description of company", "5", "Room 101", "John Doe", "$500", "Additional information"];
  
  const csv = [
    headers.join(","),
    sampleData.join(",")
  ].join("\n");
  
  return csv;
};

// Function to generate Excel template for students
export const generateStudentTemplate = () => {
  // Create a simple CSV file for student template
  const headers = ["Name", "Email", "Student ID", "Telephone", "GPA"];
  const sampleData = ["John Smith", "john.smith@example.com", "S12345", "123-456-7890", "3.5"];
  
  const csv = [
    headers.join(","),
    sampleData.join(",")
  ].join("\n");
  
  return csv;
};

// Function to generate Excel template for student preferences
export const generatePreferencesTemplate = () => {
  // Create a simple CSV file for student preferences template
  const headers = ["Student ID", "Company Name", "Preference Rank"];
  const sampleData1 = ["S12345", "Tech Innovations Inc.", "1"];
  const sampleData2 = ["S12345", "Global Finance Group", "2"];
  
  const csv = [
    headers.join(","),
    sampleData1.join(","),
    sampleData2.join(",")
  ].join("\n");
  
  return csv;
};

// Function to download a template as a file
export const downloadTemplate = (template: string, filename: string) => {
  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Append to document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to download text content as a file
export const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to parse CSV data for import
export function parseCSV<T>(csv: string): T[] {
  const lines = csv.split('\n');
  if (lines.length < 2) return []; // Need at least headers and one data row
  
  const headers = lines[0].split(',').map(h => h.trim());
  const results: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {} as any;
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        // Normalize header names by converting to lowercase and removing spaces
        obj[header.toLowerCase().replace(/\s+/g, '')] = values[index];
      }
    });
    
    // Only add non-empty objects
    if (Object.keys(obj).length > 0) {
      results.push(obj as T);
    }
  }
  
  console.log("Parse CSV Results:", results); // Debug log
  return results;
}

// Map CSV data to company structure
export const mapCSVToCompanyData = (csvData: any[]): CompanyImportData[] => {
  console.log("Mapping CSV to company data:", csvData); // Debug log
  return csvData.map(row => {
    const result = {
      name: row.name || "",
      description: row.description || "",
      intakeNumber: parseInt(row.intakenumber || "0", 10) || 1,
      interviewPlace: row.interviewplace || "",
      contactPerson: row.contactperson || "",
      allowance: row.allowance || "",
      remarks: row.remarks || ""
    };
    console.log("Mapped company:", result); // Debug log
    return result;
  });
};

// Map CSV data to student structure
export const mapCSVToStudentData = (csvData: any[]): StudentImportData[] => {
  console.log("Mapping CSV to student data:", csvData); // Debug log
  return csvData.map(row => {
    const result = {
      name: row.name || "",
      email: row.email || "",
      studentId: row.studentid || "",
      tel: row.telephone || "",
      gpa: row.gpa || ""
    };
    console.log("Mapped student:", result); // Debug log
    return result;
  });
};

// Map CSV data to student preferences structure
export const mapCSVToPreferencesData = (csvData: any[]): PreferenceImportData[] => {
  console.log("Mapping CSV to preferences data:", csvData); // Debug log
  return csvData.map(row => {
    const result = {
      studentId: row.studentid || "",
      companyName: row.companyname || "",
      rank: parseInt(row.preferencerank || "0", 10) || 1
    };
    console.log("Mapped preference:", result); // Debug log
    return result;
  });
};
