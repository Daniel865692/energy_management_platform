// Alternative Database Integration Options for Energy Management Platform
// This file provides multiple database backend options for ESP32 integration

// 1. Firebase Realtime Database Configuration
export const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// 2. MongoDB Atlas Configuration
export const mongoConfig = {
    uri: "mongodb+srv://username:password@cluster.mongodb.net/energy_management",
    database: "energy_management",
    collections: {
        sensorData: "sensor_readings",
        devices: "devices",
        users: "users",
        alerts: "alerts"
    }
};

// 3. InfluxDB Configuration (Perfect for time-series energy data)
export const influxConfig = {
    url: 'http://localhost:8086',
    token: 'your-influxdb-token',
    org: 'your-organization',
    bucket: 'energy_data'
};

// 4. MySQL/PostgreSQL Configuration
export const sqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'energy_user',
    password: 'your_password',
    database: 'energy_management'
};

// 5. ThingSpeak IoT Platform Configuration
export const thingSpeakConfig = {
    channelId: 'your_channel_id',
    writeApiKey: 'your_write_api_key',
    readApiKey: 'your_read_api_key',
    baseUrl: 'https://api.thingspeak.com'
};

// 6. Amazon AWS IoT Core Configuration
export const awsIotConfig = {
    region: 'us-east-1',
    accessKeyId: 'your_access_key',
    secretAccessKey: 'your_secret_key',
    iotEndpoint: 'your-iot-endpoint.amazonaws.com',
    thingName: 'ESP32_EnergyMonitor'
};

// 7. Azure IoT Hub Configuration
export const azureIotConfig = {
    connectionString: "HostName=your-hub.azure-devices.net;DeviceId=ESP32_001;SharedAccessKey=your-key",
    hubName: "your-iot-hub",
    deviceId: "ESP32_001"
};

/**
 * Database Integration Manager
 * Handles multiple database backends for ESP32 energy monitoring
 */
class DatabaseManager {
    constructor(config = {}) {
        this.dbType = config.type || 'firebase';
        this.config = config;
        this.connection = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        
        this.init();
    }

    async init() {
        try {
            switch(this.dbType) {
                case 'firebase':
                    await this.initFirebase();
                    break;
                case 'mongodb':
                    await this.initMongoDB();
                    break;
                case 'influxdb':
                    await this.initInfluxDB();
                    break;
                case 'mysql':
                    await this.initMySQL();
                    break;
                case 'thingspeak':
                    await this.initThingSpeak();
                    break;
                case 'aws':
                    await this.initAWSIoT();
                    break;
                case 'azure':
                    await this.initAzureIoT();
                    break;
                default:
                    throw new Error(`Unsupported database type: ${this.dbType}`);
            }
        } catch (error) {
            console.error(`Failed to initialize ${this.dbType}:`, error);
            this.handleConnectionError(error);
        }
    }

    // Firebase Realtime Database Integration
    async initFirebase() {
        const { initializeApp } = await import('firebase/app');
        const { getDatabase, ref, onValue, set, push } = await import('firebase/database');
        
        this.app = initializeApp(this.config.firebase || firebaseConfig);
        this.connection = getDatabase(this.app);
        this.isConnected = true;
        
        console.log('Firebase initialized successfully');
    }

