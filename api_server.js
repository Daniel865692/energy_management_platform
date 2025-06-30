// Backend API Server for Energy Management Platform
// Node.js Express server providing REST API for multiple database integrations

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database managers
const FirebaseManager = require('./managers/firebase-manager');
const MongoManager = require('./managers/mongo-manager');
const InfluxManager = require('./managers/influx-manager');
const MySQLManager = require('./managers/mysql-manager');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
let dbManager;
const DB_TYPE = process.env.DB_TYPE || 'firebase';

async function initializeDatabase() {
  try {
    switch (DB_TYPE.toLowerCase()) {
      case 'firebase':
        dbManager = new FirebaseManager();
        break;
      case 'mongodb':
        dbManager = new MongoManager();
        break;
      case 'influxdb':
        dbManager = new InfluxManager();
        break;
      case 'mysql':
        dbManager = new MySQLManager();
        break;
      default:
        throw new Error(`Unsupported database type: ${DB_TYPE}`);
    }
    
    await dbManager.connect();
    console.log(`✓ ${DB_TYPE} database connected successfully`);
  } catch (error) {
    console.error(`✗ Database connection failed:`, error);
    process.exit(1);
  }
}

// Validation middleware
const validateEnergyData = [
  body('voltage').isFloat({ min: 0, max: 300 }).withMessage('Invalid voltage value'),
  body('current').isFloat({ min: 0, max: 100 }).withMessage('Invalid current value'),
  body('power').isFloat({ min: 0, max: 10000 }).withMessage('Invalid power value'),
  body('powerFactor').isFloat({ min: 0, max: 1 }).withMessage('Invalid power factor'),
  body('frequency').isFloat({ min: 45, max: 65 }).withMessage('Invalid frequency'),
  body('deviceId').isString().notEmpty().withMessage('Device ID is required')
];

