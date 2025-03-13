
// This is now a barrel file that re-exports all Excel utilities from their specific modules
import { parseCSV } from './excelParser';
import { mapCSVToCompanyData, mapCSVToStudentData, mapCSVToPreferencesData } from './excelMappers';
import { downloadTemplate, downloadTextFile, downloadExcelFile } from './excelDownload';
import { generateCompanyTemplate, generateStudentTemplate, generatePreferencesTemplate } from './excelTemplates';

// Re-export all Excel utilities
export {
  parseCSV,
  mapCSVToCompanyData,
  mapCSVToStudentData,
  mapCSVToPreferencesData,
  downloadTemplate,
  downloadTextFile,
  downloadExcelFile,
  generateCompanyTemplate,
  generateStudentTemplate,
  generatePreferencesTemplate
};
