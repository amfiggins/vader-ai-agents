#!/bin/bash

# Restart script for Vader AI Orchestrator server
# This script kills any existing server process and starts a fresh one

ORCHESTRATOR_DIR="/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
PORT=3002
LOG_FILE="/tmp/orchestrator-server.log"

# Function to check if server is running
check_server() {
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Server is running
    else
        return 1  # Server is not running
    fi
}

# Function to kill server processes
kill_server() {
    echo "Stopping orchestrator server..."
    
    # Find and kill processes listening on the port
    PIDS=$(lsof -ti :${PORT} 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "Found processes on port ${PORT}: $PIDS"
        for PID in $PIDS; do
            echo "Killing process $PID..."
            kill -TERM $PID 2>/dev/null || true
        done
        
        # Wait a bit for graceful shutdown
        sleep 2
        
        # Force kill if still running
        PIDS=$(lsof -ti :${PORT} 2>/dev/null)
        if [ -n "$PIDS" ]; then
            echo "Force killing remaining processes..."
            for PID in $PIDS; do
                kill -KILL $PID 2>/dev/null || true
            done
        fi
    fi
    
    # Also kill any npm/node processes related to orchestrator
    pkill -f "npm.*run.*dev.*orchestrator" 2>/dev/null || true
    pkill -f "ts-node.*orchestrator.*server" 2>/dev/null || true
    
    # Wait a moment for processes to die
    sleep 1
    
    if check_server; then
        echo "Warning: Server may still be running. Please check manually."
        return 1
    else
        echo "Server stopped successfully."
        return 0
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
    PORT=${PORT} npm run dev >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    echo "Server process started (PID: $SERVER_PID)"
    echo "Logs are being written to: $LOG_FILE"
    
    # Wait for server to be ready (max 30 seconds)
    echo "Waiting for server to start..."
    for i in {1..30}; do
        sleep 1
        if check_server; then
            echo "✓ Server started successfully on port ${PORT}!"
            return 0
        fi
        echo -n "."
    done
    echo ""
    echo "✗ Server failed to start within 30 seconds"
    echo "Check logs at: $LOG_FILE"
    return 1
}

# Main execution
echo "=== Vader AI Orchestrator Server Restart ==="
echo ""

# Kill existing server
if check_server; then
    kill_server
    if [ $? -ne 0 ]; then
        echo "Error: Failed to stop existing server. Please check manually."
        exit 1
    fi
else
    echo "No existing server found on port ${PORT}."
fi

echo ""

# Start new server
start_server
if [ $? -eq 0 ]; then
    echo ""
    echo "=== Server Restart Complete ==="
    echo "Server is running at: http://localhost:${PORT}"
    echo "View logs: tail -f $LOG_FILE"
    
    # Show notification on macOS
    osascript -e "display notification \"Orchestrator server restarted on port ${PORT}\" with title \"Vader AI Orchestrator\"" 2>/dev/null || true
else
    echo ""
    echo "=== Server Restart Failed ==="
    echo "Check logs at: $LOG_FILE"
    osascript -e 'display notification "Failed to restart orchestrator server" with title "Vader AI Orchestrator"' 2>/dev/null || true
    exit 1
fi
