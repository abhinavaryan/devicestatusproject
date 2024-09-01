const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost/deviceStatus', { useNewUrlParser: true, useUnifiedTopology: true });

const deviceSchema = new mongoose.Schema({
    name: String,
    status: String,
});

const Device = mongoose.model('Device', deviceSchema);

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    const sendStatusUpdate = async () => {
        const devices = await Device.find();
        ws.send(JSON.stringify(devices));
    };

    const interval = setInterval(sendStatusUpdate, 5000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

app.post('/updateDevice', async (req, res) => {
    const { name, status } = req.body;
    await Device.updateOne({ name }, { status }, { upsert: true });
    res.sendStatus(200);
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
