import { Route, Routes } from "react-router-dom";
import "./App.scss";
import Navigation from "./Components/Navigation";
import Game from "./Pages/Game";
import BigDice from "./Components/Games/BigDice";
import { game_navigation } from "./data/navs";

function App() {
  return (
    <div className="main">
      <Navigation />
      <Routes>
        {
          game_navigation.map((e, i)=>{
            return <Route path={e.url} key={i} element={<Game />} />
          })
        }
      </Routes>
    </div>
  )
}

export default App
