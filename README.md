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

## IoT Device Integration

### 🔧 **Supported Devices**
- **Air Conditioners**: Temperature control and scheduling
- **Water Heaters**: On/off control with timer functionality
- **Smart Lights**: Dimming and scheduling capabilities
- **Kitchen Appliances**: Microwave, refrigerator monitoring
- **Entertainment**: TV and sound system control
- **Security Systems**: Always-on monitoring with status alerts
- **Washing Machines**: Energy-efficient cycle recommendations

### 📡 **ESP32 Communication**
- **Real-time Data**: Voltage, current, power factor, frequency
- **Device Commands**: Send on/off signals to connected devices
- **Status Feedback**: Confirm device state changes
- **Network Monitoring**: Connection status and health checks

### 🤖 **Machine Learning Features**
- **Usage Prediction**: Forecast energy consumption patterns
- **Anomaly Detection**: Identify unusual device behavior
- **Optimization Suggestions**: Automated efficiency recommendations
- **Load Balancing**: Smart scheduling to avoid peak charges

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

## License

© 2025 African Energy Monitoring Software. All rights reserved.
