// Code for energy consumption report
const energyConsumptionTable = document.querySelector("#energy-consumption-table");

// Placeholder data for energy consumption report
const energyConsumptionData = [
  { date: "May 1, 2025", time: "09:00 AM", device: "Device 1", consumption: "2.5" },
  { date: "May 1, 2025", time: "01:00 PM", device: "Device 2", consumption: "1.8" },
  { date: "May 2, 2025", time: "10:30 AM", device: "Device 3", consumption: "3.2" },
  // Add more data entries as needed
];

// Function to generate the energy consumption report
function generateEnergyConsumptionReport() {
  let tableHTML = `
    <h3>Energy Consumption Report - May 2025</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Device</th>
          <th>Energy Consumption (kWh)</th>
        </tr>
      </thead>
      <tbody>
  `;

  energyConsumptionData.forEach((entry) => {
    tableHTML += `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td>${entry.device}</td>
        <td>${entry.consumption}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  energyConsumptionTable.innerHTML = tableHTML;
}

// Call the function to generate the energy consumption report
generateEnergyConsumptionReport();


// Code for cost analysis report
const costAnalysisTable = document.querySelector("#cost-analysis-table");

// Placeholder data for cost analysis report
const costAnalysisData = [
  { date: "May 1, 2025", time: "09:00 AM", device: "Device 1", consumption: "2.5", costPerKwh: "0.12", totalCost: "0.30" },
  { date: "May 1, 2025", time: "01:00 PM", device: "Device 2", consumption: "1.8", costPerKwh: "0.12", totalCost: "0.22" },
  { date: "May 2, 2025", time: "10:30 AM", device: "Device 3", consumption: "3.2", costPerKwh: "0.12", totalCost: "0.38" },
  // Add more data entries as needed
];

// Function to generate the cost analysis report
function generateCostAnalysisReport() {
  let tableHTML = `
    <h3>Cost Analysis Report - May 2025</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Device</th>
          <th>Energy Consumption (kWh)</th>
          <th>Cost per kWh ($)</th>
          <th>Total Cost ($)</th>
        </tr>
      </thead>
      <tbody>
  `;

  costAnalysisData.forEach((entry) => {
    tableHTML += `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td>${entry.device}</td>
        <td>${entry.consumption}</td>
        <td>${entry.costPerKwh}</td>
        <td>${entry.totalCost}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  costAnalysisTable.innerHTML = tableHTML;
  }
  
  // Call the function to generate the cost analysis report
  generateCostAnalysisReport();
  
  
  // Code for device usage report
  const deviceUsageTable = document.querySelector("#device-usage-table");
  
  // Placeholder data for device usage report
  const deviceUsageData = [
    { date: "May 1, 2025", device: "Device 1", usageDuration: "3 hours 25 minutes" },
    { date: "May 1, 2025", device: "Device 2", usageDuration: "2 hours 10 minutes" },
    { date: "May 2, 2025", device: "Device 3", usageDuration: "4 hours 45 minutes" },
    // Add more data entries as needed
  ];
  
  // Function to generate the device usage report
  function generateDeviceUsageReport() {
    let tableHTML = `
      <h3>Device Usage Report - May 2025</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Device</th>
            <th>Usage Duration</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    deviceUsageData.forEach((entry) => {
      tableHTML += `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.device}</td>
          <td>${entry.usageDuration}</td>
        </tr>
      `;
    });
  
    tableHTML += `
        </tbody>
      </table>
    `;
  
    deviceUsageTable.innerHTML = tableHTML;
  }
  
  // Call the function to generate the device usage report
  generateDeviceUsageReport();
  
