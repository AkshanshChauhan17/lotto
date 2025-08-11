import { Route, Routes } from "react-router-dom";
import "./App.scss";
import Navigation from "./Components/Navigation";
import Game from "./Pages/Game";
import BigDice from "./Components/Games/BigDice";

function App() {
  return (
    <div className="main">
      <Navigation />
      <Game />
      <Routes>
        <Route path="/game/big-dice" element={<BigDice />} />
      </Routes>
    </div>
  )
}

export default App
