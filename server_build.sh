#!/bin/bash

# Exit on any error
set -e

SRC_DIR="src"
OUT_DIR="target"
CLASS_DIR="$OUT_DIR/classes"
WEB_DIR="web"

# Clean previous build
rm -rf "$OUT_DIR"
mkdir -p "$CLASS_DIR"

# Compile Java source files
echo "Compiling Java sources..."
javac -d "$CLASS_DIR" "$SRC_DIR"/javaServer/*.java

# Copy static web files
echo "Copying web assets..."
cp -r "$WEB_DIR" "$OUT_DIR/"
echo "Build complete. Start server with ./server_start.sh"
