import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Elevator from './Elevator';

const socket = io('http://localhost:3001');

const App = () => {
  const [evFloor, setEvFloor] = useState([7, 7]);
  
  const moveElevator = (ev, floor) => {
    setEvFloor((oldFloor) => oldFloor.map((f, i) => (i === ev) ? floor : f));
  }

  useEffect(() => {
    socket.on('connect', () => {
      console.log('server connection:', true);
      socket.emit('evInit', (response) => {
        setEvFloor(response);
      });
    });

    socket.on('disconnect', () => {
      console.log('server connection:', false);
    });
    
    socket.on('move', (ev, floor) => {
      moveElevator(ev, floor);
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('move');
    };
  }, [evFloor]);
  
  const buttonClick = (ev, newFloor) => {
    socket.emit('move', ev, newFloor);
  };
  
  return (
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
          <Elevator floor={evFloor[0]}/>
          <Elevator floor={evFloor[1]} color={'blue'} />
        </div>
      </div>
    </div>
  );
}

export default App;
