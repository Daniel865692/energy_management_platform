// Firebase Web SDK Integration for Energy Management Dashboard
// This file provides real-time database connectivity for the web dashboard

// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, off, serverTimestamp } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

class FirebaseEnergyManager {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
        this.auth = getAuth(this.app);
        this.listeners = new Map();
        this.isConnected = false;
        
        this.init();
    }

    async init() {
        try {
            // Anonymous authentication for basic access
            await signInAnonymously(this.auth);
            console.log('Firebase authenticated successfully');
            
            // Monitor connection status
            this.monitorConnection();
            
            // Start listening for real-time data
            this.setupRealtimeListeners();
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.handleConnectionError(error);
        }
    }

    // Monitor Firebase connection status
    monitorConnection() {
        const connectedRef = ref(this.database, '.info/connected');
        onValue(connectedRef, (snapshot) => {
            this.isConnected = snapshot.val() === true;
            this.updateConnectionStatus(this.isConnected);
            
            if (this.isConnected) {
                console.log('Firebase connected');
                this.onConnectionRestored();
            } else {
                console.log('Firebase disconnected');
                this.onConnectionLost();
            }
        });
    }

    // Setup real-time listeners for energy data
    setupRealtimeListeners() {
        // Listen for latest sensor readings from ESP32
        this.listenToLatestReading();
        
        // Listen for device status changes
        this.listenToDeviceCommands();
        
        // Listen for historical data updates
        this.listenToEnergyHistory();
        
        // Listen for system alerts
        this.listenToAlerts();
    }

    // Listen for latest ESP32 sensor data
    listenToLatestReading() {
        const latestRef = ref(this.database, 'latest_reading');
        const listener = onValue(latestRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.handleLatestReading(data);
            }
        }, (error) => {
            console.error('Error listening to latest reading:', error);
        });
        
        this.listeners.set('latest_reading', listener);
    }

    // Handle new sensor data from ESP32
    handleLatestReading(data) {
        // Update dashboard with new sensor values
        if (typeof window !== 'undefined' && window.dashboard) {
            window.dashboard.sensorData = {
                voltage: parseFloat(data.voltage) || 0,
                current: parseFloat(data.current) || 0,
                power: parseFloat(data.power) || 0,
                powerFactor: parseFloat(data.powerFactor) || 0,
                frequency: parseFloat(data.frequency) || 0,
                timestamp: data.timestamp || Date.now()
            };
            
            // Update UI elements
            window.dashboard.updateSensorReadings();
            window.dashboard.updatePowerConsumption();
        }

        // Store in local buffer for chart updates
        this.addToEnergyBuffer(data);
        
        // Check for anomalies
        this.checkForAnomalies(data);
    }

    // Listen for device command responses
    listenToDeviceCommands() {
        const commandsRef = ref(this.database, 'device_status');
        const listener = onValue(commandsRef, (snapshot) => {
            const devices = snapshot.val();
            if (devices) {
                this.handleDeviceStatusUpdate(devices);
            }
        });
        
        this.listeners.set('device_status', listener);
    }

    // Handle device status updates
    handleDeviceStatusUpdate(devices) {
        Object.entries(devices).forEach(([deviceId, status]) => {
            if (typeof window !== 'undefined' && window.dashboard) {
                const toggle = document.querySelector(`[data-device="${deviceId}"]`);
                if (toggle) {
                    toggle.checked = status.status === 'ON';
                    
                    // Update device power consumption
                    const device = window.dashboard.devices.get(deviceId);
                    if (device) {
                        device.status = status.status === 'ON';
                        device.lastUpdate = status.timestamp || Date.now();
                    }
                }
            }
        });
    }

    // Listen for energy history data
    listenToEnergyHistory() {
        const historyRef = ref(this.database, 'energy_data');
        
        // Get last 24 hours of data
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentDataRef = ref(this.database, `energy_data`);
        
        const listener = onValue(recentDataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.processHistoricalData(data);
            }
        });
        
        this.listeners.set('energy_history', listener);
    }

    // Process historical energy data for charts
    processHistoricalData(data) {
        const sortedData = Object.entries(data)
            .filter(([timestamp, _]) => parseInt(timestamp) > Date.now() - (24 * 60 * 60 * 1000))
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .slice(-100); // Keep last 100 readings

        const chartData = sortedData.map(([timestamp, reading]) => ({
            timestamp: parseInt(timestamp),
            power: parseFloat(reading.power) || 0,
            voltage: parseFloat(reading.voltage) || 0,
            current: parseFloat(reading.current) || 0
        }));

        // Update charts
        if (typeof window !== 'undefined' && window.dashboard) {
            this.updateDashboardCharts(chartData);
        }
    }

    // Update dashboard charts with new data
    updateDashboardCharts(chartData) {
        if (window.dashboard && window.dashboard.realTimeChart) {
            const chart = window.dashboard.realTimeChart;
            
            // Update chart data
            const labels = chartData.map(d => new Date(d.timestamp).toLocaleTimeString());
            const powerData = chartData.map(d => d.power);
            
            chart.data.labels = labels.slice(-20); // Show last 20 points
            chart.data.datasets[0].data = powerData.slice(-20);
            chart.update('none');
        }
    }

    // Send device command to ESP32
    async sendDeviceCommand(deviceId, command, value = null) {
        try {
            const commandData = {
                command: command,
                value: value,
                timestamp: serverTimestamp(),
                source: 'web_dashboard'
            };

            const commandRef = ref(this.database, `device_commands/${deviceId}`);
            await set(commandRef, commandData);
            
            console.log(`Command sent to ${deviceId}: ${command}`);
            
            // Show success notification
            if (typeof window !== 'undefined' && window.dashboard) {
                window.dashboard.showNotification(
                    `Command sent to ${deviceId}: ${command}`,
                    'success'
                );
            }
            
            return true;
        } catch (error) {
            console.error('Error sending device command:', error);
            
            if (typeof window !== 'undefined' && window.dashboard) {
                window.dashboard.showNotification(
                    `Failed to send command to ${deviceId}`,
                    'error'
                );
            }
            
            return false;
        }
    }

    // Store energy consumption data
    async logEnergyData(data) {
        try {
            const energyRef = ref(this.database, 'energy_data');
            const newEntryRef = push(energyRef);
            
            const logData = {
                ...data,
                timestamp: serverTimestamp(),
                source: 'web_dashboard'
            };
            
            await set(newEntryRef, logData);
            console.log('Energy data logged successfully');
            
        } catch (error) {
            console.error('Error logging energy data:', error);
        }
    }

    // Create and store alerts
    async createAlert(type, message, priority = 'medium') {
        try {
            const alertsRef = ref(this.database, 'alerts');
            const newAlertRef = push(alertsRef);
            
            const alertData = {
                type: type,
                message: message,
                priority: priority,
                timestamp: serverTimestamp(),
                resolved: false,
                source: 'web_dashboard'
            };
            
            await set(newAlertRef, alertData);
            console.log('Alert created:', message);
            
        } catch (error) {
            console.error('Error creating alert:', error);
        }
    }

    // Listen for system alerts
    listenToAlerts() {
        const alertsRef = ref(this.database, 'alerts');
        const listener = onValue(alertsRef, (snapshot) => {
            const alerts = snapshot.val();
            if (alerts) {
                this.handleSystemAlerts(alerts);
            }
        });
        
        this.listeners.set('alerts', listener);
    }

    // Handle system alerts
    handleSystemAlerts(alerts) {
        const unresolved = Object.entries(alerts)
            .filter(([_, alert]) => !alert.resolved)
            .sort(([_, a], [__, b]) => b.timestamp - a.timestamp);

        if (unresolved.length > 0 && typeof window !== 'undefined' && window.dashboard) {
            unresolved.forEach(([alertId, alert]) => {
                const priorityColor = alert.priority === 'high' ? 'error' : 
                                    alert.priority === 'medium' ? 'warning' : 'info';
                
                window.dashboard.showNotification(alert.message, priorityColor);
            });
        }
    }

    // Check for energy consumption anomalies
    checkForAnomalies(data) {
        const currentPower = parseFloat(data.power) || 0;
        
        // High consumption alert
        if (currentPower > 3.5) {
            this.createAlert(
                'high_consumption',
                `High power consumption detected: ${currentPower.toFixed(1)} kW`,
                'high'
            );
        }
        
        // Voltage anomaly
        const voltage = parseFloat(data.voltage) || 0;
        if (voltage < 200 || voltage > 250) {
            this.createAlert(
                'voltage_anomaly',
                `Voltage out of normal range: ${voltage.toFixed(1)}V`,
                'medium'
            );
        }
        
        // Power factor issues
        const powerFactor = parseFloat(data.powerFactor) || 0;
        if (powerFactor < 0.8) {
            this.createAlert(
                'power_factor',
                `Low power factor detected: ${powerFactor.toFixed(2)}`,
                'medium'
            );
        }
    }

    // Add data to energy buffer for real-time charts
    addToEnergyBuffer(data) {
        if (!this.energyBuffer) {
            this.energyBuffer = [];
        }
        
        this.energyBuffer.push({
            timestamp: Date.now(),
            power: parseFloat(data.power) || 0,
            voltage: parseFloat(data.voltage) || 0,
            current: parseFloat(data.current) || 0
        });
        
        // Keep only last 100 readings
        if (this.energyBuffer.length > 100) {
            this.energyBuffer = this.energyBuffer.slice(-100);
        }
    }

    // Connection status handlers
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        const statusIndicator = document.querySelector('.header .bg-green-400');
        
        if (statusElement) {
            statusElement.textContent = connected ? 'Firebase Connected' : 'Connection Lost';
        }
        
        if (statusIndicator) {
            statusIndicator.classList.toggle('bg-green-400', connected);
            statusIndicator.classList.toggle('bg-red-400', !connected);
            statusIndicator.classList.toggle('animate-pulse', !connected);
        }
    }

    onConnectionRestored() {
        // Sync any pending data
        this.syncPendingData();
        
        if (typeof window !== 'undefined' && window.dashboard) {
            window.dashboard.showNotification('Firebase connection restored', 'success');
        }
    }

    onConnectionLost() {
        if (typeof window !== 'undefined' && window.dashboard) {
            window.dashboard.showNotification('Firebase connection lost. Working offline.', 'warning');
        }
    }

    handleConnectionError(error) {
        console.error('Firebase connection error:', error);
        
        if (typeof window !== 'undefined' && window.dashboard) {
            window.dashboard.showNotification(
                'Database connection failed. Please check your internet connection.',
                'error'
            );
        }
    }

    // Sync any pending data when connection is restored
    syncPendingData() {
        // Implementation for offline data sync
        console.log('Syncing pending data...');
    }

    // Get device statistics
    async getDeviceStatistics(deviceId, hours = 24) {
        try {
            const startTime = Date.now() - (hours * 60 * 60 * 1000);
            const deviceRef = ref(this.database, `energy_data`);
            
            return new Promise((resolve) => {
                onValue(deviceRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const deviceData = Object.entries(data)
                            .filter(([timestamp, reading]) => {
                                return parseInt(timestamp) > startTime && 
                                       reading.deviceId === deviceId;
                            })
                            .map(([_, reading]) => reading);
                        
                        const stats = this.calculateDeviceStats(deviceData);
                        resolve(stats);
                    } else {
                        resolve(null);
                    }
                }, { once: true });
            });
        } catch (error) {
            console.error('Error getting device statistics:', error);
            return null;
        }
    }

    // Calculate device statistics
    calculateDeviceStats(data) {
        if (!data || data.length === 0) return null;
        
        const totalPower = data.reduce((sum, reading) => sum + (parseFloat(reading.power) || 0), 0);
        const avgPower = totalPower / data.length;
        const maxPower = Math.max(...data.map(r => parseFloat(r.power) || 0));
        const minPower = Math.min(...data.map(r => parseFloat(r.power) || 0));
        
        return {
            totalEnergy: totalPower, // kWh
            averagePower: avgPower,
            maxPower: maxPower,
            minPower: minPower,
            readingCount: data.length
        };
    }

    // Cleanup listeners when dashboard is closed
    cleanup() {
        this.listeners.forEach((listener, key) => {
            off(listener);
        });
        this.listeners.clear();
        console.log('Firebase listeners cleaned up');
    }

    // Export data for backup or analysis
    async exportEnergyData(startDate, endDate) {
        try {
            const startTime = new Date(startDate).getTime();
            const endTime = new Date(endDate).getTime();
            
            const energyRef = ref(this.database, 'energy_data');
            
            return new Promise((resolve, reject) => {
                onValue(energyRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const filteredData = Object.entries(data)
                            .filter(([timestamp, _]) => {
                                const time = parseInt(timestamp);
                                return time >= startTime && time <= endTime;
                            })
                            .map(([timestamp, reading]) => ({
                                timestamp: parseInt(timestamp),
                                ...reading
                            }));
                        
                        resolve(filteredData);
                    } else {
                        resolve([]);
                    }
                }, { once: true });
            });
        } catch (error) {
            console.error('Error exporting energy data:', error);
            throw error;
        }
    }
}

// Initialize Firebase Energy Manager when DOM is loaded
let firebaseManager = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase only if not already initialized
    if (!firebaseManager) {
        firebaseManager = new FirebaseEnergyManager();
        
        // Make it globally available
        window.firebaseManager = firebaseManager;
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseEnergyManager;
}
