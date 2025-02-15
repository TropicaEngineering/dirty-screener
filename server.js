const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });
const logFilePath = path.join(__dirname, 'server.log');

console.log("🚀 WebSocket Server running on ws://localhost:8080");

// ✅ Function to log online/offline status for Telegram bot
const logStatus = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

// ✅ Track if the WebSocket is online
let isServerOnline = false;

wss.on('connection', (ws) => {
    console.log("✅ Browser connected!");
    logStatus("✅ Data saved to dexscreener_data.json"); // Marks server as online
    isServerOnline = true;

    ws.on('message', (message) => {
        console.log("📡 Received data, saving...");
        fs.writeFileSync('dexscreener_data.json', message, 'utf8');
        console.log("✅ Data saved to dexscreener_data.json");
        logStatus("✅ Data saved to dexscreener_data.json");
    });

    ws.on('close', () => {
        console.log("❌ Browser disconnected.");
        if (isServerOnline) {
            logStatus("❌ Browser disconnected.");
            isServerOnline = false;
        }
    });

    ws.on('error', (error) => {
        console.error("⚠️ WebSocket Error:", error);
        logStatus("⚠️ WebSocket Error.");
    });
});