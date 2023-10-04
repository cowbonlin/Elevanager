import React, { useContext, useState } from "react";
import { SocketContext } from "./context/socket";

const Panel = ({ printState }) => {
  const [moveElevatorFrom, setMoveElevatorFrom] = useState('');
  const [moveElevatorTo, setMoveElevatorTo] = useState('');
  const socket = useContext(SocketContext);
  const [onboardElevatorId, setOnboardElevatorId] = useState('0');
  const [onboardPassengerId, setOnboardPassengerId] = useState('0');
  
  const moveBtnClick = (elevatorId, toFloorId) => {
    socket.emit('moveElevator', elevatorId, toFloorId, (errorMessage, payload = null) => {
      console.warn('moveElevator', errorMessage, payload);
    });
  };
  
  const createPassenger = () => {
    const fromFloorInt = +moveElevatorFrom;
    const toFloorInt = +moveElevatorTo;
    if (!moveElevatorFrom || !moveElevatorTo || isNaN(fromFloorInt) || isNaN(toFloorInt)) {
      console.warn('Invalid input', moveElevatorFrom, moveElevatorTo);
      return;
    }
    if (fromFloorInt < 1 || fromFloorInt > 7 || toFloorInt < 1 || toFloorInt > 7) {
      console.warn('Input out of range', moveElevatorFrom, moveElevatorTo);
      return;
    }
    socket.emit('createPassenger', fromFloorInt, toFloorInt);
  };
  
  const clearPassengers = () => {
    socket.emit('clearPassengers');
  };
  
  const onBoardPassenger = () => {
    const elevatorId = +onboardElevatorId;
    const passengerId = +onboardPassengerId;
    if (!onboardElevatorId || !onboardPassengerId || isNaN(elevatorId) || isNaN(passengerId)) {
      console.warn('Invalid input', onboardElevatorId, onboardPassengerId);
      return;
    }
    socket.emit('onboard', elevatorId, passengerId, (errorMessage, ...payload) => {
      console.warn('onBoard error', errorMessage, payload);
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
      <input type="text" value={moveElevatorFrom} placeholder="Move elevator from" onChange={(e) => setMoveElevatorFrom(e.target.value)} />
      <input type="text" value={moveElevatorTo} placeholder="Move elevator to" onChange={(e) => setMoveElevatorTo(e.target.value)} />
      <button onClick={createPassenger}>Create Passenger</button>
      <hr />
      <button onClick={clearPassengers}>Clear Passengers</button>
      <hr />
      <input type="text" value={onboardElevatorId} placeholder="Elevator ID" onChange={(e) => setOnboardElevatorId(e.target.value)} />
      <input type="text" value={onboardPassengerId} placeholder="Passenger ID" onChange={(e) => setOnboardPassengerId(e.target.value)} />
      <button onClick={onBoardPassenger}>Onboard Passenger</button>
      <hr />
      <button onClick={printState}>Print states</button>
    </div>
  );
};

export default Panel;