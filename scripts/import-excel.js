const { prisma } = require('../lib/prisma');
const XLSX = require('xlsx');

function excelDateToJSDate(serial) {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

async function importExcel() {
  console.log('Starting import...');
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found to attach data to.');
  }

  let account = await prisma.account.findFirst({ where: { userId: user.id } });
  if (!account) {
    account = await prisma.account.create({
      data: { userId: user.id, name: 'Main Account', type: 'BANK', currentBalance: 0 },
    });
  }

  const workbook = XLSX.readFile('Corrected_Enhanced_Financial_System.xlsx');
  
  // 1. IMPORT CATEGORIES
  const categorySheet = workbook.Sheets['Category Master'];
  if (categorySheet) {
    const categoriesData = XLSX.utils.sheet_to_json(categorySheet, { header: 1 });
    // start from row 4 (index 3) based on inspection
    for (let i = 3; i < categoriesData.length; i++) {
      const row = categoriesData[i];
      if (!row || !row[1]) continue;
      
      const categoryName = row[1];
      // Try to find if already exists
      let cat = await prisma.category.findFirst({ where: { name: categoryName, userId: user.id } });
      if (!cat) {
        await prisma.category.create({
          data: {
            userId: user.id,
            name: categoryName,
            type: categoryName.toLowerCase().includes('income') ? 'INCOME' : 'EXPENSE',
            isActive: true
          }
        });
        console.log(`Created category: ${categoryName}`);
      }
    }
  }

  // 2. IMPORT TRANSACTIONS
  const txSheet = workbook.Sheets['Transactions'];
  if (txSheet) {
    const txData = XLSX.utils.sheet_to_json(txSheet, { header: 1 });
    let createdTx = 0;
    
    for (let i = 3; i < txData.length; i++) {
      const row = txData[i];
      if (!row || !row[0] || !row[5]) continue; 
      
      const dateSerial = row[0];
      const desc = row[1] || '';
      const typeStr = row[3] || ''; // This is "Credit Card", "Bank", etc.
      const categoryName = row[4];
      const amount = Math.abs(parseFloat(row[5]));
      const notes = row[6] || '';
      
      const jsDate = excelDateToJSDate(dateSerial);
      
      let categoryId = null;
      let type = 'EXPENSE';
      
      if (categoryName) {
        const cat = await prisma.category.findFirst({ where: { name: categoryName, userId: user.id } });
        if (cat) {
          categoryId = cat.id;
          type = cat.type;
        }
        
        if (categoryName.toLowerCase().includes('income')) {
          type = 'INCOME';
        }
      }

      // If description contains "Salary", it's likely income
      if (desc.toLowerCase().includes('salary')) {
        type = 'INCOME';
      }
      
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          categoryId,
          type: type,
          amount,
          transactionDate: jsDate,
          note: notes,
          merchant: desc,
          paymentMethod: typeStr,
          status: 'CLEARED'
        }
      });
      createdTx++;
    }
    console.log(`Imported ${createdTx} transactions!`);
  }

  // 3. IMPORT FIXED EXPENSES (Salary Rule & Recurring)
  const fixedSheet = workbook.Sheets['Fixed Expenses Master'];
  if (fixedSheet) {
    const fixedData = XLSX.utils.sheet_to_json(fixedSheet, { header: 1 });
    for (let i = 3; i < fixedData.length; i++) {
      const row = fixedData[i];
      if (!row || !row[0]) continue;
      
      const name = row[0];
      const amount = parseFloat(row[1]);
      
      if (name.toLowerCase().includes('salary income')) {
        await prisma.salaryRule.upsert({
          where: { id: 'default-salary-rule' }, // Simplified for demo
          update: { expectedAmount: amount },
          create: { id: 'default-salary-rule', userId: user.id, expectedAmount: amount, salaryDay: 1, cycleStartDay: 1 }
        });
        console.log(`Updated Salary Rule: ${amount}`);
      }
    }
  }

  // 4. IMPORT EMIS
  const emiSheet = workbook.Sheets['EMI Schedule'];
  if (emiSheet) {
    const emiData = XLSX.utils.sheet_to_json(emiSheet, { header: 1 });
    
    // We'll find headers in row 3 (index 2)
    const headers = emiData[2];
    if (headers) {
      // Find latest balance for EMI1 and EMI2
      // Let's take the values from the first data row (May, since we are in May)
      const mayRow = emiData.find(r => r[1] === 'May');
      if (mayRow) {
        // EMI1: Tot is index 4, Bal is index 5
        const emi1Tot = parseFloat(mayRow[4]);
        const emi1Bal = parseFloat(mayRow[5]);
        
        if (!isNaN(emi1Tot) && emi1Tot > 0) {
          await prisma.emi.upsert({
            where: { id: 'emi1-auto' },
            update: { monthlyEmi: emi1Tot, remainingBalance: emi1Bal },
            create: {
              id: 'emi1-auto',
              userId: user.id,
              accountId: account.id,
              name: 'Personal Loan (EMI1)',
              principal: 10000, // Estimated
              tenure: 12,
              monthlyEmi: emi1Tot,
              nextDueDate: new Date('2026-06-05'),
              remainingBalance: emi1Bal,
              active: true
            }
          });
          console.log(`Imported EMI1: ${emi1Tot}/mo, ${emi1Bal} left`);
        }

        // EMI2: Tot is index 8, Bal is index 9
        const emi2Tot = parseFloat(mayRow[8]);
        const emi2Bal = parseFloat(mayRow[9]);
        
        if (!isNaN(emi2Tot) && emi2Tot > 0) {
          await prisma.emi.upsert({
            where: { id: 'emi2-auto' },
            update: { monthlyEmi: emi2Tot, remainingBalance: emi2Bal },
            create: {
              id: 'emi2-auto',
              userId: user.id,
              accountId: account.id,
              name: 'MacBook/Consumer Loan (EMI2)',
              principal: 40000, // Estimated
              tenure: 6,
              monthlyEmi: emi2Tot,
              nextDueDate: new Date('2026-06-22'),
              remainingBalance: emi2Bal,
              active: true
            }
          });
          console.log(`Imported EMI2: ${emi2Tot}/mo, ${emi2Bal} left`);
        }
      }
    }
  }

  console.log('Import complete!');
  await prisma.$disconnect();
}

importExcel().catch(e => {
  console.error(e);
  process.exit(1);
});
