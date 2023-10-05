import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { SocketContext, socket } from './context/socket';
import './App.css';
import Elevator from './Elevator';
import Panel from './Panel';

const App = () => {
  const [elevators, setElevators] = useState([
    {id: 0, fromFloorId: null, toFloorId: null, currentFloorId: 7, status: 'idle'},
    {id: 1, fromFloorId: null, toFloorId: null, currentFloorId: 7, status: 'idle'},
  ]);
  const [floors, setFloors] = useState(null);
  const [passengers, setPassengers] = useState({});
  const [score, setScore] = useState(0);
  const [isSocketIoConnected, setIsSocketIoConnected] = useState(false);
  
  console.debug('server connection:', isSocketIoConnected);
  
  const printState = () => {
    console.log('Elevators:', elevators);
    console.log('Passengers', passengers);
    console.log('Floors:', floors);
  };
  
  // useCallback to prevent duplicate binding from affecting performance
  const onConnect = useCallback(() => {
    setIsSocketIoConnected(true);
    socket.emit('init', (newElevators, newPassengers, newFloors) => { 
      console.log('Received init data', newElevators, newPassengers, newFloors);
      setElevators(newElevators);
      setPassengers(newPassengers);
      setFloors(newFloors);
    });
  }, []);
  
  const onDisconnect = useCallback(() => {
    setIsSocketIoConnected(false);
  }, []);
  
  const onMoveElevator = useCallback((elevatorId, toFloorId) => {
    setElevators(prevElevators => {
      const prevElevator = prevElevators[elevatorId];
      const newElevators = prevElevators.map((e) => e);
      newElevators[elevatorId] = { 
        ...newElevators[elevatorId], 
        status: 'moving',
        currentFloorId: null,
        fromFloorId: prevElevator.currentFloorId,
        toFloorId, 
      };
      return newElevators;
    });
  }, []);
  
  const onElevatorArrived = useCallback((elevatorId) => {
    setElevators(prevElevators => {
      const prevElevator = prevElevators[elevatorId];
      const newElevators = prevElevators.map((e) => e);
      newElevators[elevatorId] = {
        ...newElevators[elevatorId],
        status: 'idle',
        currentFloorId: prevElevator.toFloorId,
        fromFloorId: null,
        toFloorId: null,
      };
      return newElevators;
    });
  }, []);
  
  const onCreatePassenger = useCallback((passenger) => {
    setPassengers((prevPassengers) => ({
      ...prevPassengers,
      [passenger.id]: passenger,
    }));
    
    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      updatedFloors[passenger.departureFloorId].push(passenger.id);
      return updatedFloors;
    });
  }, []);
  
  const onClearPassengers = useCallback(() => {
    setFloors((prevFloors) => (
      Object.keys(prevFloors).reduce((acc, floorId) => (
        {...acc, [floorId]: []}
      ), {})
    ));
  }, []);
  
  const onOnboard = useCallback((elevatorId, floorId, passengerId) => {
    // Remove the passenger from the floor
    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      _.pull(updatedFloors[floorId], passengerId);
      return updatedFloors;
    });
    
    // Add the passenger to the elevator
    setElevators((prevElevators) => {
      const updatedElevators = [...prevElevators];
      updatedElevators[elevatorId].passengers.push(passengerId);
      return updatedElevators;
    });
  }, []);
  
  const onOffboard = useCallback((elevatorId, passengersToOffboard) => {
    // Remove passengers from elevator from passengersToOffboard
    setElevators((prevElevators) => {
      const updatedElevators = [...prevElevators];
      _.pullAll(
        updatedElevators[elevatorId].passengers,
        passengersToOffboard,
      );
      return updatedElevators;
    });
  }, []);
  
  const onUpdateScore = useCallback((score) => {
    setScore(score);
  }, []);
  
  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:
    socket.on('connect', onConnect);
    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, ...args);
    });
    socket.on('disconnect', onDisconnect);
    socket.on('moveElevator', (...args) => onMoveElevator(...args) );
    socket.on('createPassenger', (...args) => onCreatePassenger(...args));
    socket.on('clearPassengers', onClearPassengers);
    socket.on('onboard', (...args) => onOnboard(...args));
    socket.on('elevatorArrived', (...args) => onElevatorArrived(...args));
    socket.on('offboard', (...args) => onOffboard(...args));
    socket.on('updateScore', (...args) => onUpdateScore(...args));
    return () => {
      socket.off('connect', onConnect);
      socket.offAny();
      socket.off('disconnect', onDisconnect);
      socket.off('moveElevator', onMoveElevator);
      socket.off('createPassenger', onCreatePassenger);
      socket.off('clearPassengers', onClearPassengers);
      socket.off('onboard', onOnboard);
      socket.off('offboard', onOffboard);
      socket.off('updateScore', onUpdateScore);
    };
  }, [onConnect, onDisconnect, onMoveElevator, onCreatePassenger, onClearPassengers, onOnboard, onElevatorArrived]);
  
  
  
  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        
        <Panel printState={printState}/>
        <div className="building">
          <div className="floor-container">
            {_.range(7, 0, -1).map((i) => (
              <div key={i} className={`floor ${(i % 2)? null : "floor--no-color"}`}>
                <div>Passengers: {floors?.[i].length}</div>
                <div className="floor-passenger-list">{floors?.[i].map((passengerId) => passengerId + ', ')}</div>
              </div>
            ))}
          </div>

          <div className="ev-container">
            <Elevator elevator={elevators[0]} />
            <Elevator elevator={elevators[1]} color={'blue'} />
          </div>
        </div>
        <div className="gameStats">
          Score: {score}
        </div>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
