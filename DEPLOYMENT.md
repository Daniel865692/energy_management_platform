# African Energy Monitoring Platform - Deployment Guide

## Quick Start

### Local Development
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Serve Static Files**:
   ```bash
   npm run serve
   ```
   Then visit: http://localhost:8000

### Production Deployment

#### Option 1: Static Website Hosting
- Upload `index.html`, `dashboardpro.html`, `js/`, `images/` folders to any web server
- Works with Netlify, Vercel, GitHub Pages, or traditional hosting

#### Option 2: Full-Stack Deployment
1. **Setup Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

#### Option 3: Cloud Deployment

**Netlify/Vercel (Static)**:
- Connect your GitHub repository
- Deploy automatically on push

**Railway/Render (Full-Stack)**:
- Connect repository
- Set environment variables
- Deploy with automatic builds

## Environment Variables

Create a `.env` file with:
```
# Database Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

MONGODB_URI=mongodb://localhost:27017/energy_monitoring
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=energy-data

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=energy_monitoring

# API Configuration
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

## ESP32 Setup

1. **Install Libraries**:
   - WiFi
   - HTTPClient
   - ArduinoJson
   - Firebase ESP32 Client

2. **Configure WiFi**:
   - Update WiFi credentials in ESP32 code
   - Set your server URL

3. **Upload Code**:
   - Use Arduino IDE or PlatformIO
   - Upload `esp32_firebase_integration.ino` or `esp32_multi_database.ino`

## Monitoring & Maintenance

- **Health Check**: `GET /api/health`
- **Logs**: Check server logs for errors
- **Database**: Monitor connection status
- **ESP32**: Check device connectivity

## Troubleshooting

1. **CORS Issues**: Enable CORS in `api_server.js`
2. **Database Connection**: Check credentials and network
3. **ESP32 Not Connecting**: Verify WiFi and server URL
4. **Charts Not Loading**: Check Chart.js CDN and data format

## Security Considerations

- Use HTTPS in production
- Secure database connections
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets
