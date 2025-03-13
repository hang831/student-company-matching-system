
// Improved CSV parsing function that handles Excel exports better, especially with quoted fields
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
  
  // Process each data row - completely rewritten to better handle quoted fields
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split the row into values, handling quoted fields properly
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        // If we see a double quote inside a quoted string, and the next char is also a quote, 
        // it's an escaped quote (Excel style)
        if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
          currentValue += '"';
          j++; // Skip the next quote since we're treating it as part of the value
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of a field (but only if we're not inside quotes)
        values.push(currentValue);
        currentValue = '';
      } else {
        // Part of the field value
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    // Debug
    console.log(`Row ${i} raw: ${line}`);
    console.log(`Row ${i} parsed values:`, values);
    
    // If we have fewer values than headers, add empty strings for missing values
    while (values.length < headers.length) {
      values.push('');
    }
    
    // Create an object from headers and values
    const obj = {} as any;
    
    // Map each value to its corresponding header
    headers.forEach((header, index) => {
      if (index < values.length) {
        // Normalize header to lowercase and remove spaces
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        obj[normalizedHeader] = values[index].trim();
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
