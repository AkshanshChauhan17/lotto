import { useState } from "react";
import { game_matrix } from "../../data/game_init";
import { AiFillDelete } from "react-icons/ai";
import { PiEmpty } from "react-icons/pi";
import LiveTime from "../Time/LiveTime";
import PopUpBlast from "../Animations/PopUpBlast";
import { toast } from "react-toastify";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export default function BigMax({ bets, setBets, cdd, hS }) {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [tempBetData, setTempBetData] = useState(null);
  const [price, setPrice] = useState(1);
  const [popup, setPopup] = useState(false);

  // ✅ Bet rules (BigMax may have larger sets than Dice, adjust as needed)
  const betRules = {
    C1: { min: 1, max: 10 },
    C2: { min: 2, max: 10 },
    C3: { min: 3, max: 10 },
    C4: { min: 4, max: 10 },
    "C2+C3": { min: 3, max: 10 },
    PICK2: { min: 2, max: 10 },
    PICK3: { min: 3, max: 10 },
    BONUS: { min: 1, max: 1 },
    JACKPOT: { min: 5, max: 5 },
  };

  const autoSelect = (count) => {
    const allNums = range(
      game_matrix[2].lotto_max.clickable_numbers[0],
      game_matrix[2].lotto_max.clickable_numbers[1]
    );
    const shuffled = allNums.sort(() => 0.5 - Math.random());
    setSelectedNumbers(shuffled.slice(0, count));
  };


  const handleBetTypeClick = (game_name, bet_type) => {
    if (bets.length >= 10) {
      alert("Cart is full. You can only have 10 bets.");
      return;
    }

    if (selectedNumbers.length === 0) {
      alert("Please select at least one number before choosing a bet type.");
      return;
    }

    // Check rules
    if (bet_type in betRules) {
      const rule = betRules[bet_type];
      if (selectedNumbers.length < rule.min || selectedNumbers.length > rule.max) {
        alert(`For ${bet_type}, you must select between ${rule.min} and ${rule.max} numbers.`);
        return;
      }
    }

    // ✅ Directly add JACKPOT bet (no second click needed)
    if (bet_type === "JACKPOT") {
      const newBet = {
        date: new Date().toLocaleString("en-GB"),
        ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
        game_name,
        bet_type,
        numbers: [...selectedNumbers],
        amount: 2,       // fixed $2
        bonus: false,
      };

      setBets(prev => [...prev, newBet]);
      setSelectedNumbers([]);
      return;
    }

    // Normal flow for other bets
    setTempBetData({ game_name, bet_type });
    setPrice(1);
    setShowPricePopup(true);
  };

  const confirmBet = () => {
    if (!tempBetData) return;

    const { game_name, bet_type } = tempBetData;

    if (bet_type === "C2+C3") {
      const lineCountC2 = calculateLines(selectedNumbers, "C2");
      const lineCountC3 = calculateLines(selectedNumbers, "C3");

      // Split price into 2 equal parts (for C2 and C3)
      const halfPrice = price / 2;

      // --- Validate C2 ---
      if (lineCountC2 > 0) {
        const minPriceC2 = lineCountC2 * 0.5; // each line ≥ 0.5
        if (halfPrice < minPriceC2) {
          toast.error(
            `For C2 (${lineCountC2} lines), minimum price is $${minPriceC2}`
          );
          return;
        }
      }

      // --- Validate C3 ---
      if (lineCountC3 > 0) {
        const minPriceC3 = lineCountC3 * 0.5; // each line ≥ 0.5
        if (halfPrice < minPriceC3) {
          toast.error(
            `For C3 (${lineCountC3} lines), minimum price is $${minPriceC3}`
          );
          return;
        }
      }

      // ✅ Passed validations → Add both bets
      if (lineCountC2 > 0) {
        setBets(prev => [
          ...prev,
          {
            date: new Date().toLocaleString("en-GB"),
            ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
            game_name,
            bet_type: "C2",
            numbers: [...selectedNumbers],
            amount: halfPrice,
            bonus: false,
          }
        ]);
      }

      if (lineCountC3 > 0) {
        setBets(prev => [
          ...prev,
          {
            date: new Date().toLocaleString("en-GB"),
            ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
            game_name,
            bet_type: "C3",
            numbers: [...selectedNumbers],
            amount: halfPrice,
            bonus: false,
          }
        ]);
      }

      setShowPricePopup(false);
      setTempBetData(null);
      setSelectedNumbers([]);
      return;
    }

    // ✅ Normal case (all other bet types)
    const lineCount = calculateLines(selectedNumbers, bet_type);

    if (lineCount === 1 && price < 1) {
      toast.error("For 1 line, minimum bet is $1");
      return;
    }

    if (lineCount >= 3) {
      let rawAmount = lineCount * 0.5;
      let rounded = Math.ceil(rawAmount);
      if (rounded % 2 !== 0) rounded += 1;
      if (price < rounded) {
        toast.error(`For ${lineCount} lines, minimum price is $${rounded}`);
        return;
      }
    }

    const newBet = {
      date: new Date().toLocaleString("en-GB"),
      ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
      game_name,
      bet_type,
      numbers: [...selectedNumbers],
      amount: price,
      bonus: false,
    };

    setBets(prev => [...prev, newBet]);
    setShowPricePopup(false);
    setTempBetData(null);
    setSelectedNumbers([]);
  };


  const confirmBetBon = () => {
    if (!tempBetData) return;

    const { game_name, bet_type } = tempBetData;
    const lineCount = calculateLines(selectedNumbers, bet_type);
    const bonusAmount = parseFloat(cdd.bonus_amount);

    if (lineCount === 1 && bonusAmount < 1) {
      toast.error("For 1 line, minimum bet is $1");
      return;
    }

    if (lineCount >= 3) {
      let rawAmount = lineCount * 0.5;
      let rounded = Math.ceil(rawAmount);

      if (rounded % 2 !== 0) {
        rounded += 1;
      }

      if (bonusAmount < rounded) {
        toast.error(`For ${lineCount} lines, minimum bonus is $${rounded}`);
        return;
      }
    }

    const newBet = {
      date: new Date().toLocaleString("en-GB"),
      ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
      game_name,
      bet_type,
      numbers: [...selectedNumbers],
      amount: bonusAmount,
      bonus: true,
    };

    setBets(prev => [...prev, newBet]);
    setShowPricePopup(false);
    setTempBetData(null);
    setSelectedNumbers([]);
  };


  const cancelBet = () => {
    setTempBetData(null);
    setPrice(1);
    setShowPricePopup(false);
    setSelectedNumbers([]);
  };

  const removeBet = (index) => {
    setBets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelect = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 12) {
        alert("You can only select up to 12 numbers.");
        return;
      }
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleCancel = () => setSelectedNumbers([]);

  const openPop = () => {
    setPopup(true);
    setTimeout(() => {
      setPopup(false);
    }, 7000);
  };

  const handleSubmit = () => {
    hS(openPop);
  };

  // Combination logic
  function combinations(n, k) {
    if (k > n) return 0;
    let num = 1,
      den = 1;
    for (let i = 0; i < k; i++) {
      num *= n - i;
      den *= i + 1;
    }
    return num / den;
  }

  function calculateLines(selected, gameType) {
    const n = selected.length;
    switch (gameType.toUpperCase()) {
      case "C1":
        return combinations(n, 1);
      case "C2":
        return combinations(n, 2);
      case "C3":
        return combinations(n, 3);
      case "C4":
        return combinations(n, 4);
      case "C2+C3":
        return combinations(n, 2) + combinations(n, 3);
      case "PICK2":
        return combinations(n, 2);
      case "PICK3":
        return combinations(n, 3);
      case "JACKPOT":
        return combinations(n, 5);
      default:
        return 0;
    }
  }

  // Discount rules mapping [this is dummy we just make it call from api]
  const discountRules = {
    C1: 0.10,     // 10%
    C2: 0.10,
    C3: 0.20,     // 20%
    BONUS: 0.10,
    C4: 0.00,     // no discount
    "C2+C3": 0.15 // 15% for example
  };

  return (
    <div className="game-inner">
      {/* LEFT SIDE */}
      <div className="left">
        <div className="left-top">
          <div className="head">
            <div className="smt">Choose numbers</div>
            <div className="auto-pick-buttons">
              {[3, 5, 7, 10].map((count) => (
                <button
                  key={count}
                  style={{ padding: "2px 10px", marginRight: "5px" }}
                  onClick={() => autoSelect(count)}
                >
                  Auto Pick {count}
                </button>
              ))}
            </div>
            <div className="smt">{selectedNumbers.length}/10</div>
          </div>

          <div className="left-matrix">
            {range(
              game_matrix[2].lotto_max.clickable_numbers[0],
              game_matrix[2].lotto_max.clickable_numbers[1]
            ).map((e, i) => (
              <button
                key={i}
                className="matrix-selector"
                style={{
                  backgroundColor: selectedNumbers.includes(e) ? "#1CA5FB" : "",
                  color: selectedNumbers.includes(e) ? "white" : "",
                }}
                onClick={() => handleSelect(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="left-bottom">
          <div className="head">
            <div className="smt">Choose bet type</div>
          </div>
          <div className="controller">
            <div className="left-controllers-row-one">
              {game_matrix[2].lotto_max.controllers.row_one.map((e, i) => (
                <button
                  key={i}
                  className="left-controller"
                  disabled={e.disabled}
                  onClick={() => handleBetTypeClick("BigMax", e.name)}
                >
                  {e.name}
                </button>
              ))}
            </div>
            <div className="left-controllers-row-two">
              {game_matrix[2].lotto_max.controllers.row_two.map((e, i) => {
                if (e.name === "CANCEL") {
                  return (
                    <button
                      key={i}
                      className="left-controller"
                      style={{
                        backgroundColor:
                          selectedNumbers.length <= 0 ? "" : "#E20303",
                        color:
                          selectedNumbers.length <= 0 ? "" : "white",
                      }}
                      disabled={selectedNumbers.length <= 0}
                      onClick={handleCancel}
                    >
                      {e.name}
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    className="left-controller"
                    disabled={e.disabled}
                    onClick={() => handleBetTypeClick("BigMax", e.name)}
                  >
                    {e.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (CART) */}
      <div className="right">
        <div className="head">
          <div className="left-text">Selected bets</div>
          <div className="right-text">{bets.length}/10</div>
        </div>

        <div className="selected-cart">
          {bets.length <= 0 && (
            <div className="empty">
              Empty Cart! <PiEmpty className="empty-icon" />
            </div>
          )}

          {bets.map((e, i) => (
            <div className="bet-ar" key={i}>
              <div className="bet">
                <div className="bet-left">
                  <div className="top">{e.date}</div>
                  <div className="bottom">{e.ticket_id}</div>
                </div>
                <div className="bet-middle">
                  <div className="top">{e.game_name}</div>
                  <div className="bottom">
                    <div className="b-left">{e.bet_type}</div>
                    <div className="b-right">
                      /L {calculateLines(e.numbers, e.bet_type)}
                    </div>
                  </div>
                </div>
                <div className="bet-right">
                  <div className="left">${e.amount.toFixed(2)}</div>
                  {/* <div className="right">/${(e.amount * 7).toFixed(2)}</div> */}
                </div>
                <button className="delete" onClick={() => removeBet(i)}>
                  <AiFillDelete className="delete-icon" />
                </button>
              </div>
              <div className="bottom-numbers">
                <b>Selected Numbers:</b>
                <div className="b-numbers">{e.numbers.join(", ")}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="selected-controls">
          <button className="clear" onClick={() => setBets([])}>
            CLEAR ALL
          </button>
          <button className="submit" onClick={handleSubmit}>
            SUBMIT
          </button>
        </div>
      </div>

      {popup && <PopUpBlast />}

      {showPricePopup && (
        <div className="price-popup-overlay">
          <div className="price-popup">
            <div className="left">
              <div className="title">Selected Numbers</div>
              <div className="numbers">
                {selectedNumbers.map((e, i) => (
                  <div className="number" key={i}>{e}</div>
                ))}
              </div>
            </div>
            <div className="right">
              <div className="bet-meta">
                <div className="bet-meta-time">
                  <LiveTime />
                  <div className="bet-meta-tkt">TKT{Math.floor(Math.random() * 999999)}</div>
                </div>
                <div className="bet-meta-type">Lotto Dice</div>
              </div>
              <h3>Select Price</h3>
              {price >= 5 && <div className="discount"><b>Hay!</b> you got <b>{(price * discountRules[tempBetData.bet_type]).toFixed(2)}% DISCOUNT</b></div>}
              <div className="bet-price-selection">
                <button onClick={() => price > 1 && setPrice(price - 1)}>${price - 1}</button>
                <div className="input">${price} {price >= 5 && <span>${(price * discountRules[tempBetData.bet_type]).toFixed(2)}</span>}</div>
                <button onClick={() => price < cdd.balance && setPrice(price + 1)}>${price + 1}</button>
              </div>

              <div className="number-pad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPrice(Number(`${price}${num}`))}
                  >
                    {num}
                  </button>
                ))}
                <button onClick={() => setPrice(Math.floor(price / 10))}>⌫</button>
                <button onClick={() => setPrice(0)}>Clear</button>
              </div>

              <div className="popup-buttons">
                <button className="submit" onClick={confirmBet}>Submit</button>
                <button className="cancel" onClick={cancelBet}>Cancel</button>
                {cdd?.bonus_amount > 0 && <button className="bonus" onClick={confirmBetBon}>Bonus {cdd?.bonus_amount}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}