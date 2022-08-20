import { useState } from 'react';
import './App.css';
import Elevator from './Elevator';

const App = () => {
  const [evFloor, setEvFloor] = useState([7, 6]);
  
  const buttonClick = (ev, newFloor) => {
    setEvFloor(oldFloor => oldFloor.map((floor, i) => (i === ev) ? newFloor : floor) );
  }
  
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
