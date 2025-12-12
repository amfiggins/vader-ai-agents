#!/bin/bash

# Launch script for Vader AI Orchestrator
# This script checks if the server is running, starts it if needed, then opens the browser

ORCHESTRATOR_DIR="/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
PORT=3002
URL="http://localhost:${PORT}"

# Function to check if server is running
check_server() {
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Server is running
    else
        return 1  # Server is not running
    fi
}

# Function to start the server
start_server() {
    cd "$ORCHESTRATOR_DIR" || exit 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Start the server in the background
    echo "Starting orchestrator server on port ${PORT}..."
    PORT=${PORT} npm run dev > /tmp/orchestrator.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready (max 30 seconds)
    echo "Waiting for server to start..."
    for i in {1..30}; do
        sleep 1
        if check_server; then
            echo "Server started successfully!"
            return 0
        fi
    done
    
    echo "Server failed to start within 30 seconds"
    return 1
}

# Main execution
if ! check_server; then
    echo "Server is not running. Starting it now..."
    start_server
    if [ $? -ne 0 ]; then
        osascript -e 'display notification "Failed to start orchestrator server" with title "Vader AI Orchestrator"'
        exit 1
    fi
else
    echo "Server is already running."
fi

# Give it a moment to fully initialize
sleep 2

# Open the browser to the web interface
echo "Opening orchestrator web interface in browser..."
open "${URL}"

# Show notification
osascript -e "display notification \"Orchestrator is running at ${URL}\" with title \"Vader AI Orchestrator\""

# Keep the app running for a moment to show any errors
# The app will close after this, but the server continues running in the background
sleep 1
