#!/bin/bash

# Exit on any error
set -e

SRC_DIR="src"
OUT_DIR="target"
CLASS_DIR="$OUT_DIR/classes"
WEB_DIR="web"
LIB_DIR="lib"

# Clean previous build
rm -rf "$OUT_DIR"
mkdir -p "$CLASS_DIR"

# Build classpath from all .jar files in lib/
CLASSPATH=$(find "$LIB_DIR" -name "*.jar" | paste -sd ":" -)

# Compile Java source files
echo "Compiling Java sources..."
if [ -n "$CLASSPATH" ]; then
  javac -cp "$CLASSPATH" -d "$CLASS_DIR" "$SRC_DIR"/javaServer/*.java
else
  javac -d "$CLASS_DIR" "$SRC_DIR"/javaServer/*.java
fi

# Copy static web files
echo "Copying web assets..."
cp -r "$WEB_DIR" "$OUT_DIR/"

echo "Build complete. Start server with ./server_start.sh"
