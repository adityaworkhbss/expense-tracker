const XLSX = require('xlsx');

function explore() {
  const workbook = XLSX.readFile('Corrected_Enhanced_Financial_System.xlsx');
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`Row ${i + 1}:`, JSON.stringify(data[i]));
    }
  }
}

explore();
