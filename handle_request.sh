#!/bin/bash

# Load environment variables from .env + get password
PASSWORD=$(grep '^DEPLOY_PASS=' "$(dirname "$0")/.env" | cut -d '=' -f2-)

# Read HTTP request (first line only, e.g., POST /hook?password=supersecret HTTP/1.1)
read request_line

# Parse the method and path
method=$(echo "$request_line" | cut -d' ' -f1)
url=$(echo "$request_line" | cut -d' ' -f2)

# Extract the query string (everything after '?')
query_string="${url#*\?}"

# Extract the 'password' parameter value
received_password=$(echo "$query_string" | sed -n 's/.*password=\([^& ]*\).*/\1/p')

# Validate
if [[ "$method" == "POST" && "$received_password" == "$PASSWORD" ]]; then
    echo "[$(date)] Authorized request, running deploy.sh" >> deploy.log
    ./deploy.sh >> deploy.log 2>&1
    response="Deployment triggered"
else
    echo "[$(date)] Unauthorized request: password='$received_password'" >> deploy.log
    response="Unauthorized"
fi

# Send HTTP response
echo -e "HTTP/1.1 200 OK\r"
echo -e "Content-Type: text/plain\r"
echo -e "Content-Length: ${#response}\r"
echo -e "\r"
echo -e "$response"
