import { useState } from "react";
import { game_matrix } from "../../data/game_init";
import { AiFillDelete } from "react-icons/ai";
import { PiEmpty } from "react-icons/pi";
import LiveTime from "../Time/LiveTime";

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export default function BigFive({ bets, setBets, cdd }) {
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const [showPricePopup, setShowPricePopup] = useState(false);
    const [tempBetData, setTempBetData] = useState(null);
    const [price, setPrice] = useState(1);

    // Bet rules mapping
    const betRules = {
        C1: { min: 1, max: 10 },
        C2: { min: 2, max: 2 },
        C3: { min: 3, max: 3 },
        C4: { min: 4, max: 4 },
        "C2+C3": { min: 5, max: 5 },
        BONUS: { min: 1, max: 1 },
        JACKPOT: { min: 1, max: 1 }
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
                alert(`For ${bet_type}, you must select exactly between ${rule.min} and ${rule.max} numbers.`);
                return;
            }
        }

        setTempBetData({ game_name, bet_type });
        setPrice(1);
        setShowPricePopup(true);
    };

    // Confirm bet with price
    const confirmBet = () => {
        if (!tempBetData) return;

        const { game_name, bet_type } = tempBetData;

        if (bet_type === "C1") {
            // Partial bets for C1
            const partCount = selectedNumbers.length;
            const dividedPrice = price / partCount;

            const newBets = selectedNumbers.map((_, idx) => ({
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                part: `P${idx + 1}`,
                amount: dividedPrice
            }));

            if (bets.length + newBets.length > 10) {
                alert("Adding these bets would exceed cart limit of 10.");
                return;
            }

            setBets(prev => [...prev, ...newBets]);

        } else {
            // Normal bet (C2, C3, etc.)
            const newBet = {
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                part: "P1",
                amount: price
            };
            setBets(prev => [...prev, newBet]);
        }

        setShowPricePopup(false);
        setTempBetData(null);
        setSelectedNumbers([]); // clear after adding
    };

    // Cancel bet creation
    const cancelBet = () => {
        setTempBetData(null);
        setPrice(1);
        setShowPricePopup(false);
        setSelectedNumbers([]); // clear numbers on cancel
    };

    const removeBet = (index) => {
        setBets(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelect = (num) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length >= 10) {
                alert("You can only select up to 10 numbers.");
                return;
            }
            setSelectedNumbers([...selectedNumbers, num]);
        }
    };

    const handleCancel = () => {
        setSelectedNumbers([]);
    };

    return (
        <div className="game-inner">
            <div className="left">
                <div className="left-top">
                    <div className="head">
                        <div className="smt">Choose any number</div>
                        <div className="smt">{selectedNumbers.length}/10</div>
                    </div>
                    <div className="left-matrix">
                        {range(game_matrix[3].lotto_five.clickable_numbers[0], game_matrix[3].lotto_five.clickable_numbers[1]).map((e, i) => (
                            <button
                                className="matrix-selector"
                                style={{
                                    backgroundColor: selectedNumbers.includes(e) ? "#1CA5FB" : "",
                                    color: selectedNumbers.includes(e) ? "white" : ""
                                }}
                                key={i}
                                onClick={() => handleSelect(e)}
                            >
                                {e}
                            </button>
                        ))}
                        {range(game_matrix[3].lotto_five.disabled_numbers[0], game_matrix[3].lotto_five.disabled_numbers[1]).map((e, i) => (
                            <button className="matrix-selector" key={i} disabled>{e}</button>
                        ))}
                    </div>
                </div>

                <div className="left-bottom">
                    <div className="head">
                        <div className="smt">Choose bet type</div>
                    </div>
                    <div className="controller">
                        <div className="left-controllers-row-one">
                            {game_matrix[3].lotto_five.controllers.row_one.map((e, i) => (
                                <button
                                    key={i}
                                    className="left-controller"
                                    disabled={e.disabled}
                                    onClick={() => handleBetTypeClick("Big Five", e.name)}
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                        <div className="left-controllers-row-two">
                            {game_matrix[3].lotto_five.controllers.row_two.map((e, i) => {
                                if (e.name === "CANCEL") {
                                    return <button
                                        key={i}
                                        className="left-controller"
                                        style={{ backgroundColor: selectedNumbers.length <= 0 ? "" : "#E20303", color: selectedNumbers.length <= 0 ? "" : "white" }}
                                        disabled={selectedNumbers.length <= 0}
                                        onClick={() => handleCancel()}
                                    >
                                        {e.name}
                                    </button>
                                }
                                return <button
                                    key={i}
                                    className="left-controller"
                                    disabled={e.disabled}
                                    onClick={() => handleBetTypeClick("Big Five", e.name)}
                                >
                                    {e.name}
                                </button>
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="right">
                <div className="head">
                    <div className="left-text">Selected bets</div>
                    <div className="right-text">{bets.length}/10</div>
                </div>
                <div className="selected-cart">
                    {
                        bets.length <= 0 && <div className="empty">Empty Cart!<PiEmpty className="empty-icon" /></div>
                    }
                    {bets.map((e, i) => (
                        <div className="bet" key={i}>
                            <div className="bet-left">
                                <div className="top">{e.date}</div>
                                <div className="bottom">{e.ticket_id}</div>
                            </div>
                            <div className="bet-middle">
                                <div className="top">{e.game_name}</div>
                                <div className="bottom">
                                    <div className="b-left">{e.bet_type}</div>
                                    <div className="b-right">/{e.part}</div>
                                </div>
                            </div>
                            <div className="bet-right">
                                <div className="left">${e.amount.toFixed(2)}</div>
                                <div className="right">/${(e.amount * 7).toFixed(2)}</div>
                            </div>
                            <button className="delete" onClick={() => removeBet(i)}>
                                <AiFillDelete className="delete-icon" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="selected-controls">
                    <button className="clear" onClick={() => setBets([])}>CLEAR ALL</button>
                    <button className="submit">SUBMIT</button>
                </div>
            </div>

            {showPricePopup && (
                <div className="price-popup-overlay">
                    <div className="price-popup">
                        <div className="left">
                            <div className="title">Selected Numbers</div>
                            <div className="numbers">
                                {
                                    selectedNumbers.map((e, i) => {
                                        return <div className="number" key={i}>{e}</div>
                                    })
                                }
                            </div>
                        </div>
                        <div className="right">
                            <div className="bet-meta">
                                <div className="bet-meta-time">
                                    <LiveTime />
                                    <div className="bet-meta-tkt">TKT{Math.floor(Math.random() * 999999)}</div>
                                </div>
                                <div className="bet-meta-type">Lotto Five</div>
                            </div>
                            <h3>Select Price</h3>
                            <div className="bet-price-selection">
                                <button onClick={() => {
                                    if (price > 1) {
                                        setPrice(price - 1);
                                    }
                                }}>${price - 1}</button>
                                <div className="input">${price}</div>
                                <button onClick={() => {
                                    if (price < cdd.balance) {
                                        setPrice(Number((price + 1)));
                                    }
                                }}>${price + 1}</button>
                            </div>
                            <div className="popup-buttons">
                                <button className="submit" onClick={confirmBet}>Submit</button>
                                <button className="cancel" onClick={cancelBet}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}