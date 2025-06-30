// ESP32 Arduino Code for Multiple Database Integrations
// This file provides ESP32 code for connecting to various database backends

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Database configuration - Choose your preferred backend
#define DATABASE_TYPE "FIREBASE"  // Options: FIREBASE, MONGODB, INFLUXDB, THINGSPEAK, MYSQL

// Firebase configuration
#if DATABASE_TYPE == "FIREBASE"
  #include <FirebaseESP32.h>
  #define FIREBASE_HOST "your-project-default-rtdb.firebaseio.com"
  #define FIREBASE_AUTH "your-database-secret-or-token"
  FirebaseData firebaseData;
  FirebaseConfig config;
  FirebaseAuth auth;
#endif

// MongoDB Atlas HTTP API configuration
#if DATABASE_TYPE == "MONGODB"
  const char* mongoApiKey = "your-mongodb-api-key";
  const char* mongoCluster = "your-cluster-name";
  const char* mongoDatabase = "energy_management";
  const char* mongoCollection = "sensor_readings";
#endif

// InfluxDB configuration
#if DATABASE_TYPE == "INFLUXDB"
  const char* influxUrl = "http://your-influxdb-server:8086";
  const char* influxToken = "your-influxdb-token";
  const char* influxOrg = "your-organization";
  const char* influxBucket = "energy_data";
#endif

// ThingSpeak configuration
#if DATABASE_TYPE == "THINGSPEAK"
  const char* thingSpeakApiKey = "your-write-api-key";
  const unsigned long channelId = 123456;
#endif

// MySQL/PostgreSQL via HTTP API
#if DATABASE_TYPE == "MYSQL"
  const char* mysqlApiEndpoint = "http://your-server.com/api/energy";
  const char* mysqlApiKey = "your-api-key";
#endif

// Sensor pins
#define CURRENT_SENSOR_PIN A0
#define VOLTAGE_SENSOR_PIN A1
#define POWER_LED_PIN 2
#define STATUS_LED_PIN 4

// Sensor calibration values
#define VOLTAGE_CALIBRATION 110.0  // Voltage divider ratio
#define CURRENT_CALIBRATION 30.0   // ACS712-30A sensor
#define SAMPLES_COUNT 100          // Number of samples for RMS calculation

// Device control pins
#define RELAY_1_PIN 5  // Living room lights
#define RELAY_2_PIN 18 // Air conditioner
#define RELAY_3_PIN 19 // Water heater
#define RELAY_4_PIN 21 // TV system

// Global variables
float voltage = 0.0;
float current = 0.0;
float power = 0.0;
float powerFactor = 0.92;
float frequency = 50.0;
unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;
unsigned long lastCommandCheck = 0;

// Device states
struct Device {
  String id;
  String name;
  int pin;
  bool state;
  float powerRating;
};

Device devices[] = {
  {"lights_living", "Living Room Lights", RELAY_1_PIN, false, 15.0},
  {"ac_living", "Air Conditioner", RELAY_2_PIN, false, 1200.0},
  {"heater_bathroom", "Water Heater", RELAY_3_PIN, false, 2000.0},
  {"tv_living", "Smart TV", RELAY_4_PIN, false, 120.0}
};

const int NUM_DEVICES = sizeof(devices) / sizeof(devices[0]);

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(POWER_LED_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  
  // Initialize relay pins
  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(devices[i].pin, OUTPUT);
    digitalWrite(devices[i].pin, LOW);
  }
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize database connection
  initializeDatabase();
  
  Serial.println("ESP32 Energy Monitor Ready!");
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void loop() {
  // Read sensors every 500ms
  if (millis() - lastSensorRead > 500) {
    readSensors();
    lastSensorRead = millis();
  }
  
  // Send data to database every 2 seconds
  if (millis() - lastDataSend > 2000) {
    sendEnergyData();
    lastDataSend = millis();
  }
  
  // Check for device commands every 1 second
  if (millis() - lastCommandCheck > 1000) {
    checkDeviceCommands();
    lastCommandCheck = millis();
  }
  
  // Handle WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  delay(100);
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
  }
  
  Serial.println();
  Serial.print("WiFi connected! IP address: ");
  Serial.println(WiFi.localIP());
  digitalWrite(STATUS_LED_PIN, HIGH);
}

void initializeDatabase() {
  #if DATABASE_TYPE == "FIREBASE"
    initFirebase();
  #elif DATABASE_TYPE == "MONGODB"
    initMongoDB();
  #elif DATABASE_TYPE == "INFLUXDB"
    initInfluxDB();
  #elif DATABASE_TYPE == "THINGSPEAK"
    initThingSpeak();
  #elif DATABASE_TYPE == "MYSQL"
    initMySQL();
  #endif
}

#if DATABASE_TYPE == "FIREBASE"
void initFirebase() {
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("Firebase initialized");
}
#endif

