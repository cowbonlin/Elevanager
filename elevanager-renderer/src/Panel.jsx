import React, { useContext, useState } from "react";
import { SocketContext } from "./context/socket";

const Panel = ({ printState }) => {
  const [fromFloor, setFromFloor] = useState('');
  const [toFloor, setToFloor] = useState('');
  const socket = useContext(SocketContext);
  const [onboardEvId, setOnboardEvId] = useState('0');
  const [onboardPsId, setOnboardPsId] = useState('0');
  
  const moveBtnClick = (elevatorId, toFloorId) => {
    socket.emit('moveElevator', elevatorId, toFloorId, (errorMessage, payload = null) => {
      console.warn('moveElevator', errorMessage, payload);
    });
  };
  
  const createPassenger = () => {
    const fromFloorInt = +fromFloor;
    const toFloorInt = +toFloor;
    if (!fromFloor || !toFloor || isNaN(fromFloorInt) || isNaN(toFloorInt)) {
      console.warn('Invalid input', fromFloor, toFloor);
      return;
    }
    if (fromFloorInt < 1 || fromFloorInt > 7 || toFloorInt < 1 || toFloorInt > 7) {
      console.warn('Input out of range', fromFloor, toFloor);
      return;
    }
    socket.emit('createPassenger', fromFloorInt, toFloorInt);
  };
  
  const clearPassengers = () => {
    socket.emit('clearPassengers');
  };
  
  const onBoardPassenger = () => {
    const elevatorId = +onboardEvId;
    const passengerId = +onboardPsId;
    if (!onboardEvId || !onboardPsId || isNaN(elevatorId) || isNaN(passengerId)) {
      console.warn('Invalid input', onboardEvId, onboardPsId);
      return;
    }
    socket.emit('onboard', elevatorId, passengerId, (isSuc, message = '') => {
      console.log('Onboard:', isSuc, message);
    });
  };
  
  return (
    <div className="panel">
      <button onClick={() => moveBtnClick(0, 7)}>7</button>
      <button onClick={() => moveBtnClick(0, 6)}>6</button>
      <button onClick={() => moveBtnClick(0, 5)}>5</button>
      <button onClick={() => moveBtnClick(0, 4)}>4</button>
      <button onClick={() => moveBtnClick(0, 3)}>3</button>
      <button onClick={() => moveBtnClick(0, 2)}>2</button>
      <button onClick={() => moveBtnClick(0, 1)}>1</button>
      <hr />
      <button onClick={() => moveBtnClick(1, 7)}>7</button>
      <button onClick={() => moveBtnClick(1, 6)}>6</button>
      <button onClick={() => moveBtnClick(1, 5)}>5</button>
      <button onClick={() => moveBtnClick(1, 4)}>4</button>
      <button onClick={() => moveBtnClick(1, 3)}>3</button>
      <button onClick={() => moveBtnClick(1, 2)}>2</button>
      <button onClick={() => moveBtnClick(1, 1)}>1</button>
      <hr />
      <input type="text" value={fromFloor} placeholder="From" onChange={(e) => setFromFloor(e.target.value)} />
      <input type="text" value={toFloor} placeholder="To" onChange={(e) => setToFloor(e.target.value)} />
      <button onClick={createPassenger}>Create Passenger</button>
      <hr />
      <button onClick={clearPassengers}>Clear Passengers</button>
      <hr />
      <input type="text" value={onboardEvId} placeholder="Elevator ID" onChange={(e) => setOnboardEvId(e.target.value)} />
      <input type="text" value={onboardPsId} placeholder="Passenger ID" onChange={(e) => setOnboardPsId(e.target.value)} />
      <button onClick={onBoardPassenger}>Onboard Passenger</button>
      <hr />
      <button onClick={printState}>Print states</button>
    </div>
  );
};

export default Panel;