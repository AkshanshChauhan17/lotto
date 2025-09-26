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
import { CgClose } from "react-icons/cg";
import { toast } from "react-toastify";

export default function Game({ cd, upNum }) {
    const [betss, setBetss] = useState([]);
    const location = useLocation();
    const [currentLocation, setCurrentLocation] = useState();
    const [show, setShow] = useState(false);
    const [bonusOpen, setBonusOpen] = useState(true);
    const [openBa, setOpenBa] = useState(false);
    const [totalDiscountOne, setTotalDiscountOne] = useState(0);
    const [totalDiscountTwo, setTotalDiscountTwo] = useState(0);
    const [totalDiscountThree, setTotalDiscountThree] = useState(0);
    const [totalDiscountFour, setTotalDiscountFour] = useState(0);
    const [destroyy, setDestroyy] = useState(1);

    useEffect(() => {
        setCurrentLocation(location.pathname);
    }, [location]);

    const handleSubmit = (oP) => {
        api.post("/tickets", {
            "id": localStorage.guid,
            "customer_id": localStorage.guid,
            "store_id": 1,
            "game_id": 1,
            "draw_id": null,
            "staff_id": null,
            "lines": betss.map(item => ({
                bet_type: item.bet_type,
                numbers: item.numbers,
                stake: item.amount,
                bonus: item.bonus,
                addToWin: item.addToWinningAmount,
                freePlay: item.freePlay,
                discount: parseFloat(totalDiscountOne) + parseFloat(totalDiscountTwo) + parseFloat(totalDiscountThree) + parseFloat(totalDiscountFour)
            })),
            "total_stake": betss.reduce((sum, item) => sum + item.amount, 0),
            "payment_method": "ACCOUNT_BALANCE",
        }, localStorage.token).then((e) => {
            oP();
            setBetss([]);
            setShow(true);
            upNum(Math.round(Math.random() * 999999))
            setDestroyy(Math.round(Math.random() * 999999))
            setTotalDiscountOne(0);
            setTotalDiscountTwo(0);
            setTotalDiscountThree(0);
            setTotalDiscountFour(0);
        }).catch((err) => toast.error("Something Went Wrong!!!", { onClick: () => window.open() }));
    };

    const gameIndexMap = {
        "/game/lotto-dice": 0,
        "/game/lotto-six": 1,
        "/game/lotto-max": 2,
        "/game/lotto-five": 3
    };

    const gameIndex = gameIndexMap[currentLocation] ?? 0;
    const gameKey = location.pathname.split("/")[2]?.replace("-", "_");
    const bgImg = game_matrix[gameIndex][gameKey]?.bg_img;

    return (
        <div className="game" style={{ backgroundImage: `url(${bgImg})` }}>
            <GameNavigation tdOne={totalDiscountOne} tdTwo={totalDiscountTwo} tdThree={totalDiscountThree} tdFour={totalDiscountFour} />
            {cd?.bonus_amount && bonusOpen ? (
                <div className="pop-up-bonus">
                    <div className="bonus-card">
                        <div className="close-button" onClick={() => setBonusOpen(false)}>
                            <CgClose />
                        </div>
                        <div className="heading">Bonus Play</div>
                        <div className="subheading">You have ${cd?.bonus_amount} Bonus Balance</div>
                        <div className="instructions">
                            <p>
                                💡 Want to see how it works? Tap on the <strong onClick={() => setOpenBa(true)}>"BONUS AMOUNT"</strong> text above to take a quick guided tour.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {currentLocation === "/game/lotto-dice" && <BigDice cdd={cd} bets={betss} setBets={setBetss} hS={handleSubmit} tDes={totalDiscountOne} tDesDef={setTotalDiscountOne} destroy={destroyy} />}
            {currentLocation === "/game/lotto-six" && <BigSix cdd={cd} bets={betss} setBets={setBetss} hS={handleSubmit} tDes={totalDiscountTwo} tDesDef={setTotalDiscountTwo} destroy={destroyy} />}
            {currentLocation === "/game/lotto-max" && <BigMax cdd={cd} bets={betss} setBets={setBetss} hS={handleSubmit} tDes={totalDiscountThree} tDesDef={setTotalDiscountThree} destroy={destroyy} />}
            {currentLocation === "/game/lotto-five" && <BigFive cdd={cd} bets={betss} setBets={setBetss} hS={handleSubmit} tDes={totalDiscountFour} tDesDef={setTotalDiscountFour} destroy={destroyy} />}
            {currentLocation === "/game/pick-two" && <Pick2Game />}
            {currentLocation === "/game/pick-three" && <Pick3Game />}
            {show && <BestOfLuckPopup show={show} onClose={() => setShow(false)} />}
        </div>
    );
}