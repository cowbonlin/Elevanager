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

const Elevator = ({ color, elevator, passengers }) => {
  const { status, currentFloorId, fromFloorId, toFloorId, passengerIds: elevatorPassengerIds } = elevator;
  
  const colorClass = (color === 'blue')? 'elevator--blue' : '';
  const duration = getTransitionDuration(status, fromFloorId, toFloorId);
  const destinationList = elevatorPassengerIds.map(
    (elevatorPassengerId) => passengers[elevatorPassengerId].destinationFloorId
  );
  return (
    <div className="ev-column">
      <div 
        className={`elevator ${colorClass}`} 
        style={{ 
          transform: `translateY(${getElevatorPosition(status, currentFloorId, toFloorId)}px)`,
          transitionDuration: duration && `${duration}s`,
        }}
      >
        {destinationList.join()}
      </div>
    </div>
  );
}

export default Elevator;