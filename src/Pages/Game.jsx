import { useEffect, useState } from "react";
import GameNavigation from "../Components/GameNavigation";
import BigDice from "../Components/Games/BigDice";
import BigSix from "../Components/Games/BigSix";
import { game_matrix } from "../data/game_init";
import { useLocation } from "react-router-dom";
import BigMax from "../Components/Games/BigMax";
import BigFive from "../Components/Games/BigFive";

export default function Game() {
    const [betss, setBetss] = useState([]);
    const location = useLocation();
    const [currentLocation, setCurrentLocation] = useState();

    useEffect(() => {
        setCurrentLocation(location.pathname)
    }, [location])
    return <div className="game" style={{ backgroundImage: `url(${game_matrix[location.pathname.split("/")[2].replace("-", "_")]?.bg_img})` }}>
        <GameNavigation />
        {currentLocation === "/game/big-dice" && <BigDice bets={betss} setBets={setBetss} />}
        {currentLocation === "/game/big-six" && <BigSix bets={betss} setBets={setBetss} />}
        {currentLocation === "/game/big-max" && <BigMax bets={betss} setBets={setBetss} />}
        {currentLocation === "/game/big-five" && <BigFive bets={betss} setBets={setBetss} />}
    </div>
}