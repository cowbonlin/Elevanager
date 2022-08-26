import React, { useEffect, useRef } from 'react';
import './App.css';

const floorToPx = (floor) => {
  return (7 - floor) * 90;
};

const getDuration = (fromFloor, toFloor) => {
  return Math.abs(fromFloor - toFloor) * 1;
}

const Elevator = ({ color, data }) => {
  // we use `useRef` to get updated whenever prop has changed
  const prevFloor = useRef();
  useEffect(() => {  
    setTimeout(() => {
      console.log('arrived!');
    }, getDuration(prevFloor.current, data.floor) * 1000);
    
    prevFloor.current = data.floor;
  }, [data]);
  
  const colorClass = (color === 'blue')? 'elevator--blue' : null;  
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${floorToPx(data.floor)}px)`,
          transitionDuration: `${getDuration(prevFloor.current, data.floor)}s`,
        }}
      >
          
      </div>
    </div>
  );
}

export default Elevator;