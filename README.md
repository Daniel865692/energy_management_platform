# African Energy Monitoring Software

A comprehensive web-based IoT energy monitoring platform designed specifically for African households and businesses to track, analyze, and optimize their energy consumption. Features real-time ESP32 integration, smart device control, and AI-powered insights.

## Features

### 🏠 **IoT Dashboard & Real-time Monitoring**
- **ESP32 Integration**: Live sensor data from current sensors for real-time energy monitoring
- **Device Control Center**: Wireless control of 8+ smart devices (AC, lights, water heater, etc.)
- **Real-time Charts**: Dynamic energy consumption visualization with Chart.js
- **Live Sensor Readings**: Voltage, current, power factor, and frequency monitoring

### 📊 **Analytics & Intelligence**
- **Energy Usage Analysis**: Detailed breakdown of consumption by device and time
- **Cost Tracking and Budgeting**: Monitor expenses with budget alerts and notifications
- **Machine Learning Insights**: AI-powered predictions and optimization recommendations
- **Usage Pattern Recognition**: Identify peak hours and energy-saving opportunities

### 🌤️ **Smart Integration**
- **Weather API Integration**: Real-time weather data affecting energy consumption
- **Automated Recommendations**: Weather-based AC and device usage suggestions
- **Predictive Analytics**: Peak usage forecasting and load management

### 💡 **Energy Efficiency**
- **Personalized Tips**: Custom energy-saving recommendations based on usage patterns
- **Device Scheduling**: Automated control and scheduling for optimal efficiency
- **Anomaly Detection**: Alerts for unusual consumption patterns
- **Budget Management**: Real-time cost tracking and expense control

## Recent Improvements

### 🚀 **IoT Dashboard Implementation (2025)**

- **Complete IoT Dashboard**: Built `dashboardpro.html` with comprehensive energy management features
- **ESP32 Integration**: Real-time sensor data integration with current sensors
- **Device Control System**: Wireless control of 8+ smart home devices
- **Tailwind CSS Migration**: Modern, responsive design with utility-first CSS framework
- **Chart.js Integration**: Dynamic real-time charts with proper height constraints
- **Machine Learning Features**: AI-powered insights and predictive analytics

### 🎨 **UI/UX Enhancements (2025)**

- **Tailwind CSS Implementation**: Complete redesign using modern utility classes
- **Responsive Grid Layouts**: Mobile-first design with adaptive layouts
- **Interactive Components**: Enhanced device cards with hover effects and animations
- **Professional Color Scheme**: African-inspired orange, yellow, and red color palette
- **Modern Typography**: Improved readability with proper font weights and spacing

### 📱 **Technical Improvements**

- **Chart Performance**: Fixed infinite scrolling issues with proper aspect ratios
- **Real-time Updates**: Live data streaming every 2-5 seconds
- **Notification System**: Custom toast notifications for device status and alerts
- **Weather API**: Integrated weather data for intelligent energy recommendations
- **Device Management**: Complete CRUD operations for smart device control

## File Structure

```text
├── index.html              # Main landing page with Tailwind CSS
├── dashboardpro.html       # IoT Energy Management Dashboard
├── dashboard.html          # Basic energy monitoring dashboard
├── reports.html            # Energy usage reports
├── settings.html           # User settings and preferences
├── profile.html            # User profile management
├── backend.html            # Backend administration
├── styles.css              # Custom CSS (legacy)
├── js/
│   ├── script.js           # Main JavaScript functionality
│   ├── dashboard-iot.js    # IoT Dashboard with ESP32 integration
│   ├── dashboard.js        # Basic dashboard scripts
│   ├── reports.js          # Reports functionality
│   └── settings.js         # Settings management
├── images/                 # Image assets and logos
│   ├── logo.png           # Main logo
│   ├── favicon.png        # Website favicon
│   └── ...                # Other images
└── README.md              # Project documentation
```

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Charts**: Chart.js for real-time data visualization
- **IoT**: ESP32 microcontroller integration
- **APIs**: Weather API integration for smart recommendations
- **Architecture**: Client-side SPA with real-time updates

## Getting Started

### 🌐 **Web Application**
1. Open `index.html` in a modern web browser for the landing page
2. Access `dashboardpro.html` for the full IoT energy management dashboard
3. Navigate through different sections using the responsive navigation menu
4. Explore device control features and real-time monitoring

