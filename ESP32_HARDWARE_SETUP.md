# ESP32 Hardware Setup Guide

## Overview
This guide will help you set up the ESP32 microcontroller for real-time energy monitoring with current sensors and relay control for smart devices.

## Hardware Requirements

### ESP32 Development Board
- **Recommended**: ESP32 DevKit V1 or ESP32 WROOM-32
- **Features**: WiFi, Bluetooth, GPIO pins, ADC, PWM
- **Power**: 3.3V/5V via USB or external power supply

### Current Sensors
- **Primary**: ACS712 20A Current Sensor (recommended)
- **Alternative**: SCT-013 Non-invasive Current Transformer
- **Quantity**: 1-4 sensors depending on monitoring needs

### Relay Modules
- **Type**: 8-channel 5V relay module
- **Purpose**: Control smart home devices (AC, lights, water heater, etc.)
- **Isolation**: Optocoupler isolation for safety

### Additional Components
- **Resistors**: 10kΩ pull-up resistors
- **Capacitors**: 100µF electrolytic capacitors for power filtering
- **Breadboard/PCB**: For prototyping and final assembly
- **Jumper Wires**: Male-to-male, male-to-female connections
- **Power Supply**: 5V/12V for relay modules

## Wiring Diagram

### ESP32 Pin Configuration
```
ESP32 Pin    | Component           | Description
-------------|--------------------|-----------------
GPIO 34      | ACS712 OUT         | Current sensor 1 (ADC1_CH6)
GPIO 35      | ACS712 OUT         | Current sensor 2 (ADC1_CH7)
GPIO 32      | ACS712 OUT         | Current sensor 3 (ADC1_CH4)
GPIO 33      | ACS712 OUT         | Current sensor 4 (ADC1_CH5)
GPIO 2       | Relay CH1          | Device 1 control (LED indicator)
GPIO 4       | Relay CH2          | Device 2 control
GPIO 5       | Relay CH3          | Device 3 control
GPIO 18      | Relay CH4          | Device 4 control
GPIO 19      | Relay CH5          | Device 5 control
GPIO 21      | Relay CH6          | Device 6 control
GPIO 22      | Relay CH7          | Device 7 control
GPIO 23      | Relay CH8          | Device 8 control
3V3          | ACS712 VCC         | Power supply for sensors
GND          | Common Ground      | All components ground
5V/VIN       | Relay Module VCC   | Power supply for relays
```

### Current Sensor (ACS712) Connections
```
ACS712 Pin   | ESP32 Pin    | Description
-------------|--------------|------------------
VCC          | 3V3          | Power supply (3.3V or 5V)
GND          | GND          | Ground
OUT          | GPIO 34-33   | Analog output to ADC pin
IP+          | Load Wire    | Positive current path
IP-          | Load Wire    | Negative current path
```

### Relay Module Connections
```
Relay Pin    | ESP32 Pin    | Description
-------------|--------------|------------------
VCC          | 5V/VIN       | Power supply (5V recommended)
GND          | GND          | Ground
IN1-IN8      | GPIO 2-23    | Control signals (3.3V logic)
COM          | AC Line      | Common terminal
NO           | Device       | Normally Open (switch output)
NC           | -            | Normally Closed (not used)
```

## Installation Steps

### Step 1: Prepare the Hardware
1. **Gather Components**: Ensure all components are available
2. **Check ESP32**: Verify ESP32 board functionality with simple blink test
3. **Test Sensors**: Check current sensor output with multimeter

### Step 2: Wiring Setup
1. **Power Connections**:
   - Connect ESP32 GND to common ground rail
   - Connect 3V3 to power rail for sensors
   - Connect 5V/VIN to relay module power

2. **Current Sensor Wiring**:
   ```
   ACS712 Sensor 1:
   - VCC → ESP32 3V3
   - GND → ESP32 GND  
   - OUT → ESP32 GPIO 34
   - IP+/IP- → AC line (through load)
   ```

3. **Relay Module Wiring**:
   ```
   8-Channel Relay:
   - VCC → ESP32 5V
   - GND → ESP32 GND
   - IN1 → ESP32 GPIO 2
   - IN2 → ESP32 GPIO 4
   - (continue for all 8 channels)
   ```

### Step 3: Safety Considerations
⚠️ **HIGH VOLTAGE WARNING**: Working with AC mains voltage is dangerous!

1. **AC Line Safety**:
   - Turn OFF main power before wiring
   - Use proper electrical enclosures
   - Install appropriate fuses and circuit breakers
   - Follow local electrical codes

2. **Isolation**:
   - Use optocoupler-isolated relay modules
   - Keep low-voltage (ESP32) and high-voltage (AC) circuits separate
   - Use proper wire gauges for current ratings

