
import { CompanyImportData, StudentImportData, PreferenceImportData } from "@/types";

// Map CSV data to company structure with better field alignment
export const mapCSVToCompanyData = (csvData: any[]): CompanyImportData[] => {
  console.log("Mapping CSV to company data:", csvData);
  return csvData.map(row => {
    // Debug each row mapping
    console.log("Processing row:", row);
    console.log("Row properties:", Object.keys(row));
    
    // Check for exact header names directly from the template
    const name = row.name || row.Name || "";
    const description = row.description || row.Description || "";
    const intakeNumber = parseInt(row.intakenumber || row["intakenumber"] || row["intake number"] || row["Intake Number"] || "1", 10) || 1;
    const interviewPlace = row.interviewplace || row["interviewplace"] || row["interview place"] || row["Interview Place"] || "";
    const contactPerson = row.contactperson || row["contactperson"] || row["contact person"] || row["Contact Person"] || "";
    const allowance = row.allowance || row.Allowance || "";
    const remarks = row.remarks || row.Remarks || "";
    
    const result = {
      name,
      description,
      intakeNumber,
      interviewPlace,
      contactPerson,
      allowance,
      remarks
    };
    
    console.log("Mapped company:", result);
    return result;
  });
};

// Map CSV data to student structure
export const mapCSVToStudentData = (csvData: any[]): StudentImportData[] => {
  console.log("Mapping CSV to student data:", csvData);
  return csvData.map(row => {
    const result = {
      name: row.name || row.Name || "",
      email: row.email || row.Email || "",
      studentId: row.studentid || row.studentId || row["Student ID"] || row["studentid"] || "",
      tel: row.telephone || row.tel || row.Telephone || row.Tel || "",
      gpa: row.gpa || row.GPA || ""
    };
    console.log("Mapped student:", result);
    return result;
  });
};

// Map CSV data to student preferences structure
export const mapCSVToPreferencesData = (csvData: any[]): PreferenceImportData[] => {
  console.log("Mapping CSV to preferences data:", csvData);
  return csvData.map(row => {
    const result = {
      studentId: row.studentid || row.studentId || row["Student ID"] || row["studentid"] || "",
      companyName: row.companyname || row.companyName || row["Company Name"] || row["companyname"] || "",
      rank: parseInt(row.preferencerank || row.preferenceRank || row["Preference Rank"] || row["preferencerank"] || "0", 10) || 1
    };
    console.log("Mapped preference:", result);
    return result;
  });
};
