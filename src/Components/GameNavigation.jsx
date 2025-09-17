import { Link, useLocation } from "react-router-dom";
import { game_navigation } from "../data/navs";
import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function GameNavigation({tdOne, tdTwo, tdThree, tdFour}) {
  const location = useLocation();
  const [select, setSelect] = useState(0);
  const [remaining, setRemaining] = useState(Math.floor(DEFAULT_DURATION_MS / 1000));
  const timerRef = useRef(null);

  // Sync selected nav with URL
  useEffect(() => {
    const idx = game_navigation.findIndex(e =>
      location.pathname.startsWith(e.url)
    );
    setSelect(idx === -1 ? 0 : idx);
  }, [location]);

  // 🔄 Global countdown (same for all games)
  useEffect(() => {
    const storageKey = "global_countdown_target";

    // Get or create a global target time
    let target = parseInt(localStorage.getItem(storageKey), 10);
    if (!target || target <= Date.now()) {
      target = Date.now() + DEFAULT_DURATION_MS;
      localStorage.setItem(storageKey, String(target));
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const secs = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(timerRef.current);
        // Reset next round
        const next = Date.now() + DEFAULT_DURATION_MS;
        localStorage.setItem(storageKey, String(next));
        setRemaining(Math.floor(DEFAULT_DURATION_MS / 1000));
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => clearInterval(timerRef.current);
  }, []); // 👈 runs only once globally

  const hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <div className="game-navigation">
      <div className="left">
        <div className="game-type">Game</div>
        <div className="game-name">{game_navigation[select]?.name}</div>
      </div>

      <div className="links">
        {game_navigation.map((e, i) => (
          <Link
            to={e?.url}
            key={i}
            style={{
              backgroundColor: select === i ? e?.color : "",
              color: select === i ? e?.t_color : "",
              margin: select === i ? "0px" : "",
            }}
            className={select === i ? "link selected-link" : "link"}
            onClick={() => setSelect(i)}
          >
            {e?.name}
            {(e?.name === "Lotto Dice" && tdOne > 0) && <div className="bonus-nof">${tdOne}</div>}
            {(e?.name === "Lotto Six" && tdTwo > 0) && <div className="bonus-nof">${tdTwo}</div>}
            {(e?.name === "Lotto Max" && tdThree > 0) && <div className="bonus-nof">${tdThree}</div>}
            {(e?.name === "Lotto Five" && tdFour > 0) && <div className="bonus-nof">${tdFour}</div>}
          </Link>
        ))}
      </div>

      {tdOne} |
      {tdTwo} |
      {tdThree} |
      {tdFour}

      <div className="right">
        <div className="title">Remaining time</div>
        <div className="time-ar">
          <div className="time-hr">
            {hours} <div className="text">h</div>
          </div>
          <div className="time-mi">
            {minutes} <div className="text">m</div>
          </div>
          <div className="time-se">
            {seconds} <div className="text">s</div>
          </div>
        </div>
      </div>
    </div>
  );
}