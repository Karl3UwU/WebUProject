#!/bin/bash

PORT=4040

./deploy.sh

echo "Listening on port $PORT..."

socat TCP4-LISTEN:$PORT,reuseaddr,fork EXEC:"./handle_request.sh"
