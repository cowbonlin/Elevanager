import React from 'react';
import './App.css';

const getElevatorPosition = (status, currentFloorId, toFloorId) => {
  if (status === 'idle') {
    return (7 - currentFloorId) * 90;
  }
  // When status is 'moving'
  return (7 - toFloorId) * 90;
};

const getTransitionDuration = (status, fromFloorId, toFloorId) => {
  if (status === 'moving') {
    return Math.abs(fromFloorId - toFloorId) * 1;
  }
  return null;
};

const Elevator = ({ color, elevator }) => {
  const { status, currentFloorId, fromFloorId, toFloorId, passengers } = elevator;
  
  const colorClass = (color === 'blue')? 'elevator--blue' : '';
  const duration = getTransitionDuration(status, fromFloorId, toFloorId);
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${getElevatorPosition(status, currentFloorId, toFloorId)}px)`,
          transitionDuration: duration && `${duration}s`,
        }}
      >
        {(passengers ?? []).map((p) => p.id + ' ')}
      </div>
    </div>
  );
}

export default Elevator;