### 🔌 **IoT Setup (ESP32)**
1. Connect ESP32 to your WiFi network
2. Install current sensor on main electrical line
3. Configure ESP32 to send data to the dashboard
4. Verify connection status in the dashboard header

### 📱 **Device Integration**
1. Add smart devices through the "Add Device" button
2. Configure device power ratings and locations
3. Test device control through the dashboard
4. Set up automated schedules and alerts

### 🎯 **Features to Explore**
- Real-time energy consumption charts
- Device on/off control with immediate feedback
- Weather-based energy recommendations
- ML-powered usage insights and predictions
- Cost tracking and budget management

## Real-time Database Integration

### 🔥 **Supported Database Options**

#### **1. Firebase Realtime Database (Recommended)**
- **Perfect for**: Beginners, rapid prototyping, real-time synchronization
- **Advantages**: Easy ESP32 integration, automatic scaling, real-time updates
- **Free Tier**: 1GB storage, 10GB/month transfer
- **Implementation**: `esp32_firebase_integration.ino` + `firebase_web_integration.js`

#### **2. InfluxDB (Time-Series Database)**
- **Perfect for**: Large-scale energy monitoring, advanced analytics
- **Advantages**: Optimized for time-series data, powerful querying, data retention policies
- **Use Case**: Historical data analysis, trend monitoring
- **Implementation**: `esp32_multi_database.ino` (set DATABASE_TYPE to "INFLUXDB")

#### **3. MongoDB Atlas**
- **Perfect for**: Complex data structures, scalability
- **Advantages**: Document-based storage, powerful aggregation, cloud hosting
- **Use Case**: User management, device configuration, reporting
- **Implementation**: HTTP API integration via `database_integrations.js`

#### **4. ThingSpeak IoT Platform**
- **Perfect for**: Simple IoT projects, quick visualization
- **Advantages**: Built-in charts, easy setup, MATLAB integration
- **Free Tier**: 3 million messages/year
- **Implementation**: Simple HTTP GET/POST requests

#### **5. MySQL/PostgreSQL**
- **Perfect for**: Traditional applications, complex relationships
- **Advantages**: ACID compliance, mature ecosystem, familiar SQL
- **Use Case**: Enterprise applications, existing infrastructure
- **Implementation**: REST API with `api_server.js`

### 🛠️ **ESP32 Integration Setup**

#### **Step 1: Choose Your Database**
```cpp
// In esp32_multi_database.ino, set your preferred database:
#define DATABASE_TYPE "FIREBASE"  // Options: FIREBASE, MONGODB, INFLUXDB, THINGSPEAK, MYSQL
```

#### **Step 2: Configure Credentials**
```cpp
// Firebase Example
#define FIREBASE_HOST "your-project-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "your-database-secret-or-token"

// ThingSpeak Example  
const char* thingSpeakApiKey = "your-write-api-key";
const unsigned long channelId = 123456;
```

#### **Step 3: Hardware Connections**
```cpp
// Sensor Pins
#define CURRENT_SENSOR_PIN A0  // ACS712 current sensor
#define VOLTAGE_SENSOR_PIN A1  // Voltage divider circuit
#define STATUS_LED_PIN 4       // Connection status indicator

// Device Control Pins (Relays)
#define RELAY_1_PIN 5   // Living room lights
#define RELAY_2_PIN 18  // Air conditioner  
#define RELAY_3_PIN 19  // Water heater
#define RELAY_4_PIN 21  // TV system
```

### 📊 **Data Structure**

#### **Energy Data Format**
```json
{
  "voltage": 230.5,
  "current": 10.8,
  "power": 2489.4,
  "powerFactor": 0.92,
  "frequency": 50.1,
  "timestamp": 1640995200000,
  "deviceId": "ESP32_001"
}
```

#### **Device Command Format**
```json
{
  "deviceId": "lights_living",
  "command": "ON",
  "value": null,
  "timestamp": 1640995200000,
  "source": "web_dashboard"
}
```

### 🌐 **Web Dashboard Integration**

#### **Real-time Updates**
The web dashboard (`firebase_web_integration.js`) automatically:
- **Connects** to your chosen database
- **Listens** for real-time sensor data from ESP32
- **Updates** charts and UI elements instantly
- **Sends** device commands back to ESP32
- **Handles** connection issues gracefully

