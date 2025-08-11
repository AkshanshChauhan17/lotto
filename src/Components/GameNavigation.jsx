import { Link } from "react-router-dom";
import { game_navigation } from "../data/navs";
import { useState } from "react";

const time = ["10", "14", "02"];

export default function GameNavigation() {
    const [select, setSelect] = useState(0);

    return <div className="game-navigation">
        <div className="left">
            <div className="game-type">Game</div>
            <div className="game-name">{ game_navigation[select]?.name }</div>
        </div>
        <div className="links">
            {
                game_navigation.map((e, i) => {
                    return <Link to={e?.url} key={i} style={{backgroundColor: select === i && e?.color, margin: select === i && "0px"}} className={select === i ? "link selected-link" : "link"} onClick={()=>setSelect(i)}>{e?.name}</Link>
                })
            }
        </div>
        <div className="right">
            <div className="title">Remaining time</div>
            <div className="time-ar">
                <div className="time-hr">{time[0]} <div className="text">h</div></div>
                <div className="time-mi">{time[1]} <div className="text">m</div></div>
                <div className="time-se">{time[2]} <div className="text">s</div></div>
            </div>
        </div>
    </div>
}