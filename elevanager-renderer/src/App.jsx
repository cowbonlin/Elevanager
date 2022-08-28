import React, { useState, useEffect, useCallback } from 'react';
import { SocketContext, socket } from './context/socket';
import './App.css';
import Elevator from './Elevator';
import Panel from './Panel';

const App = () => {
  const [elevators, setElevators] = useState([{floor: 7}, {floor: 7}]);
  const [passengers, setPassengers] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  console.debug('server connection:', isConnected);
  
  // useCallback to prevent duplicate binding from affecting performance
  const onConnect = useCallback(() => {
    setIsConnected(true);
    socket.emit('init', (newElevators, newPassengers) => { 
      setElevators(newElevators);
      setPassengers(newPassengers);
    });
  }, []);
  
  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);
  
  const onMoveElevator = useCallback((eId, floor) => {
    setElevators((oldEs) => oldEs.map((e, i) => (i === eId) ? { ...e, floor } : e));
  }, []);
  
  const onCreatePassenger = useCallback((p) => {
    setPassengers((oldPs) => ({
      ...oldPs,
      [p.from]: [...oldPs[p.from], p],
    }));
  }, []);
  
  const onClearPassengers = useCallback(() => {
    setPassengers((oldPs) => (
      Object.keys(oldPs).reduce((acc, floor) => ({...acc, [floor]: []}), {})
    ));
  }, []);

  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('moveElevator', (eId, floor) => onMoveElevator(eId, floor) );
    socket.on('createPassenger', (passenger) => onCreatePassenger(passenger));
    socket.on('clearPassengers', onClearPassengers);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('moveElevator', onMoveElevator);
      socket.off('createPassenger', onCreatePassenger);
      socket.off('clearPassengers', onClearPassengers);
    };
  }, [onConnect, onDisconnect, onMoveElevator, onCreatePassenger, onClearPassengers]);
  
  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        
        <Panel />
        <div className="building">
          <div className="floor-container">
            <div className="floor">{passengers?.[7].length}</div>
            <div className="floor floor--no-color">{passengers?.[6].length}</div>
            <div className="floor">{passengers?.[5].length}</div>
            <div className="floor floor--no-color">{passengers?.[4].length}</div>
            <div className="floor">{passengers?.[3].length}</div>
            <div className="floor floor--no-color">{passengers?.[2].length}</div>
            <div className="floor">{passengers?.[1].length}</div>
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
