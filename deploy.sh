#!/bin/bash

SERVER_PATH="BOWServer/"

# absolute path for current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $SCRIPT_DIR

# Kill existing Java process running org.server.Main
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows: kill all java.exe processes
  taskkill -F -IM java.exe
else
  # Linux/Unix: kill all java processes on port 80
  sudo fuser -k 80/tcp
fi

# Pull latest changes
echo "Pulling latest code from Git..."
git pull

cd $SERVER_PATH || {
  echo "BOWServer directory not found!"
  exit 1
}

# Clean and package the project using Maven
echo "Running full Maven build (clean package)..."
mvn clean package

# If Maven build fails, exit
if [[ $? -ne 0 ]]; then
    echo "Maven build failed. Aborting."
    exit 1
fi

# Start the server
echo "Starting Java server..."
( java -cp target/BOWServer-1.0-SNAPSHOT-jar-with-dependencies.jar org.server.Main & )
echo "Java server started with PID $!"