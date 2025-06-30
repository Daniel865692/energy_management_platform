// IoT Energy Management Dashboard JavaScript
class EnergyDashboard {
    constructor() {
        this.esp32Connected = true;
        this.realTimeChart = null;
        this.usageChart = null;
        this.devices = new Map();
        this.sensorData = {
            voltage: 230.5,
            current: 10.8,
            powerFactor: 0.92,
            frequency: 50.1,
            power: 2.5
        };
        
        this.init();
    }

    init() {
        this.initCharts();
        this.initDeviceControls();
        this.startRealTimeUpdates();
        this.initWeatherAPI();
        this.initNotifications();
    }

    // Initialize Charts
    initCharts() {
        // Real-time Energy Chart
        const ctx1 = document.getElementById('realTimeChart').getContext('2d');
        this.realTimeChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Power Consumption (kW)',
                    data: this.generateRandomData(20, 1.5, 3.5),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 750
                }
            }
        });

        // Usage Pie Chart
        const ctx2 = document.getElementById('usageChart').getContext('2d');
        this.usageChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Air Conditioner', 'Water Heater', 'Lighting', 'Other Appliances'],
                datasets: [{
                    data: [45, 25, 15, 15],
                    backgroundColor: [
                        '#ef4444', // red
                        '#3b82f6', // blue
                        '#10b981', // green
                        '#f59e0b'  // yellow
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Initialize Device Controls
    initDeviceControls() {
        const toggles = document.querySelectorAll('.device-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleDeviceToggle(e.target);
            });
        });

        // Initialize device states
        this.devices.set('ac-living', { status: true, power: 1200, name: 'Air Conditioner' });
        this.devices.set('tv-living', { status: true, power: 120, name: 'Smart TV' });
        this.devices.set('lights-living', { status: false, power: 15, name: 'Living Room Lights' });
        this.devices.set('heater-bathroom', { status: false, power: 2000, name: 'Water Heater' });
        this.devices.set('washer-laundry', { status: false, power: 500, name: 'Washing Machine' });
        this.devices.set('microwave-kitchen', { status: false, power: 900, name: 'Microwave' });
    }

    // Handle Device Toggle
    handleDeviceToggle(toggle) {
        const deviceId = toggle.dataset.device;
        const isOn = toggle.checked;
        const device = this.devices.get(deviceId);
        
        if (device) {
            device.status = isOn;
            this.sendDeviceCommand(deviceId, isOn);
            this.updatePowerConsumption();
            this.showNotification(
                `${device.name} turned ${isOn ? 'ON' : 'OFF'}`,
                isOn ? 'success' : 'info'
            );
        }
    }

    // Simulate ESP32 Communication
    sendDeviceCommand(deviceId, status) {
        // Simulate API call to ESP32
        console.log(`Sending command to ESP32: ${deviceId} = ${status ? 'ON' : 'OFF'}`);
        
        // Simulate network delay
        setTimeout(() => {
            this.updateDeviceStatus(deviceId, status);
        }, 500);
    }

    updateDeviceStatus(deviceId, status) {
        console.log(`Device ${deviceId} status confirmed: ${status ? 'ON' : 'OFF'}`);
    }

    // Update Power Consumption
    updatePowerConsumption() {
        let totalPower = 0;
        let activeDevices = 0;
        
        // Always-on devices
        totalPower += 150; // Refrigerator
        totalPower += 45;  // Security System
        activeDevices += 2;
        
        // Controllable devices
        this.devices.forEach((device, id) => {
            if (device.status) {
                totalPower += device.power;
                activeDevices++;
            }
        });
        
        // Update UI
        document.getElementById('current-power').textContent = `${(totalPower / 1000).toFixed(1)} kW`;
        document.getElementById('active-devices').textContent = `${activeDevices}/12`;
        
        // Update sensor data
        this.sensorData.power = totalPower / 1000;
        this.sensorData.current = (totalPower / this.sensorData.voltage).toFixed(1);
    }

    // Start Real-time Updates
    startRealTimeUpdates() {
        // Update every 2 seconds
        setInterval(() => {
            this.updateRealTimeData();
            this.updateSensorReadings();
        }, 2000);

        // Update charts every 5 seconds
        setInterval(() => {
            this.updateCharts();
        }, 5000);
    }

    updateRealTimeData() {
        // Add some random variation to simulate real sensor data
        const variation = (Math.random() - 0.5) * 0.2;
        this.sensorData.voltage = (230 + variation).toFixed(1);
        this.sensorData.frequency = (50 + (Math.random() - 0.5) * 0.2).toFixed(1);
        this.sensorData.powerFactor = (0.92 + (Math.random() - 0.5) * 0.05).toFixed(2);
        
        // Update last update time
        document.getElementById('last-update').textContent = 'Just now';
        
        setTimeout(() => {
            document.getElementById('last-update').textContent = '2s ago';
        }, 2000);
    }

    updateSensorReadings() {
        document.getElementById('voltage-reading').textContent = `${this.sensorData.voltage}V`;
        document.getElementById('current-reading').textContent = `${this.sensorData.current}A`;
        document.getElementById('power-factor').textContent = this.sensorData.powerFactor;
        document.getElementById('frequency').textContent = `${this.sensorData.frequency}Hz`;
    }

    updateCharts() {
        // Update real-time chart
        const newData = this.sensorData.power + (Math.random() - 0.5) * 0.3;
        this.realTimeChart.data.datasets[0].data.shift();
        this.realTimeChart.data.datasets[0].data.push(newData);
        this.realTimeChart.data.labels.shift();
        this.realTimeChart.data.labels.push(new Date().toLocaleTimeString());
        this.realTimeChart.update('none');
    }

    // Weather API Integration
    async initWeatherAPI() {
        // Simulate weather API call (replace with actual API)
        try {
            const weatherData = await this.fetchWeatherData();
            this.updateWeatherDisplay(weatherData);
        } catch (error) {
            console.error('Weather API error:', error);
            this.showNotification('Weather data unavailable', 'warning');
        }
    }

    async fetchWeatherData() {
        // Simulate API call - replace with actual weather API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    temperature: Math.floor(Math.random() * 10) + 25,
                    description: ['Sunny', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
                    humidity: Math.floor(Math.random() * 20) + 60
                });
            }, 1000);
        });
    }

    updateWeatherDisplay(weather) {
        document.getElementById('weather-temp').textContent = `${weather.temperature}°C`;
        document.getElementById('weather-desc').textContent = weather.description;
        
        // Update weather recommendation
        const recommendation = weather.temperature > 30 ? 'High' : 
                             weather.temperature > 25 ? 'Moderate' : 'Low';
        document.querySelector('#contact .text-xs.opacity-75').textContent = 
            `AC usage recommendation: ${recommendation}`;
    }

    // Notification System
    initNotifications() {
        // Check for high consumption every 30 seconds
        setInterval(() => {
            this.checkForAlerts();
        }, 30000);
    }

    checkForAlerts() {
        const currentPower = parseFloat(document.getElementById('current-power').textContent);
        
        if (currentPower > 3.0) {
            this.showNotification('High power consumption detected!', 'warning');
        }
        
        // Check budget
        const monthlyCost = parseInt(document.getElementById('monthly-cost').textContent.replace('K ', ''));
        if (monthlyCost > 1000) {
            this.showNotification('Approaching monthly budget limit', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-transform duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.classList.add(colors[type] || colors.info, 'text-white');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="${icons[type] || icons.info} w-5 h-5"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 inline-flex text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times w-4 h-4"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Helper Functions
    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        for (let i = 19; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            labels.push(time.toLocaleTimeString());
        }
        return labels;
    }

    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.random() * (max - min) + min);
        }
        return data;
    }
}

