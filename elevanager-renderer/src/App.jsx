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
  const [isSocketIoConnected, setIsSocketIoConnected] = useState(false);
  
  console.debug('server connection:', isSocketIoConnected);
  
  const printState = () => {
    console.log('Elevators state:', elevators);
    console.log('Passengers state:', floors);
  };
  
  // useCallback to prevent duplicate binding from affecting performance
  const onConnect = useCallback(() => {
    setIsSocketIoConnected(true);
    socket.emit('init', (newElevators, newFloors) => { 
      console.log('Received init data', newElevators, newFloors);
      setElevators(newElevators);
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
    setFloors((prevFloors) => ({
      ...prevFloors,
      [passenger.from]: [...prevFloors[passenger.from], passenger],
    }));
  }, []);
  
  const onClearPassengers = useCallback(() => {
    setFloors((prevFloors) => (
      Object.keys(prevFloors).reduce((acc, floorId) => (
        {...acc, [floorId]: []}
      ), {})
    ));
  }, []);
  
  const onOnboard = useCallback((elevatorId, floorId, passenger) => {
    // Remove the passenger from the floor
    setFloors((prevFloors) => {
      const newFloor = _.filter(prevFloors[floorId], (p) => p.id !== passenger.id);
      return {
        ...prevFloors,
        [floorId]: newFloor,
      };
    });
    
    // Add the passenger to the elevator
    setElevators((prevElevators) => {
      const newElevators = prevElevators.map((elevator) => elevator);
      newElevators[elevatorId].passengers.push(passenger);
      return newElevators;
    });
  }, []);
  
  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:
    socket.on('connect', onConnect);
    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, args);
    });
    socket.on('disconnect', onDisconnect);
    socket.on('moveElevator', (...args) => onMoveElevator(...args) );
    socket.on('createPassenger', (...args) => onCreatePassenger(...args));
    socket.on('clearPassengers', onClearPassengers);
    socket.on('onboard', (...args) => onOnboard(...args));
    socket.on('elevatorArrived', (...args) => onElevatorArrived(...args));
    return () => {
      socket.off('connect', onConnect);
      socket.offAny();
      socket.off('disconnect', onDisconnect);
      socket.off('moveElevator', onMoveElevator);
      socket.off('createPassenger', onCreatePassenger);
      socket.off('clearPassengers', onClearPassengers);
      socket.off('onboard', onOnboard);
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
                <div>{floors?.[i].length}</div>
                <div className="floor-passenger-list">{floors?.[i].map((p) => p.id + ', ')}</div>
              </div>
            ))}
          </div>

          <div className="ev-container">
            <Elevator elevator={elevators[0]} />
            <Elevator elevator={elevators[1]} color={'blue'} />
          </div>
        </div>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
