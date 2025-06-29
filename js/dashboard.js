3document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const ctx = document.getElementById('energyChart').getContext('2d');
  
    // Fetch energy consumption data from API (replace 'api/energy' with your actual API endpoint)
    fetch('api/energy')
      .then(response => response.json())
      .then(data => {
        // Process the data
        const labels = data.map(entry => entry.month);
        const consumptionData = data.map(entry => entry.consumption);
  
        // Define the chart data
        const chartData = {
          labels: labels,
          datasets: [{
            label: 'Energy Consumption',
            data: consumptionData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // Customize the chart color
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        };
  
        // Configure the chart options
        const options = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Energy Consumption (kWh)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Months'
              }
            }
          }
        };
  
        // Create the chart
        const energyChart = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: options
        });
      })
      .catch(error => {
        console.error('Error fetching energy consumption data:', error);
      });
  });
  