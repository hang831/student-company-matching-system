
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

// Function to download data as an Excel file (XLSX format)
export const downloadExcelFile = (data: string[][], filename: string) => {
  // Create CSV content from the array data
  const csvContent = data
    .map(row => 
      row
        .map(cell => {
          // Escape quotes and wrap in quotes if the cell contains commas, quotes, or newlines
          const needsQuotes = /[",\n\r]/.test(cell);
          return needsQuotes ? `"${cell.replace(/"/g, '""')}"` : cell;
        })
        .join(',')
    )
    .join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Append to document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Improved CSV parsing function that handles Excel exports better
export function parseCSV<T>(csv: string): T[] {
  console.log("Raw CSV data:", csv);
  
  // Split by newlines, handling both \r\n and \n
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) {
    console.error("CSV has less than 2 lines (no data)");
    return [];
  }
  
  // Get and clean headers (remove BOM if present)
  let headers = lines[0].split(',').map(h => {
    let header = h.trim();
    // Remove BOM character if present
    if (header.charCodeAt(0) === 65279) {
      header = header.substring(1);
    }
    return header;
  });
  
  console.log("Headers detected:", headers);
  
  const results: T[] = [];
  
  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split the line into values, respecting quoted values
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        // Toggle quote mode
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of a field
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        // Part of a field
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // If values length is less than headers, expand with empty strings
    while (values.length < headers.length) {
      values.push('');
    }
    
    console.log(`Row ${i} values:`, values);
    
    const obj = {} as any;
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        // Normalize header names by converting to lowercase and removing spaces
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        obj[normalizedHeader] = values[index];
      }
    });
    
    // Only add non-empty objects
    if (Object.keys(obj).length > 0) {
      results.push(obj as T);
    }
  }
  
  console.log("Parsed CSV results:", results);
  return results;
}

// Map CSV data to company structure
export const mapCSVToCompanyData = (csvData: any[]): CompanyImportData[] => {
  console.log("Mapping CSV to company data:", csvData);
  return csvData.map(row => {
    // Debug each row mapping
    console.log("Processing row:", row);
    console.log("Row properties:", Object.keys(row));
    
    // Check for variations of field names that might come from Excel
    const name = row.name || row.Name || "";
    const description = row.description || row.Description || "";
    const intakeNumber = parseInt(row.intakenumber || row.intakeNumber || row["Intake Number"] || row["intakenumber"] || "1", 10) || 1;
    const interviewPlace = row.interviewplace || row.interviewPlace || row["Interview Place"] || row["interviewplace"] || "";
    const contactPerson = row.contactperson || row.contactPerson || row["Contact Person"] || row["contactperson"] || "";
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
