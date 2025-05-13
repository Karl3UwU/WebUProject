#!/bin/bash

# Exit on any error
set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
CLASS_DIR="$SCRIPT_DIR/target/classes"
WEB_FOLDER="$SCRIPT_DIR/target/web"

# Check if the web folder exists
if [ ! -d "$WEB_FOLDER" ]; then
    echo "The web folder does not exist: $WEB_FOLDER"
    exit 1
fi

cd "$CLASS_DIR"
echo "Starting the server..."
java WebServer "$WEB_FOLDER"
