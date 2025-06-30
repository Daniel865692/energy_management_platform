#!/bin/bash

# African Energy Monitoring Platform - Installation Script
# This script helps set up the platform for development or production

echo "🌍 African Energy Monitoring Platform - Installation Script"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_header "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 16
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            print_warning "Node.js version $NODE_VERSION detected. Recommend upgrading to v16 or higher."
        fi
    else
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        echo "Visit: https://nodejs.org/en/download/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_header "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing project dependencies..."
    if [ -f "package.json" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_status "Dependencies installed successfully!"
        else
            print_error "Failed to install dependencies."
            exit 1
        fi
    else
        print_error "package.json not found. Make sure you're in the project directory."
        exit 1
    fi
}

# Setup environment variables
setup_environment() {
    print_header "Setting up environment variables..."
    if [ -f ".env.example" ]; then
        if [ ! -f ".env" ]; then
            cp .env.example .env
            print_status "Created .env file from template."
            print_warning "Please edit .env file with your actual configuration values."
        else
            print_status ".env file already exists."
        fi
    else
        print_warning ".env.example not found. Skipping environment setup."
    fi
}

# Create logs directory
create_directories() {
    print_header "Creating necessary directories..."
    mkdir -p logs
    mkdir -p data
    mkdir -p uploads
    print_status "Directories created successfully!"
}

# Check Python for simple server
check_python() {
    print_header "Checking Python installation (for simple server)..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_status "Python3 is installed: $PYTHON_VERSION"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version)
        print_status "Python is installed: $PYTHON_VERSION"
    else
        print_warning "Python is not installed. The 'npm run serve' command won't work."
        print_status "You can still use the Node.js server with 'npm start'."
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Installation completed successfully!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Edit the .env file with your actual configuration values"
    echo "2. For development: npm run dev"
    echo "3. For production: npm start"
    echo "4. For static serving: npm run serve"
    echo ""
    echo "ESP32 Setup:"
    echo "1. Install Arduino IDE libraries: WiFi, HTTPClient, ArduinoJson, Firebase ESP32 Client"
    echo "2. Update WiFi credentials in esp32_*.ino files"
    echo "3. Set server URL to your deployed application"
    echo "4. Upload code to ESP32 device"
    echo ""
    echo "Database Setup:"
    echo "1. Choose your preferred database (Firebase, MongoDB, InfluxDB, etc.)"
    echo "2. Update connection details in .env file"
    echo "3. Run database migrations if needed"
    echo ""
    echo "For detailed deployment instructions, see DEPLOYMENT.md"
    echo ""
    echo "🌍 Happy energy monitoring!"
}

# Main installation process
main() {
    echo ""
    check_nodejs
    check_npm
    install_dependencies
    setup_environment
    create_directories
    check_python
    show_next_steps
}

# Run the installation
main
