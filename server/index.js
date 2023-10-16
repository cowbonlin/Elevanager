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
    this.currentFloorId = 7;
    this.fromFloorId = null;
    this.toFloorId = null;
    this.status = 'idle'; // idle | locked (opening, opened, closing) | moving
    this.direction = null; // null | up | down
    this.passengerIds = [];
  }
};

let passenger_count = 0;
class Passenger {
  constructor(departureFloorId, destinationFloorId) {
    this.id = passenger_count;
    this.departureFloorId = departureFloorId;
    this.destinationFloorId = destinationFloorId;
    this.timestamp = new Date();
    this.status = 'waiting'; // waiting | moving | finished
    
    passenger_count++;
  }
};

const getTransitionDuration = (fromFloorId, toFloorId) => {
  return Math.abs(fromFloorId - toFloorId) * 1;
}


// floors: key is the int of each floor, starting from 1
// floors: value is a list of Passenger
const initStore = () => ({
  elevators: [new Elevator(0), new Elevator(1)],
  passengers: {},
  floors: Array.from({ length: 8 }, () => []),
  gameStats: {
    score: 0,
  },
});
let store = initStore();
const p0 = new Passenger(6, 5);
store.passengers[p0.id] = p0;
store.floors[p0.departureFloorId].push(p0.id);


app.get('/', (req, res) => {
  res.send('<h1>Welcome to Elevanager Server</h1>');
});

io.on('connection', (socket) => {
  console.log('connected');
  
  socket.onAny((eventName, ...args) => {
    console.debug('LOG:', eventName, args);
  });
  
  socket.on('init', (callback) => {
    callback(store.elevators, store.passengers, store.floors);
  });
  
  socket.on('moveElevator', (elevatorId, toFloorId, onError) => {
    const elevator = store.elevators[elevatorId];
    if (elevator.status !== 'idle') {
      onError('Elevator should be in idle', elevator);
      return;
    }
    
    if (elevator.currentFloorId === toFloorId) {
      onError('currentFloorId should not be same as toFloor', elevator);
      return;
    }
    
    elevator.status = 'moving';
    elevator.fromFloorId = elevator.currentFloorId;
    elevator.toFloorId = toFloorId;
    elevator.currentFloorId = null;
    socket.emit('moveElevator', elevator.id, elevator.toFloorId);
    
    setTimeout(() => {
      onElevatorArrived(elevator);
    }, getTransitionDuration(elevator.fromFloorId, elevator.toFloorId) * 1000);
  });
  
  socket.on('resetServer', () => {
    store = initStore();
    socket.emit('resetServer', store.elevators, store.passengers, store.floors, store.gameStats);
  });
  
  socket.on('createPassenger', (departureFloorId, destinationFloorId) => {
    const passenger = new Passenger(departureFloorId, destinationFloorId);
    store.passengers[passenger.id] = passenger;
    store.floors[departureFloorId].push(passenger.id);
    socket.emit('createPassenger', passenger);
  });
  
  socket.on('clearPassengers', () => {
    Object.keys(store.floors).forEach((floorId) => {
      store.floors[floorId] = [];
    });
    socket.emit('clearPassengers');
  });
  
  // TODO: support multiple-people onboarding
  socket.on('onboard', (elevatorId, passengerId, onError) => {
    const elevator = store.elevators[elevatorId];
    
    const passenger = store.passengers[passengerId];
    if (passenger === undefined) {
      onError('Passenger not found', passengerId, store.passengers);
      return;
    }
    
    if (elevator.status !== 'idle') {
      onError('Elevator should be idle', elevator);
      return;
    }
    
    if (!store.floors[elevator.currentFloorId].some((pId) => pId === passengerId)) {
      onError('Passenger not found in elevator current floor', elevator.currentFloorId, store.floors[elevator.currentFloorId]);
      return;
    }
    
    // Remove passenger from the floor
    _.pull(store.floors[elevator.currentFloorId], passenger.id);
    
    // Add passenger to the elevator
    elevator.passengerIds.push(passenger.id);
    
    socket.emit('onboard', elevatorId, elevator.currentFloorId, passenger.id);
  });
  
  const onElevatorArrived = (elevator) => {
    console.log(`LOG: Elevator ${elevator.id} arrived at ${elevator.toFloorId}`);

    elevator.status = 'idle';
    elevator.currentFloorId = elevator.toFloorId;
    elevator.fromFloorId = null;
    elevator.toFloorId = null;
    socket.emit('elevatorArrived', elevator.id);
    
    offboard(elevator);
  };
  
  const offboard = (elevator) => {
    if (elevator.status !== 'idle') {
      console.warn("Elevator should be in idle when offboarding");
      return;
    }
    
    // Remove passengers from elevator who arrive at their destination
    const passengersToOffboard = _.remove(
      elevator.passengerIds, 
      (passengerId) => {
        const passenger = store.passengers[passengerId];
        return passenger.destinationFloorId == elevator.currentFloorId;
      }
    );
    
    // TODO: maybe remove arrived passengers from store.passengers?
    
    if (passengersToOffboard.length > 0) {
      store.gameStats.score += passengersToOffboard.length;
      socket.emit('offboard', elevator.id, passengersToOffboard);
      socket.emit('updateScore', store.gameStats.score);
    }
  };
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});