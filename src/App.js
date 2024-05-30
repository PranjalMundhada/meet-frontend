import "./App.css";
import { Routes, Route } from 'react-router-dom'
import Home from "./components/Home/Home.component";
import Room from "./components/Room/Room.component";
import Summary from "./components/Summary/Summary";

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/room/:roomId' element={<Room/>} />
        <Route path='/summary/:roomId' element={<Summary/>} />
      </Routes>
    </div>
  );
}

export default App;