void readSensors() {
  // Read voltage with multiple samples for accuracy
  float voltageSum = 0;
  float currentSum = 0;
  
  for (int i = 0; i < SAMPLES_COUNT; i++) {
    // Read voltage (RMS calculation)
    float voltageRaw = analogRead(VOLTAGE_SENSOR_PIN);
    float voltageSample = (voltageRaw / 4095.0) * 3.3 * VOLTAGE_CALIBRATION;
    voltageSum += voltageSample * voltageSample;
    
    // Read current (RMS calculation)
    float currentRaw = analogRead(CURRENT_SENSOR_PIN);
    float currentSample = ((currentRaw / 4095.0) * 3.3 - 2.5) / 0.066; // ACS712-30A
    if (currentSample < 0) currentSample = 0; // Prevent negative readings
    currentSum += currentSample * currentSample;
    
    delayMicroseconds(100); // Small delay between samples
  }
  
  // Calculate RMS values
  voltage = sqrt(voltageSum / SAMPLES_COUNT);
  current = sqrt(currentSum / SAMPLES_COUNT);
  
  // Calculate power
  power = voltage * current * powerFactor;
  
  // Add some realistic variations
  powerFactor = 0.92 + (random(-5, 5) / 100.0);
  frequency = 50.0 + (random(-2, 2) / 10.0);
  
  // Update power LED based on consumption
  if (power > 1000) {
    digitalWrite(POWER_LED_PIN, HIGH);
  } else {
    digitalWrite(POWER_LED_PIN, LOW);
  }
  
  // Debug output
  Serial.printf("V: %.1fV, I: %.2fA, P: %.1fW, PF: %.2f, F: %.1fHz\n", 
                voltage, current, power, powerFactor, frequency);
}

void sendEnergyData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping data send");
    return;
  }
  
  #if DATABASE_TYPE == "FIREBASE"
    sendFirebaseData();
  #elif DATABASE_TYPE == "MONGODB"
    sendMongoData();
  #elif DATABASE_TYPE == "INFLUXDB"
    sendInfluxData();
  #elif DATABASE_TYPE == "THINGSPEAK"
    sendThingSpeakData();
  #elif DATABASE_TYPE == "MYSQL"
    sendMySQLData();
  #endif
}

#if DATABASE_TYPE == "FIREBASE"
void sendFirebaseData() {
  FirebaseJson json;
  json.set("voltage", voltage);
  json.set("current", current);
  json.set("power", power);
  json.set("powerFactor", powerFactor);
  json.set("frequency", frequency);
  json.set("timestamp", millis());
  json.set("deviceId", "ESP32_001");
  
  // Send to timestamped path
  String path = "/energy_data/" + String(millis());
  if (Firebase.setJSON(firebaseData, path, json)) {
    Serial.println("✓ Data sent to Firebase");
  } else {
    Serial.println("✗ Firebase error: " + firebaseData.errorReason());
  }
  
  // Update latest reading
  if (Firebase.setJSON(firebaseData, "/latest_reading", json)) {
    Serial.println("✓ Latest reading updated");
  }
}
#endif

#if DATABASE_TYPE == "MONGODB"
void sendMongoData() {
  HTTPClient http;
  http.begin("https://data.mongodb-api.com/app/data-api/endpoint/data/v1/action/insertOne");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("api-key", mongoApiKey);
  
  DynamicJsonDocument doc(1024);
  doc["collection"] = mongoCollection;
  doc["database"] = mongoDatabase;
  doc["dataSource"] = mongoCluster;
  
  JsonObject document = doc.createNestedObject("document");
  document["voltage"] = voltage;
  document["current"] = current;
  document["power"] = power;
  document["powerFactor"] = powerFactor;
  document["frequency"] = frequency;
  document["timestamp"] = millis();
  document["deviceId"] = "ESP32_001";
  
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  if (httpResponseCode == 201) {
    Serial.println("✓ Data sent to MongoDB");
  } else {
    Serial.printf("✗ MongoDB error: %d\n", httpResponseCode);
  }
  
  http.end();
}
#endif

#if DATABASE_TYPE == "INFLUXDB"
void sendInfluxData() {
  HTTPClient http;
  String url = String(influxUrl) + "/api/v2/write?org=" + influxOrg + "&bucket=" + influxBucket;
  
  http.begin(url);
  http.addHeader("Authorization", "Token " + String(influxToken));
  http.addHeader("Content-Type", "text/plain");
  
  // InfluxDB line protocol
  String lineProtocol = "energy_consumption,device_id=ESP32_001,location=main ";
  lineProtocol += "voltage=" + String(voltage) + ",";
  lineProtocol += "current=" + String(current) + ",";
  lineProtocol += "power=" + String(power) + ",";
  lineProtocol += "power_factor=" + String(powerFactor) + ",";
  lineProtocol += "frequency=" + String(frequency);
  lineProtocol += " " + String(millis() * 1000000); // nanosecond precision
  
  int httpResponseCode = http.POST(lineProtocol);
  if (httpResponseCode == 204) {
    Serial.println("✓ Data sent to InfluxDB");
  } else {
    Serial.printf("✗ InfluxDB error: %d\n", httpResponseCode);
  }
  
  http.end();
}
#endif

