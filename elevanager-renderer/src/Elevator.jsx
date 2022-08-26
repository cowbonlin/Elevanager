import React, { useEffect, useRef } from 'react';
import './App.css';

const floorToPx = (floor) => {
  return (7 - floor) * 90;
}

const Elevator = ({ color, data }) => {
  const prevFloor = useRef();
  useEffect(() => {  // get updated whenever prop has changed
    prevFloor.current = data.floor;
  }, [data]);
  
  
  const duration = Math.abs(prevFloor.current - data.floor);
  const colorClass = (color === 'blue')? 'elevator--blue' : null;  
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${floorToPx(data.floor)}px)`,
          transitionDuration: `${duration}s`,
        }}
      >
          
      </div>
    </div>
  );
}

export default Elevator;