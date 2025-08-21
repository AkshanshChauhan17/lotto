import { useEffect, useState } from "react";
import GameNavigation from "../Components/GameNavigation";
import BigDice from "../Components/Games/BigDice";
import BigSix from "../Components/Games/BigSix";
import { game_matrix } from "../data/game_init";
import { useLocation } from "react-router-dom";
import BigMax from "../Components/Games/BigMax";
import BigFive from "../Components/Games/BigFive";
import { api } from "../Fx/api_connector";
import BestOfLuckPopup from "../Components/BestOfLuck";
import Pick2Game from "../Components/Games/PickTwo";
import Pick3Game from "../Components/Games/PickThree";

export default function Game({ cd, upNum }) {
    const [betss, setBetss] = useState([]);
    const location = useLocation();
    const [currentLocation, setCurrentLocation] = useState();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setCurrentLocation(location.pathname);
    }, [location]);

    const handleSubmit = (oP) => {
        api.post("/tickets", {
            "customer_id": localStorage.guid,
            "store_id": 1,
            "game_id": 1,
            "draw_id": null,
            "lines": betss.map(item => ({
                bet_type: item.bet_type,
                numbers: item.part.replace("P", ""),
                stake: item.amount
            })),
            "total_stake": betss.reduce((sum, item) => sum + item.amount, 0),
            "payment_method": "ACCOUNT_BALANCE"
        }, localStorage.token).then((e) => {
            oP();
            setBetss([]);
            setShow(true);
            upNum(Math.round(Math.random()*999999))
        }).catch((err) => { if (err) throw err });
    };

    const gameIndexMap = {
        "/game/lotto-dice": 0,
        "/game/lotto-six": 1,
        "/game/lotto-max": 2,
        "/game/lotto-five": 3,
    };

    const gameIndex = gameIndexMap[currentLocation] ?? 0;
    const gameKey = location.pathname.split("/")[2]?.replace("-", "_");
    const bgImg = game_matrix[gameIndex][gameKey]?.bg_img;

    return (
        <div className="game" style={{ backgroundImage: `url(${bgImg})` }}>
            <GameNavigation />
            {currentLocation === "/game/lotto-dice" && <BigDice cdd={cd} bets={betss} setBets={setBetss} hS={handleSubmit} />}
            {currentLocation === "/game/lotto-six" && <BigSix cdd={cd} bets={betss} setBets={setBetss} />}
            {currentLocation === "/game/lotto-max" && <BigMax cdd={cd} bets={betss} setBets={setBetss} />}
            {currentLocation === "/game/lotto-five" && <BigFive cdd={cd} bets={betss} setBets={setBetss} />}
            {currentLocation === "/game/pick-two" && <Pick2Game />}
            {currentLocation === "/game/pick-three" && <Pick3Game />}
            {show && <BestOfLuckPopup show={show} onClose={()=>setShow(false)} />}
        </div>
    );
}