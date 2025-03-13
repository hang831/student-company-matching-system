
import { downloadTemplate } from "./excelDownload";

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
