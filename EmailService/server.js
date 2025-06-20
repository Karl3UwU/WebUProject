const http = require('http');
const net = require('net');
const tls = require('tls');
const url = require('url');
const dotenv = require('./dotenv.js');

dotenv.loadEnv({ debug: true });

// --- Configuration ---
const serverConfig = {
  port: Number(process.env['SERVER_PORT']),
};

const smtpConfig = {
  host: process.env['SMTP_HOST'],
  port: Number(process.env['SMTP_PORT']),
  secure: process.env['SMTP_PROTOCOL'],
  user: process.env['SMTP_USER'],
  pass: process.env['SMTP_PASSWORD'],
};

// --- SMTP Client Functions ---
async function sendEmail(to, subject, message) {
  let socket;
  let isTlsActive = false;

  console.log(`Attempting to connect to ${smtpConfig.host}:${smtpConfig.port}...`);

  return new Promise((resolve, reject) => {
    const connectOptions = {
      host: smtpConfig.host,
      port: smtpConfig.port,
    };

    if (smtpConfig.secure === 'smtps') {
      socket = tls.connect(connectOptions, () => {
        isTlsActive = true;
        console.log('Connected via SMTPS (TLS).');
        handleConnection();
      });
    } else {
      socket = net.createConnection(connectOptions, () => {
        console.log('Connected via TCP.');
        handleConnection();
      });
    }

    let buffer = '';

    socket.on('data', (data) => {
      buffer += data.toString();
      while (buffer.includes('\r\n')) {
        const endOfLine = buffer.indexOf('\r\n');
        const line = buffer.substring(0, endOfLine);
        buffer = buffer.substring(endOfLine + 2);
        console.log(`S: ${line}`);
        handleServerResponse(line);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      reject(err);
      if (socket && !socket.destroyed) socket.destroy();
    });

    socket.on('close', () => {
      console.log('SMTP connection closed.');
    });

    socket.on('timeout', () => {
      console.error('Socket timeout');
      reject(new Error('Socket timeout'));
      if (socket && !socket.destroyed) socket.destroy();
    });
    socket.setTimeout(15000);

    let currentState = 'INIT';

    const sendCommand = (command, nextState, logData = true) => {
      if (logData) {
        console.log(`C: ${command}`);
      } else {
        console.log(`C: ${command.split(' ')[0]} ********`);
      }
      socket.write(`${command}\r\n`);
      currentState = nextState;
    };

    const handleConnection = () => {
      currentState = 'GREETING_EXPECTED';
    };

    const handleServerResponse = (line) => {
      const code = parseInt(line.substring(0, 3), 10);

      switch (currentState) {
        case 'GREETING_EXPECTED':
          if (code !== 220) {
            return reject(new Error(`Server greeting error: ${line}`));
          }
          sendCommand(`EHLO ${smtpConfig.host}`, 'EHLO_SENT');
          break;

        case 'EHLO_SENT':
          if (code !== 250) {
            return reject(new Error(`EHLO failed: ${line}`));
          }
          if (smtpConfig.secure === 'starttls' && !isTlsActive && line.toUpperCase().includes('STARTTLS')) {
            sendCommand('STARTTLS', 'STARTTLS_SENT');
          } else if (smtpConfig.user && smtpConfig.pass && line.toUpperCase().includes('AUTH LOGIN')) {
            sendCommand('AUTH LOGIN', 'AUTH_LOGIN_SENT');
          } else if (smtpConfig.user && smtpConfig.pass) {
            console.warn("Server doesn't explicitly offer AUTH LOGIN, but attempting anyway if credentials provided.");
            sendCommand('AUTH LOGIN', 'AUTH_LOGIN_SENT');
          } else {
            sendCommand(`MAIL FROM:<${smtpConfig.user}>`, 'MAIL_FROM_SENT');
          }
          break;

        case 'STARTTLS_SENT':
          if (code !== 220) {
            return reject(new Error(`STARTTLS failed: ${line}`));
          }
          console.log('Upgrading connection to TLS...');
          const tlsSocket = tls.connect({
            socket: socket,
            host: smtpConfig.host,
          }, () => {
            console.log('TLS handshake successful. Connection is now secure.');
            isTlsActive = true;
            sendCommand(`EHLO ${smtpConfig.host}`, 'EHLO_SENT');
          });

          tlsSocket.on('error', (tlsErr) => {
            console.error('TLS handshake error:', tlsErr);
            reject(tlsErr);
            if (socket && !socket.destroyed) socket.destroy();
          });
          break;

        case 'AUTH_LOGIN_SENT':
          if (code !== 334) {
            // return reject(new Error(`AUTH LOGIN initiation failed: ${line}`));
          }
          sendCommand(Buffer.from(smtpConfig.user).toString('base64'), 'USER_SENT', false);
          break;

        case 'USER_SENT':
          if (code !== 334) {
            // return reject(new Error(`Username not accepted: ${line}`));
          }
          sendCommand(Buffer.from(smtpConfig.pass).toString('base64'), 'PASS_SENT', false);
          break;

        case 'PASS_SENT':
          if (code !== 235) {
            // return reject(new Error(`Authentication failed: ${line}`));
          }
          console.log('Authentication successful.');
          sendCommand(`MAIL FROM:<${getEmailAddress(`"System" <${smtpConfig.user}>`).trim()}>`, 'MAIL_FROM_SENT');
          break;

        case 'MAIL_FROM_SENT':
          if (code !== 250) {
            return reject(new Error(`MAIL FROM failed: ${line}`));
          }
          sendCommand(`RCPT TO:<${getEmailAddress(to).trim()}>`, 'RCPT_TO_SENT');
          break;

        case 'RCPT_TO_SENT':
          if (code !== 250) {
            return reject(new Error(`RCPT TO failed: ${line}`));
          }
          sendCommand('DATA', 'DATA_SENT');
          break;

        case 'DATA_SENT':
          if (code !== 354) {
            // return reject(new Error(`DATA command failed: ${line}`));
          }
          console.log('Sending email body...');
          const boundary = `----=_Part_Boundary_${Math.random().toString(36).substring(2)}`;
          let emailData = `From: "System" <${smtpConfig.user}>\r\n`;
          emailData += `To: ${to}\r\n`;
          emailData += `Subject: ${subject}\r\n`;
          emailData += `MIME-Version: 1.0\r\n`;
          emailData += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

          emailData += `--${boundary}\r\n`;
          emailData += `Content-Type: text/plain; charset="utf-8"\r\n`;
          emailData += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
          emailData += `${message}\r\n\r\n`;

          emailData += `--${boundary}\r\n`;
          emailData += `Content-Type: text/html; charset="utf-8"\r\n`;
          emailData += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
          emailData += `<p>${message.replace(/\n/g, '<br>')}</p>\r\n\r\n`;

          emailData += `--${boundary}--\r\n`;
          emailData += `.\r\n`;

          socket.write(emailData);
          console.log('C: <Email Body Sent>');
          currentState = 'BODY_SENT';
          break;

        case 'BODY_SENT':
          if (code !== 250) {
            return reject(new Error(`Email sending failed after DATA: ${line}`));
          }
          console.log('Email accepted by server.');
          sendCommand('QUIT', 'QUIT_SENT');
          break;

        case 'QUIT_SENT':
          if (code !== 221) {
            console.warn(`QUIT command response not 221: ${line}`);
          }
          console.log('Email sent successfully!');
          if (socket && !socket.destroyed) socket.end();
          resolve('Email sent successfully!');
          break;

        default:
          console.warn(`Unhandled state: ${currentState} with response: ${line}`);
          reject(new Error(`Unhandled state: ${currentState}`));
          if (socket && !socket.destroyed) socket.destroy();
      }
    };
  });
}

function getEmailAddress(fullAddress) {
  const match = fullAddress.match(/<([^>]+)>/);
  return match ? match[1] : fullAddress;
}

// --- HTTP Server ---
async function parsePostData(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        if (body.length === 0) {
          reject(new Error('Empty request body'));
          return;
        }
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON: ' + error.message));
      }
    });

    req.on('error', reject);
  });
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendResponse(res, 200, { message: 'OK' });
    return;
  }

  // Handle POST to /send-email
  if (req.method === 'POST' && parsedUrl.pathname === '/send-email') {
    try {
      const { receiver, subject, message } = await parsePostData(req);

      // Validate required fields
      if (!receiver || !subject || !message) {
        sendResponse(res, 400, {
          error: 'Missing required fields',
          required: ['receiver', 'subject', 'message']
        });
        return;
      }

      console.log(`Sending email to: ${receiver}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

      await sendEmail(receiver, subject, message);

      console.log("HERE")

      sendResponse(res, 200, {
        success: true,
        message: 'Email sent successfully'
      });

    } catch (error) {
      console.error('Error sending email:', error.message);
      sendResponse(res, 500, {
        error: 'Failed to send email',
        details: error.message
      });
    }
  }
  // Handle GET to / for health check
  else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    sendResponse(res, 200, {
      status: 'running',
      endpoints: {
        'POST /send-email': 'Send an email (requires: receiver, subject, message)'
      }
    });
  }
  // Handle unknown routes
  else {
    sendResponse(res, 404, {
      error: 'Route not found',
      available: ['GET /', 'POST /send-email']
    });
  }
});

// Start server
server.listen(serverConfig.port, () => {
  console.log(`SMTP Email Server running on http://localhost:${serverConfig.port}`);
  console.log(`POST to /send-email with JSON: { "receiver": "email@example.com", "subject": "Subject", "message": "Your message" }`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});