const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

evFloor = [7, 7];

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Elevanager Server</h1>');
});

io.on('connection', (socket) => {
  console.log('connected');
  
  socket.on('disconnect', () => {
    console.log('disconnected');
  });
  
  socket.on('evInit', (callback) => {
    callback(evFloor);
  });
  
  socket.on('move', (ev, floor) => {
    evFloor[ev] = floor;
    socket.emit('move', ev, floor);
  })
  
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});