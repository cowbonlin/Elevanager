import React, { useState, useEffect, useCallback } from 'react';
import { SocketContext, socket } from './context/socket';
import './App.css';
import Elevator from './Elevator';

const App = () => {
  const [elevators, setElevators] = useState([{floor: 7}, {floor: 7}]);
  const [isConnected, setIsConnected] = useState(false);
  
  console.debug('server connection:', isConnected);
  
  // useCallback to prevent duplicate binding from affecting performance
  const onConnect = useCallback(() => {
    setIsConnected(true);
    socket.emit('initElevators', (elevators) => { setElevators(elevators); });
  }, []);
  
  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);
  
  const onElevatorMove = useCallback((eId, floor) => {
    setElevators((oldElevators) => oldElevators.map((e, i) => (i === eId) ? { ...e, floor } : e));
  }, []);

  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('elevatorMove', (eId, floor) => onElevatorMove(eId, floor) );
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('elevatorMove', onElevatorMove);
    };
  }, []);
  
  const buttonClick = (ev, newFloor) => {
    socket.emit('elevatorMove', ev, newFloor);
    // set timeout to tell server of arrival
  };
  
  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        <div className="buttons">
          <button onClick={() => buttonClick(0, 7)}>7</button>
          <button onClick={() => buttonClick(0, 6)}>6</button>
          <button onClick={() => buttonClick(0, 5)}>5</button>
          <button onClick={() => buttonClick(0, 4)}>4</button>
          <button onClick={() => buttonClick(0, 3)}>3</button>
          <button onClick={() => buttonClick(0, 2)}>2</button>
          <button onClick={() => buttonClick(0, 1)}>1</button>
          <hr />
          <button onClick={() => buttonClick(1, 7)}>7</button>
          <button onClick={() => buttonClick(1, 6)}>6</button>
          <button onClick={() => buttonClick(1, 5)}>5</button>
          <button onClick={() => buttonClick(1, 4)}>4</button>
          <button onClick={() => buttonClick(1, 3)}>3</button>
          <button onClick={() => buttonClick(1, 2)}>2</button>
          <button onClick={() => buttonClick(1, 1)}>1</button>
        </div>

        <div className="building">
          <div className="floor-container">
            <div className="floor"></div>
            <div className="floor floor--no-color"></div>
            <div className="floor"></div>
            <div className="floor floor--no-color"></div>
            <div className="floor"></div>
            <div className="floor floor--no-color"></div>
            <div className="floor"></div>
          </div>

          <div className="ev-container">
            <Elevator data={elevators[0]} />
            <Elevator data={elevators[1]} color={'blue'} />
          </div>
        </div>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