3. **Testing**:
   - Test with low voltage first (12V DC)
   - Verify all connections before applying AC power
   - Use multimeter to check continuity

### Step 4: Software Installation

1. **Arduino IDE Setup**:
   ```bash
   # Install Arduino IDE
   # Add ESP32 board package: https://dl.espressif.com/dl/package_esp32_index.json
   ```

2. **Required Libraries**:
   ```
   - WiFi (built-in)
   - HTTPClient (built-in)
   - ArduinoJson (install via Library Manager)
   - Firebase ESP32 Client (install via Library Manager)
   - WebSocketsClient (for real-time updates)
   ```

3. **Upload Code**:
   ```bash
   # Select Board: ESP32 Dev Module
   # Select Port: /dev/cu.usbserial-**** (Mac) or COM* (Windows)
   # Upload esp32_firebase_integration.ino or esp32_multi_database.ino
   ```

## Calibration

### Current Sensor Calibration
```cpp
// ACS712 20A sensor specifications
const float SENSOR_SENSITIVITY = 0.1;  // 100mV/A for ACS712-20A
const float SENSOR_OFFSET = 2.5;       // 2.5V at 0A (for 5V supply)
const float ADC_REFERENCE = 3.3;       // ESP32 ADC reference voltage
const int ADC_RESOLUTION = 4095;       // 12-bit ADC

// Calibration function
float readCurrent(int pin) {
    int rawValue = analogRead(pin);
    float voltage = (rawValue * ADC_REFERENCE) / ADC_RESOLUTION;
    float current = (voltage - SENSOR_OFFSET) / SENSOR_SENSITIVITY;
    return abs(current);  // Return absolute value
}
```

### Relay Testing
```cpp
// Test relay operation
void testRelays() {
    for (int i = 0; i < 8; i++) {
        digitalWrite(relayPins[i], HIGH);  // Turn ON
        delay(1000);
        digitalWrite(relayPins[i], LOW);   // Turn OFF
        delay(1000);
    }
}
```

## Troubleshooting

### Common Issues

1. **Current Reading Always Zero**:
   - Check sensor power supply (3.3V or 5V)
   - Verify analog pin connections
   - Ensure AC current is flowing through sensor

2. **Relays Not Switching**:
   - Check 5V power supply to relay module
   - Verify GPIO pin assignments
   - Test with multimeter across relay contacts

3. **WiFi Connection Issues**:
   - Check WiFi credentials in code
   - Verify network signal strength
   - Try different WiFi channels

4. **ESP32 Not Detected**:
   - Install CP2102 or CH340 drivers
   - Check USB cable (data cable, not charging only)
   - Try different USB ports

### Debugging Code
```cpp
// Enable serial debugging
void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 Energy Monitor Starting...");
}

void loop() {
    // Print sensor readings
    Serial.print("Current 1: ");
    Serial.print(readCurrent(34));
    Serial.println(" A");
    
    // Print WiFi status
    Serial.print("WiFi Status: ");
    Serial.println(WiFi.status());
    
    delay(1000);
}
```

## Enclosure and Mounting

### Recommended Enclosure
- **Type**: IP65 rated electrical enclosure
- **Size**: Minimum 200x150x100mm
- **Material**: ABS plastic or metal
- **Features**: Cable glands, mounting holes

### Mounting Considerations
1. **Ventilation**: Ensure adequate airflow for heat dissipation
2. **Accessibility**: Easy access for maintenance and updates
3. **Safety**: Away from water and direct sunlight
4. **Signal**: Good WiFi reception area

## Maintenance

### Regular Checks (Monthly)
- [ ] Verify current sensor accuracy
- [ ] Test relay operation
- [ ] Check WiFi connectivity
- [ ] Inspect wiring connections
- [ ] Update firmware if needed

### Calibration (Quarterly)
- [ ] Compare readings with calibrated meter
- [ ] Adjust offset and sensitivity values
- [ ] Document any changes

## Support and Resources

### Documentation
- ESP32 Datasheet: [Espressif Official Docs]
- ACS712 Datasheet: [Allegro MicroSystems]
- Arduino ESP32 Guide: [Arduino.cc]

### Community Support
- ESP32 Forum: [ESP32.com]
- Arduino Community: [Arduino.cc/forum]
- Project GitHub: [Your Repository]

### Safety Resources
- Local Electrical Code
- Qualified Electrician for AC wiring
- Electrical Safety Guidelines

---

⚠️ **Important**: Always consult with a qualified electrician for AC mains voltage connections. This guide is for educational purposes and the authors are not responsible for any damage or injury resulting from improper installation.