const validateDeviceCommand = [
  body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
  body('command').isIn(['ON', 'OFF', 'TOGGLE']).withMessage('Invalid command'),
  body('value').optional().isNumeric().withMessage('Invalid value')
];

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        type: DB_TYPE,
        connected: dbHealth
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Store energy data from ESP32
app.post('/api/energy/data', validateEnergyData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const energyData = {
      voltage: parseFloat(req.body.voltage),
      current: parseFloat(req.body.current),
      power: parseFloat(req.body.power),
      powerFactor: parseFloat(req.body.powerFactor),
      frequency: parseFloat(req.body.frequency),
      deviceId: req.body.deviceId,
      timestamp: new Date(),
      source: 'esp32'
    };

    const result = await dbManager.storeEnergyData(energyData);
    
    if (result) {
      res.status(201).json({
        success: true,
        message: 'Energy data stored successfully',
        id: result.id || null
      });
    } else {
      throw new Error('Failed to store energy data');
    }
  } catch (error) {
    console.error('Error storing energy data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get latest energy reading
app.get('/api/energy/latest/:deviceId?', async (req, res) => {
  try {
    const deviceId = req.params.deviceId || 'ESP32_001';
    const latestData = await dbManager.getLatestReading(deviceId);
    
    if (latestData) {
      res.json({
        success: true,
        data: latestData
      });
    } else {
      res.status(404).json({
        error: 'No data found',
        message: `No recent data found for device ${deviceId}`
      });
    }
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get historical energy data
app.get('/api/energy/history/:deviceId?', async (req, res) => {
  try {
    const deviceId = req.params.deviceId || 'ESP32_001';
    const hours = parseInt(req.query.hours) || 24;
    const limit = parseInt(req.query.limit) || 100;
    
    if (hours > 168) { // Maximum 7 days
      return res.status(400).json({
        error: 'Invalid time range',
        message: 'Maximum history range is 168 hours (7 days)'
      });
    }
    
    const historicalData = await dbManager.getHistoricalData(deviceId, hours, limit);
    
    res.json({
      success: true,
      data: historicalData,
      meta: {
        deviceId: deviceId,
        hours: hours,
        count: historicalData.length
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send device command
app.post('/api/devices/command', validateDeviceCommand, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { deviceId, command, value } = req.body;
    
    const commandData = {
      deviceId: deviceId,
      command: command,
      value: value,
      timestamp: new Date(),
      source: 'web_api'
    };

    const result = await dbManager.sendDeviceCommand(commandData);
    
    if (result) {
      res.json({
        success: true,
        message: `Command '${command}' sent to device '${deviceId}'`,
        commandId: result.id || null
      });
    } else {
      throw new Error('Failed to send device command');
    }
  } catch (error) {
    console.error('Error sending device command:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get device status
app.get('/api/devices/status/:deviceId?', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const deviceStatus = await dbManager.getDeviceStatus(deviceId);
    
    res.json({
      success: true,
      data: deviceStatus
    });
  } catch (error) {
    console.error('Error fetching device status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get energy statistics
app.get('/api/energy/stats/:deviceId?', async (req, res) => {
  try {
    const deviceId = req.params.deviceId || 'ESP32_001';
    const period = req.query.period || 'day'; // day, week, month
    
    const stats = await dbManager.getEnergyStatistics(deviceId, period);
    
    res.json({
      success: true,
      data: stats,
      meta: {
        deviceId: deviceId,
        period: period
      }
    });
  } catch (error) {
    console.error('Error fetching energy statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create alert
app.post('/api/alerts', async (req, res) => {
  try {
    const { type, message, priority, deviceId } = req.body;
    
    const alertData = {
      type: type,
      message: message,
      priority: priority || 'medium',
      deviceId: deviceId,
      timestamp: new Date(),
      resolved: false
    };

    const result = await dbManager.createAlert(alertData);
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      alertId: result.id
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const resolved = req.query.resolved === 'true';
    const limit = parseInt(req.query.limit) || 50;
    
    const alerts = await dbManager.getAlerts(resolved, limit);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Export energy data
app.get('/api/energy/export/:deviceId?', async (req, res) => {
  try {
    const deviceId = req.params.deviceId || 'ESP32_001';
    const startDate = req.query.start;
    const endDate = req.query.end;
    const format = req.query.format || 'json'; // json, csv
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Start date and end date are required'
      });
    }
    
    const exportData = await dbManager.exportEnergyData(deviceId, startDate, endDate);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="energy_data_${deviceId}.csv"`);
      
      // Convert to CSV
      const csv = convertToCSV(exportData);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: exportData,
        meta: {
          deviceId: deviceId,
          startDate: startDate,
          endDate: endDate,
          count: exportData.length
        }
      });
    }
  } catch (error) {
    console.error('Error exporting energy data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// WebSocket for real-time updates
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe', (deviceId) => {
    socket.join(`device_${deviceId}`);
    console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
  });
  
  socket.on('unsubscribe', (deviceId) => {
    socket.leave(`device_${deviceId}`);
    console.log(`Client ${socket.id} unsubscribed from device ${deviceId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Broadcast real-time updates
function broadcastEnergyUpdate(deviceId, data) {
  io.to(`device_${deviceId}`).emit('energy_update', data);
}

function broadcastDeviceStatus(deviceId, status) {
  io.to(`device_${deviceId}`).emit('device_status', status);
}

// Utility functions
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  
  return [headers, ...rows].join('\n');
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint was not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  if (dbManager) {
    await dbManager.disconnect();
    console.log('Database connection closed');
  }
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`
🚀 Energy Management API Server Started
📡 Server running on port ${PORT}
🗄️  Database: ${DB_TYPE}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/api/health
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Make broadcast functions available globally
global.broadcastEnergyUpdate = broadcastEnergyUpdate;
global.broadcastDeviceStatus = broadcastDeviceStatus;

startServer();

module.exports = app;
