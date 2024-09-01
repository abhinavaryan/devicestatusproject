// Server-side: Node.js with Express and Socket.IO
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost/deviceStatus', { useNewUrlParser: true, useUnifiedTopology: true });

const deviceSchema = new mongoose.Schema({
    name: String,
    status: String
});

const Device = mongoose.model('Device', deviceSchema);

io.on('connection', (socket) => {
    console.log('New client connected');

    Device.find().then(devices => {
        socket.emit('updateDevices', devices);
    });

    socket.on('updateStatus', (device) => {
        Device.findByIdAndUpdate(device.id, { status: device.status }, { new: true })
            .then(updatedDevice => {
                io.emit('statusChanged', updatedDevice);
            });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
