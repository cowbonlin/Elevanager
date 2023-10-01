import React, { useEffect, useRef, useContext } from 'react';
import { SocketContext } from './context/socket';
import './App.css';

const floorToPx = (floor) => {
  return (7 - floor) * 90;
};

const getDuration = (fromFloor, toFloor) => {
  return Math.abs(fromFloor - toFloor) * 1;
}

const Elevator = ({ id, color, data }) => {
  const socket = useContext(SocketContext);
  
  // `useRef` is used to store current information including floor...
  const prevFloor = useRef();
  useEffect(() => {  
    setTimeout(() => {
      console.log(`Elevator ${id} arrived at ${data.currentFloorId}`);
      socket.emit('elevatorArrived', id);
    }, getDuration(prevFloor.current, data.currentFloorId) * 1000);
    
    prevFloor.current = data.currentFloorId;
  }, [data, id, socket]);
  
  const colorClass = (color === 'blue')? 'elevator--blue' : '';  
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${floorToPx(data.currentFloorId)}px)`,
          transitionDuration: `${getDuration(prevFloor.current, data.currentFloorId)}s`,
        }}
      >
        {(data.passengers ?? []).map((p) => p.id + ' ')}
      </div>
    </div>
  );
}

export default Elevator;