#### **Usage Example**
```javascript
// Initialize Firebase manager
const firebaseManager = new FirebaseEnergyManager();

// Send device command
await firebaseManager.sendDeviceCommand('lights_living', 'ON');

// Get historical data
const history = await firebaseManager.getHistoricalData('ESP32_001', 24);
```

### 🚀 **Quick Start Guide**

#### **Option 1: Firebase (Easiest)**
1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
2. **Enable Realtime Database**: Set up in test mode initially
3. **Get Configuration**: Copy your project config
4. **Update ESP32 Code**: Set Firebase credentials in `esp32_firebase_integration.ino`
5. **Update Web Code**: Set Firebase config in `firebase_web_integration.js`
6. **Upload & Test**: Flash ESP32 and open `dashboardpro.html`

#### **Option 2: ThingSpeak (Simplest)**
1. **Create ThingSpeak Account**: Sign up at [ThingSpeak.com](https://thingspeak.com)
2. **Create Channel**: Add 5 fields (voltage, current, power, power factor, frequency)
3. **Get API Keys**: Copy Write API Key
4. **Update ESP32**: Set ThingSpeak credentials in `esp32_multi_database.ino`
5. **View Data**: Monitor on ThingSpeak dashboard

#### **Option 3: InfluxDB (Advanced)**
1. **Install InfluxDB**: Use InfluxDB Cloud or self-hosted
2. **Create Bucket**: Set up "energy_data" bucket
3. **Generate Token**: Create read/write token
4. **Configure ESP32**: Set InfluxDB credentials
5. **Setup Grafana**: Optional - for advanced visualizations

### ⚡ **Performance Considerations**

#### **Data Transmission Frequency**
- **Real-time monitoring**: Every 2-5 seconds
- **Historical logging**: Every 30-60 seconds  
- **Device status**: On-demand + periodic heartbeat
- **Network efficiency**: Batch multiple readings when possible

#### **Database Optimization**
- **Firebase**: Use server timestamps, implement offline persistence
- **InfluxDB**: Set appropriate retention policies, use downsampling
- **MongoDB**: Index timestamp fields, implement data aggregation
- **ThingSpeak**: Respect rate limits (1 update per 15 seconds free tier)

### 🔧 **Troubleshooting**

#### **Common Issues & Solutions**
1. **ESP32 won't connect**: Check WiFi credentials and signal strength
2. **Database authentication fails**: Verify API keys and permissions
3. **No real-time updates**: Check firewall settings and WebSocket support
4. **High data usage**: Implement data compression or reduce update frequency
5. **Memory issues**: Use JSON streaming for large datasets

#### **Debug Tools**
- **Serial Monitor**: ESP32 debug output and sensor readings
- **Browser Console**: Web dashboard connection status and errors
- **Database Logs**: Check database-specific monitoring tools
- **Network Analysis**: Use Wireshark for packet inspection

### 📈 **Scalability Options**

#### **Single Home Setup**
- **Database**: Firebase or ThingSpeak
- **Devices**: 1-5 ESP32 units
- **Storage**: < 1GB/month
- **Cost**: Free tier sufficient

#### **Multi-Home/Commercial Setup**  
- **Database**: InfluxDB + MongoDB
- **Devices**: 10-100+ ESP32 units
- **Storage**: 10GB+/month
- **Architecture**: Load balancer + multiple API servers
- **Cost**: Paid tiers required

## Browser Support & Compatibility

- **Chrome** (latest) - Full feature support including real-time updates
- **Firefox** (latest) - Complete compatibility with all dashboard features
- **Safari** (latest) - Optimized for macOS and iOS devices
- **Edge** (latest) - Windows integration and performance optimizations
- **Mobile Browsers** - Responsive design works on all modern mobile browsers

### 📱 **Mobile Features**
- Touch-friendly device controls
- Responsive charts and graphs
- Mobile-optimized notifications
- Swipe gestures for navigation

## Contributing

This project is designed for African energy management needs. Contributions that enhance accessibility, mobile responsiveness, and energy monitoring capabilities are welcome.

## Contact

- **Location**: Ndola, Zambia, Africa
- **Phone**: +260970665941
- **Email**: mukelabaidaniel.sc@example.com
- **GitHub**: Daniel Mukelabai
- **Repository**: https://github.com/FreDrickMwepu/energy_management_platform

## License

© 2025 African Energy Monitoring Software. All rights reserved.
Developed by FreDrickMwepu - Zambian Energy Solutions
