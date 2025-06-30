// ESP32 Firebase Integration for Energy Monitoring
// Install: FirebaseESP32 library in Arduino IDE

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase configuration
#define FIREBASE_HOST "your-project-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "your-database-secret-or-token"

// Sensor pins
#define CURRENT_SENSOR_PIN A0
#define VOLTAGE_SENSOR_PIN A1

// Firebase objects
FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;

// Sensor data structure
struct SensorData {
  float voltage;
  float current;
  float power;
  float powerFactor;
  float frequency;
  unsigned long timestamp;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected!");
  
  // Configure Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("Firebase connected!");
}

void loop() {
  // Read sensor data
  SensorData data = readSensorData();
  
  // Send to Firebase
  sendToFirebase(data);
  
  // Check for device control commands
  checkDeviceCommands();
  
  delay(2000); // Send data every 2 seconds
}

SensorData readSensorData() {
  SensorData data;
  
  // Read voltage (assuming voltage divider circuit)
  float voltageRaw = analogRead(VOLTAGE_SENSOR_PIN);
  data.voltage = (voltageRaw / 4095.0) * 3.3 * 110; // Scale to actual voltage
  
  // Read current (assuming ACS712 current sensor)
  float currentRaw = analogRead(CURRENT_SENSOR_PIN);
  data.current = ((currentRaw / 4095.0) * 3.3 - 2.5) / 0.066; // ACS712-30A
  
  // Calculate power
  data.power = data.voltage * data.current;
  
  // Simulate power factor (you might have a dedicated sensor)
  data.powerFactor = 0.92 + (random(-5, 5) / 100.0);
  
  // Simulate frequency
  data.frequency = 50.0 + (random(-2, 2) / 10.0);
  
  data.timestamp = millis();
  
  return data;
}

void sendToFirebase(SensorData data) {
  // Create JSON object
  FirebaseJson json;
  json.set("voltage", data.voltage);
  json.set("current", data.current);
  json.set("power", data.power);
  json.set("powerFactor", data.powerFactor);
  json.set("frequency", data.frequency);
  json.set("timestamp", data.timestamp);
  json.set("deviceId", "ESP32_001");
  
  // Send to Firebase
  String path = "/energy_data/" + String(data.timestamp);
  if (Firebase.setJSON(firebaseData, path, json)) {
    Serial.println("Data sent to Firebase successfully");
  } else {
    Serial.println("Failed to send data: " + firebaseData.errorReason());
  }
  
  // Update latest reading for real-time display
  if (Firebase.setJSON(firebaseData, "/latest_reading", json)) {
    Serial.println("Latest reading updated");
  }
}

void checkDeviceCommands() {
  // Listen for device control commands
  if (Firebase.getString(firebaseData, "/device_commands/lights_living")) {
    String command = firebaseData.stringData();
    if (command == "ON") {
      // Turn on lights (connect relay to appropriate pin)
      digitalWrite(2, HIGH);
      Serial.println("Lights turned ON");
    } else if (command == "OFF") {
      digitalWrite(2, LOW);
      Serial.println("Lights turned OFF");
    }
    
    // Clear command after processing
    Firebase.deleteNode(firebaseData, "/device_commands/lights_living");
  }
  
  // Check other device commands similarly
  if (Firebase.getString(firebaseData, "/device_commands/ac_living")) {
    String command = firebaseData.stringData();
    // Process AC commands
    Firebase.deleteNode(firebaseData, "/device_commands/ac_living");
  }
}
