const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const _ = require('lodash');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

class Elevator {
  constructor(id) {
    this.id = id;
    this.floor = 7;
    this.detination = 7;
    this.status = 'idle'; // idle | locked(opening, opened, closing) | moving
  }
};

let passenger_count = 0;
class Passenger {
  constructor(from, to) {
    this.id = passenger_count;
    this.from = from;
    this.to = to;
    this.timestamp = new Date();
    this.status = 'waiting'; // waiting | moving | finished
    
    passenger_count++;
  }
};

const elevators = [new Elevator(0), new Elevator(1)];
const passengers = Object.fromEntries(
  _.range(1, 8).map(i => [i, []])
);

const passenger1 = new Passenger(2, 5);
passengers[2].push(passenger1);

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Elevanager Server</h1>');
});

io.on('connection', (socket) => {
  console.log('connected');
  
  socket.onAny((eventName, ...args) => {
    console.debug('LOG:', eventName, args);
  });
  
  socket.on('init', (callback) => {
    callback(elevators, passengers);
  });
  
  socket.on('moveElevator', (eId, floor) => {
    elevators[eId].detination = floor;
    elevators[eId].status = 'moving';
    socket.emit('moveElevator', eId, floor);
  });
  
  socket.on('elevatorArrived', (eId) => {
    elevators[eId].floor = elevators[eId].detination;
    elevators[eId].status = 'locked';
  });
  
  socket.on('createPassenger', (from, to) => {
    const passenger = new Passenger(from, to);
    passengers[from].push(passenger);
    socket.emit('createPassenger', passenger);
  });
  
  socket.on('clearPassengers', () => {
    Object.keys(passengers).forEach((floor) => {
      passengers[floor] = [];
    });
    socket.emit('clearPassengers');
  });
  
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});