// Machine Learning Insights Simulation
class MLInsights {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.insights = [];
        this.init();
    }

    init() {
        this.generateInsights();
        setInterval(() => {
            this.updateInsights();
        }, 60000); // Update every minute
    }

    generateInsights() {
        const insights = [
            "Peak usage predicted at 7 PM. Consider pre-cooling.",
            "Fridge consuming 15% more than normal.",
            "Optimal time for washing: 2-4 PM.",
            "AC efficiency can be improved by 12% with proper maintenance.",
            "Solar panels would reduce costs by K 200/month.",
            "Water heater schedule optimization available."
        ];
        
        this.insights = insights;
        this.displayInsights();
    }

    updateInsights() {
        // Rotate insights or generate new ones based on current data
        this.insights.push(this.insights.shift());
        this.displayInsights();
    }

    displayInsights() {
        const container = document.querySelector('.space-y-3');
        if (container) {
            const insightElements = container.querySelectorAll('.flex');
            insightElements.forEach((element, index) => {
                if (this.insights[index]) {
                    const textElement = element.querySelector('p');
                    if (textElement) {
                        textElement.textContent = this.insights[index];
                    }
                }
            });
        }
    }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new EnergyDashboard();
    const mlInsights = new MLInsights(dashboard);
    
    // Add some interactive enhancements
    addInteractiveFeatures();
});

function addInteractiveFeatures() {
    // Add hover effects to device cards
    const deviceCards = document.querySelectorAll('.device-card');
    deviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('transform', 'scale-105', 'shadow-lg');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('transform', 'scale-105', 'shadow-lg');
        });
    });

    // Add pulse effect to connection status
    const connectionStatus = document.getElementById('connection-status');
    setInterval(() => {
        connectionStatus.parentElement.classList.add('animate-pulse');
        setTimeout(() => {
            connectionStatus.parentElement.classList.remove('animate-pulse');
        }, 1000);
    }, 10000);

    // Add click handlers for chart time periods
    const timeButtons = document.querySelectorAll('[class*="bg-blue-100"], [class*="bg-gray-100"]');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from siblings
            this.parentElement.querySelectorAll('button').forEach(b => {
                b.classList.remove('bg-blue-100', 'text-blue-600');
                b.classList.add('bg-gray-100', 'text-gray-600');
            });
            
            // Add active class to clicked button
            this.classList.remove('bg-gray-100', 'text-gray-600');
            this.classList.add('bg-blue-100', 'text-blue-600');
        });
    });
}
