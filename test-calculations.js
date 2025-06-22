// Simple test to verify advanced investment calculations
const { generateMonthlyInvestments } = require('./src/utils/calculations.ts');

// Test scenario
const testAdvancedInvestments = [
  {
    id: 'test1',
    amount: 10000000, // 1 crore
    interestRate: 8,
    startYear: 4, // Starts in Year 5 (0-based)
    timeYears: 5
  }
];

console.log('Testing Advanced Investment Calculation...');
console.log('Scenario: 1 crore investment starting in Year 5, growing at 8% for 5 years');
console.log('Regular SIP: 10,000 growing at 10% annually\n');

try {
  const investments = generateMonthlyInvestments(
    10000, // SIP amount
    10, // annual rate for regular investments
    10, // years to retirement
    6, // increment rate
    30, // starting age
    6, // inflation rate
    0, // savings till now
    testAdvancedInvestments
  );

  console.log('Year-by-Year Results:');
  investments.forEach((inv, index) => {
    const yearIndex = index;
    const isAdvancedInvestmentYear = yearIndex >= 4; // Starts from Year 5 (index 4)
    
    console.log(`Year ${inv.year} (Age ${inv.age}): Total Corpus = ₹${Math.round(inv.yearEndCorpus).toLocaleString()}`);
    
    if (yearIndex === 4) {
      console.log('  → Advanced investment of ₹1 crore starts this year');
    } else if (yearIndex > 4 && yearIndex <= 8) {
      console.log('  → Advanced investment growing at 8%');
    } else if (yearIndex === 9) {
      console.log('  → Advanced investment completed 5 years, final value locked');
    }
  });

  // Manual calculation verification for the advanced investment portion
  console.log('\nManual Verification of Advanced Investment:');
  const principal = 10000000;
  for (let year = 1; year <= 5; year++) {
    const value = principal * Math.pow(1.08, year);
    console.log(`After ${year} year(s): ₹${Math.round(value).toLocaleString()}`);
  }

} catch (error) {
  console.error('Error in calculation:', error);
}