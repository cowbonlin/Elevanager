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
    this.direction = null; // null | up | down
    this.passengers = [];
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

const store = {
  elevators: [new Elevator(0), new Elevator(1)],
  passengers: Object.fromEntries(_.range(1, 8).map(i => [i, []])),
};
const p0 = new Passenger(6, 5);
store.passengers[6].push(p0);

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Elevanager Server</h1>');
});

io.on('connection', (socket) => {
  console.log('connected');
  
  socket.onAny((eventName, ...args) => {
    console.debug('LOG:', eventName, args);
  });
  
  socket.on('init', (callback) => {
    callback(store.elevators, store.passengers);
  });
  
  socket.on('moveElevator', (eId, floor) => {
    if (store.elevators[eId].floor === floor) {
      return;
    }
    store.elevators[eId].detination = floor;
    store.elevators[eId].status = 'moving';
    socket.emit('moveElevator', eId, floor);
  });
  
  socket.on('elevatorArrived', (eId) => {
    store.elevators[eId].floor = store.elevators[eId].detination;
    store.elevators[eId].status = 'locked';
    
    // todo: tell panel(client) of arrival
  });
  
  socket.on('createPassenger', (from, to) => {
    const passenger = new Passenger(from, to);
    store.passengers[from].push(passenger);
    socket.emit('createPassenger', passenger);
  });
  
  socket.on('clearPassengers', () => {
    Object.keys(store.passengers).forEach((floor) => {
      store.passengers[floor] = [];
    });
    socket.emit('clearPassengers');
  });
  
  // Todo: support multiple-people onboarding
  socket.on('onboard', (elevatorId, passengerId, callback) => {
    // check if elevator and passenger are in the same floor
    const floor = store.elevators[elevatorId]?.floor;
    if (!store.passengers[floor]?.some((p) => p.id === passengerId)) {
      callback(false, 'Unmatched floor');
      return;
    }
    
    // remove passenger from the waitlist and add it to the elevator
    // const passenger = _.remove(store.passengers[floor], (p) => p.id === passengerId)[0];
    const passenger = _.remove(store.passengers[floor], {id: passengerId})[0];
    store.elevators[elevatorId].passengers.push(passenger);
    console.log(store);
    console.log('Elevator', elevatorId, ': ', store.elevators[elevatorId].passengers.map((p) => p.id));
    
    socket.emit('onboard', elevatorId, floor, passenger);
    callback(true);
  });
  
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});