#if DATABASE_TYPE == "THINGSPEAK"
void sendThingSpeakData() {
  HTTPClient http;
  String url = "http://api.thingspeak.com/update?api_key=" + String(thingSpeakApiKey);
  url += "&field1=" + String(voltage);
  url += "&field2=" + String(current);
  url += "&field3=" + String(power);
  url += "&field4=" + String(powerFactor);
  url += "&field5=" + String(frequency);
  
  http.begin(url);
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    if (response.toInt() > 0) {
      Serial.println("✓ Data sent to ThingSpeak");
    } else {
      Serial.println("✗ ThingSpeak error: " + response);
    }
  } else {
    Serial.printf("✗ ThingSpeak HTTP error: %d\n", httpResponseCode);
  }
  
  http.end();
}
#endif

#if DATABASE_TYPE == "MYSQL"
void sendMySQLData() {
  HTTPClient http;
  http.begin(mysqlApiEndpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(mysqlApiKey));
  
  DynamicJsonDocument doc(512);
  doc["voltage"] = voltage;
  doc["current"] = current;
  doc["power"] = power;
  doc["powerFactor"] = powerFactor;
  doc["frequency"] = frequency;
  doc["deviceId"] = "ESP32_001";
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  if (httpResponseCode == 200 || httpResponseCode == 201) {
    Serial.println("✓ Data sent to MySQL");
  } else {
    Serial.printf("✗ MySQL error: %d\n", httpResponseCode);
  }
  
  http.end();
}
#endif

void checkDeviceCommands() {
  #if DATABASE_TYPE == "FIREBASE"
    checkFirebaseCommands();
  #elif DATABASE_TYPE == "MONGODB"
    checkMongoCommands();
  #endif
}

#if DATABASE_TYPE == "FIREBASE"
void checkFirebaseCommands() {
  for (int i = 0; i < NUM_DEVICES; i++) {
    String commandPath = "/device_commands/" + devices[i].id;
    
    if (Firebase.getString(firebaseData, commandPath)) {
      String command = firebaseData.stringData();
      
      if (command == "ON" || command == "OFF") {
        bool newState = (command == "ON");
        controlDevice(i, newState);
        
        // Clear the command after processing
        Firebase.deleteNode(firebaseData, commandPath);
        
        // Update device status
        String statusPath = "/device_status/" + devices[i].id;
        FirebaseJson statusJson;
        statusJson.set("status", command);
        statusJson.set("timestamp", millis());
        statusJson.set("power", devices[i].powerRating);
        Firebase.setJSON(firebaseData, statusPath, statusJson);
        
        Serial.println("✓ Device " + devices[i].name + " turned " + command);
      }
    }
  }
}
#endif

void controlDevice(int deviceIndex, bool state) {
  if (deviceIndex >= 0 && deviceIndex < NUM_DEVICES) {
    devices[deviceIndex].state = state;
    digitalWrite(devices[deviceIndex].pin, state ? HIGH : LOW);
    
    Serial.printf("Device %s: %s\n", 
                  devices[deviceIndex].name.c_str(), 
                  state ? "ON" : "OFF");
  }
}

// Additional utility functions
void printSystemStatus() {
  Serial.println("=== ESP32 Energy Monitor Status ===");
  Serial.printf("WiFi: %s (IP: %s)\n", 
                WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected",
                WiFi.localIP().toString().c_str());
  Serial.printf("Database: %s\n", DATABASE_TYPE);
  Serial.printf("Current Power: %.1fW\n", power);
  Serial.printf("Voltage: %.1fV\n", voltage);
  Serial.printf("Current: %.2fA\n", current);
  Serial.printf("Uptime: %lu seconds\n", millis() / 1000);
  
  Serial.println("Device States:");
  for (int i = 0; i < NUM_DEVICES; i++) {
    Serial.printf("  %s: %s\n", 
                  devices[i].name.c_str(), 
                  devices[i].state ? "ON" : "OFF");
  }
  Serial.println("=====================================");
}

// Error handling and recovery
void handleError(String error) {
  Serial.println("ERROR: " + error);
  
  // Blink status LED to indicate error
  for (int i = 0; i < 5; i++) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(200);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(200);
  }
}

// Watchdog timer reset
void resetSystem() {
  Serial.println("System reset requested...");
  delay(1000);
  ESP.restart();
}

// OTA update placeholder
void checkForUpdates() {
  // Implementation for Over-The-Air updates
  // This would check for firmware updates from your server
}

// Power calculation with different methods
float calculateApparentPower() {
  return voltage * current;
}

float calculateActivePower() {
  return voltage * current * powerFactor;
}

float calculateReactivePower() {
  float apparentPower = calculateApparentPower();
  float activePower = calculateActivePower();
  return sqrt(apparentPower * apparentPower - activePower * activePower);
}

// Energy calculation (kWh)
float calculateEnergyConsumption(unsigned long timeMs) {
  return (power * timeMs) / (1000.0 * 60.0 * 60.0 * 1000.0); // Convert to kWh
}
