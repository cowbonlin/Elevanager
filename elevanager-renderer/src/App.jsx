import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { SocketContext, socket } from './context/socket';
import './App.css';
import Elevator from './Elevator';
import Panel from './Panel';

const App = () => {
  const [elevators, setElevators] = useState([
    { currentFloorId: 7 }, 
    { currentFloorId: 7 },
  ]);
  const [floors, setFloors] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  console.debug('server connection:', isConnected);
  
  const printState = () => {
    console.log('Elevators state:', elevators);
    console.log('Passengers state:', floors);
  };
  
  // useCallback to prevent duplicate binding from affecting performance
  const onConnect = useCallback(() => {
    setIsConnected(true);
    socket.emit('init', (newElevators, newPassengers) => { 
      setElevators(newElevators);
      setFloors(newPassengers);
    });
  }, []);
  
  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);
  
  const onMoveElevator = useCallback((eId, currentFloorId) => {
    setElevators((oldEs) => oldEs.map((e, i) => (i === eId) ? { ...e, currentFloorId } : e));
  }, []);
  
  const onCreatePassenger = useCallback((p) => {
    setFloors((oldPs) => ({
      ...oldPs,
      [p.from]: [...oldPs[p.from], p],
    }));
  }, []);
  
  const onClearPassengers = useCallback(() => {
    setFloors((oldPs) => (
      Object.keys(oldPs).reduce((acc, floor) => (
        {...acc, [floor]: []}
      ), {})
    ));
  }, []);
  
  const onOnboard = useCallback((eId, floor, passenger) => {
    // Remove the passenger from the floor
    setFloors((oldPs) => {
      const newPsAtFloor = _.filter(oldPs[floor], (p) => p.id !== passenger.id);
      return {
        ...oldPs,
        [floor]: newPsAtFloor,
      };
    });
    
    // Add the passenger to the elevator
    setElevators((oldEs) => {
      const newEs = oldEs.map((e) => e);
      newEs[eId].passengers.push(passenger);
      return newEs;
    });
  }, []);
  
  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('moveElevator', (...args) => onMoveElevator(...args) );
    socket.on('createPassenger', (...args) => onCreatePassenger(...args));
    socket.on('clearPassengers', onClearPassengers);
    socket.on('onboard', (...args) => onOnboard(...args));
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('moveElevator', onMoveElevator);
      socket.off('createPassenger', onCreatePassenger);
      socket.off('clearPassengers', onClearPassengers);
      socket.off('onboard', onOnboard);
    };
  }, [onConnect, onDisconnect, onMoveElevator, onCreatePassenger, onClearPassengers, onOnboard]);
  
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
            <Elevator id={0} data={elevators[0]} />
            <Elevator id={1} data={elevators[1]} color={'blue'} />
          </div>
        </div>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