    async storeEnergyData(data) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        switch(this.dbType) {
            case 'firebase':
                return await this.storeFirebaseData(data);
            case 'mongodb':
                return await this.storeMongoData(data);
            case 'influxdb':
                return await this.storeInfluxData(data);
            case 'mysql':
                return await this.storeSQLData(data);
            case 'thingspeak':
                return await this.storeThingSpeakData(data);
            default:
                throw new Error(`Storage not implemented for ${this.dbType}`);
        }
    }

    // Firebase data storage
    async storeFirebaseData(data) {
        const { ref, set, push, serverTimestamp } = await import('firebase/database');
        
        const energyRef = ref(this.connection, 'energy_data');
        const newEntryRef = push(energyRef);
        
        const enrichedData = {
            ...data,
            timestamp: serverTimestamp(),
            deviceId: data.deviceId || 'ESP32_001'
        };
        
        await set(newEntryRef, enrichedData);
        
        // Also update latest reading
        const latestRef = ref(this.connection, 'latest_reading');
        await set(latestRef, enrichedData);
        
        return true;
    }

    // MongoDB data storage
    async storeMongoData(data) {
        if (!this.mongoClient) {
            const { MongoClient } = require('mongodb');
            this.mongoClient = new MongoClient(this.config.mongodb.uri);
            await this.mongoClient.connect();
        }
        
        const db = this.mongoClient.db(this.config.mongodb.database);
        const collection = db.collection(this.config.mongodb.collections.sensorData);
        
        const enrichedData = {
            ...data,
            timestamp: new Date(),
            deviceId: data.deviceId || 'ESP32_001'
        };
        
        const result = await collection.insertOne(enrichedData);
        return result.acknowledged;
    }

    // InfluxDB data storage (Perfect for time-series data)
    async storeInfluxData(data) {
        if (!this.influxClient) {
            const { InfluxDB, Point } = require('@influxdata/influxdb-client');
            this.influxClient = new InfluxDB({
                url: this.config.influxdb.url,
                token: this.config.influxdb.token
            });
            this.writeClient = this.influxClient.getWriteApi(
                this.config.influxdb.org,
                this.config.influxdb.bucket
            );
        }
        
        const point = new Point('energy_consumption')
            .tag('device_id', data.deviceId || 'ESP32_001')
            .tag('location', data.location || 'main')
            .floatField('voltage', parseFloat(data.voltage) || 0)
            .floatField('current', parseFloat(data.current) || 0)
            .floatField('power', parseFloat(data.power) || 0)
            .floatField('power_factor', parseFloat(data.powerFactor) || 0)
            .floatField('frequency', parseFloat(data.frequency) || 0)
            .timestamp(new Date());
        
        this.writeClient.writePoint(point);
        await this.writeClient.flush();
        
        return true;
    }

    // MySQL/PostgreSQL data storage
    async storeSQLData(data) {
        if (!this.sqlConnection) {
            const mysql = require('mysql2/promise');
            this.sqlConnection = await mysql.createConnection(this.config.sql);
        }
        
        const query = `
            INSERT INTO energy_readings 
            (device_id, voltage, current, power, power_factor, frequency, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const values = [
            data.deviceId || 'ESP32_001',
            parseFloat(data.voltage) || 0,
            parseFloat(data.current) || 0,
            parseFloat(data.power) || 0,
            parseFloat(data.powerFactor) || 0,
            parseFloat(data.frequency) || 0
        ];
        
        const [result] = await this.sqlConnection.execute(query, values);
        return result.affectedRows > 0;
    }

    // ThingSpeak data storage
    async storeThingSpeakData(data) {
        const axios = require('axios');
        
        const params = {
            api_key: this.config.thingspeak.writeApiKey,
            field1: parseFloat(data.voltage) || 0,
            field2: parseFloat(data.current) || 0,
            field3: parseFloat(data.power) || 0,
            field4: parseFloat(data.powerFactor) || 0,
            field5: parseFloat(data.frequency) || 0
        };
        
        const response = await axios.post(
            `${this.config.thingspeak.baseUrl}/update`,
            null,
            { params }
        );
        
        return response.data > 0;
    }

    // Get latest energy reading
    async getLatestReading() {
        switch(this.dbType) {
            case 'firebase':
                return await this.getFirebaseLatest();
            case 'mongodb':
                return await this.getMongoLatest();
            case 'influxdb':
                return await this.getInfluxLatest();
            case 'mysql':
                return await this.getSQLLatest();
            case 'thingspeak':
                return await this.getThingSpeakLatest();
            default:
                throw new Error(`Read not implemented for ${this.dbType}`);
        }
    }

    // Firebase latest reading
    async getFirebaseLatest() {
        const { ref, get } = await import('firebase/database');
        const latestRef = ref(this.connection, 'latest_reading');
        const snapshot = await get(latestRef);
        return snapshot.val();
    }

    // MongoDB latest reading
    async getMongoLatest() {
        const db = this.mongoClient.db(this.config.mongodb.database);
        const collection = db.collection(this.config.mongodb.collections.sensorData);
        
        const latest = await collection.findOne(
            {},
            { sort: { timestamp: -1 } }
        );
        
        return latest;
    }

    // InfluxDB latest reading
    async getInfluxLatest() {
        const { FluxTableMetaData } = require('@influxdata/influxdb-client');
        
        const queryClient = this.influxClient.getQueryApi(this.config.influxdb.org);
        const fluxQuery = `
            from(bucket: "${this.config.influxdb.bucket}")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "energy_consumption")
            |> last()
        `;
        
        const data = await queryClient.collectRows(fluxQuery);
        return data.length > 0 ? data[0] : null;
    }

    // Get historical data for charts
    async getHistoricalData(hours = 24) {
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        switch(this.dbType) {
            case 'firebase':
                return await this.getFirebaseHistory(startTime);
            case 'mongodb':
                return await this.getMongoHistory(startTime);
            case 'influxdb':
                return await this.getInfluxHistory(startTime);
            case 'mysql':
                return await this.getSQLHistory(startTime);
            case 'thingspeak':
                return await this.getThingSpeakHistory(hours);
            default:
                throw new Error(`History not implemented for ${this.dbType}`);
        }
    }

    // Send device command
    async sendDeviceCommand(deviceId, command, value = null) {
        switch(this.dbType) {
            case 'firebase':
                return await this.sendFirebaseCommand(deviceId, command, value);
            case 'mongodb':
                return await this.sendMongoCommand(deviceId, command, value);
            default:
                throw new Error(`Commands not implemented for ${this.dbType}`);
        }
    }

    // Firebase device command
    async sendFirebaseCommand(deviceId, command, value) {
        const { ref, set, serverTimestamp } = await import('firebase/database');
        
        const commandRef = ref(this.connection, `device_commands/${deviceId}`);
        const commandData = {
            command: command,
            value: value,
            timestamp: serverTimestamp(),
            source: 'web_dashboard'
        };
        
        await set(commandRef, commandData);
        return true;
    }

    // Error handling and reconnection
    handleConnectionError(error) {
        console.error(`Database connection error (${this.dbType}):`, error);
        this.isConnected = false;
        
        if (this.retryCount < this.maxRetries) {
            setTimeout(() => {
                this.retryCount++;
                console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`);
                this.init();
            }, 5000 * this.retryCount); // Exponential backoff
        }
    }

    // Health check
    async healthCheck() {
        try {
            switch(this.dbType) {
                case 'firebase':
                    const testRef = ref(this.connection, '.info/connected');
                    return true;
                case 'mongodb':
                    await this.mongoClient.admin().ping();
                    return true;
                default:
                    return this.isConnected;
            }
        } catch (error) {
            return false;
        }
    }

    // Cleanup connections
    async cleanup() {
        try {
            switch(this.dbType) {
                case 'mongodb':
                    if (this.mongoClient) {
                        await this.mongoClient.close();
                    }
                    break;
                case 'influxdb':
                    if (this.writeClient) {
                        await this.writeClient.close();
                    }
                    if (this.influxClient) {
                        this.influxClient.close();
                    }
                    break;
                case 'mysql':
                    if (this.sqlConnection) {
                        await this.sqlConnection.end();
                    }
                    break;
            }
            
            console.log(`${this.dbType} connection cleaned up`);
        } catch (error) {
            console.error(`Error during cleanup:`, error);
        }
    }
}

