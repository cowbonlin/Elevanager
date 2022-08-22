import React, { useEffect, useRef } from 'react';
import './App.css';

const floorToPx = (floor) => {
  return (7 - floor) * 90;
}

const Elevator = ({ color, floor }) => {
  const prevFloor = useRef();
  useEffect(() => {
    prevFloor.current = floor;
  }, [floor]);
  
  
  const duration = Math.abs(prevFloor.current - floor);
  const colorClass = (color === 'blue')? 'elevator--blue' : null;  
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${floorToPx(floor)}px)`,
          transitionDuration: `${duration}s`,
        }}
      >
          
      </div>
    </div>
  );
}

export default Elevator;