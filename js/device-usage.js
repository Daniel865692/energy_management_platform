// Fetch device usage data from an API endpoint
function fetchDeviceUsageData() {
    // Make an API request to retrieve device usage data
    // You can use libraries like Axios or fetch API for this
    // Example:
    // return fetch('/api/device-usage')
    //   .then(response => response.json())
    //   .then(data => {
    //     // Process the data and update the device usage report
    //     updateDeviceUsageReport(data);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching device usage data:', error);
    //   });
  
    // For the sake of this example, let's assume we have static data
    const deviceUsageData = [
      { date: 'May 1, 2025', device: 'Device 1', duration: '3 hours 25 minutes' },
      { date: 'May 1, 2025', device: 'Device 2', duration: '2 hours 10 minutes' },
      { date: 'May 2, 2025', device: 'Device 3', duration: '4 hours 45 minutes' },
      // Add more device usage data objects
    ];
  
    // Update the device usage report with the fetched data
    updateDeviceUsageReport(deviceUsageData);
  }
  
  // Update the device usage report with the provided data
  function updateDeviceUsageReport(deviceUsageData) {
    const tableBody = document.querySelector('#device-usage-table tbody');
  
    // Clear existing table rows
    tableBody.innerHTML = '';
  
    // Loop through the device usage data and create table rows
    deviceUsageData.forEach(data => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.date}</td>
        <td>${data.device}</td>
        <td>${data.duration}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  // Call the fetchDeviceUsageData function when the page loads
  window.addEventListener('load', fetchDeviceUsageData);
  