// Database factory function
export function createDatabase(type, config = {}) {
    const dbConfig = { type, ...config };
    return new DatabaseManager(dbConfig);
}

// Export configurations for ESP32 integration
export const ESP32_DATABASE_CONFIGS = {
    firebase: {
        type: 'firebase',
        firebase: firebaseConfig
    },
    mongodb: {
        type: 'mongodb',
        mongodb: mongoConfig
    },
    influxdb: {
        type: 'influxdb',
        influxdb: influxConfig
    },
    mysql: {
        type: 'mysql',
        sql: sqlConfig
    },
    thingspeak: {
        type: 'thingspeak',
        thingspeak: thingSpeakConfig
    }
};

// Usage examples:
/*
// Firebase integration
const firebaseDB = createDatabase('firebase', ESP32_DATABASE_CONFIGS.firebase);

// MongoDB integration
const mongoDB = createDatabase('mongodb', ESP32_DATABASE_CONFIGS.mongodb);

// InfluxDB for time-series data
const influxDB = createDatabase('influxdb', ESP32_DATABASE_CONFIGS.influxdb);

// ThingSpeak for IoT cloud
const thingSpeakDB = createDatabase('thingspeak', ESP32_DATABASE_CONFIGS.thingspeak);
*/

export default DatabaseManager;
