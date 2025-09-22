import { useEffect, useState } from "react";
import { game_matrix } from "../../data/game_init";
import { AiFillDelete } from "react-icons/ai";
import { PiEmpty } from "react-icons/pi";
import LiveTime from "../Time/LiveTime";
import PopUpBlast from "../Animations/PopUpBlast";
import { toast } from "react-toastify";
import { flushSync } from "react-dom";

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export default function BigSix({ bets, setBets, cdd, hS, tDes, tDesDef, destroy }) {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [showPricePopup, setShowPricePopup] = useState(false);
    const [tempBetData, setTempBetData] = useState(null);
    const [price, setPrice] = useState(0);
    const [popup, setPopup] = useState(false);

    // Bet rules mapping
    const betRules = {
        C1: { min: 1, max: 10 },
        C2: { min: 2, max: 10 },
        C3: { min: 3, max: 10 },
        C4: { min: 4, max: 10 },
        "C2+C3": { min: 3, max: 10 },
        PICK2: { min: 2, max: 10 },
        PICK3: { min: 3, max: 10 },
        BONUS: { min: 1, max: 10 },
        JACKPOT: { min: 5, max: 5 }
    };

    const autoSelect = (count) => {
        const allNums = range(
            game_matrix[1].lotto_six.clickable_numbers[0],
            game_matrix[1].lotto_six.clickable_numbers[1]
        );
        const shuffled = allNums.sort(() => 0.5 - Math.random());
        setSelectedNumbers(shuffled.slice(0, count));
    };

    const handleBetTypeClick = (game_name, bet_type) => {
        if (bets.length >= 10) {
            toast.error("Cart is full. You can only have 10 bets.");
            return;
        }

        if (selectedNumbers.length === 0) {
            toast.error("Please select at least one number before choosing a bet type.");
            return;
        }

        // Check rules
        if (bet_type in betRules) {
            const rule = betRules[bet_type];
            if (selectedNumbers.length < rule.min || selectedNumbers.length > rule.max) {
                toast.error(`For ${bet_type}, you must select between ${rule.min} and ${rule.max} numbers.`);
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
        setPrice(0);
        setShowPricePopup(true);
    };

    const confirmBet = () => {
        if (!tempBetData) return;

        const { game_name, bet_type } = tempBetData;
        const lineCount = calculateLines(selectedNumbers, bet_type);

        // ✅ Validation: Must have at least 1 valid line
        if (lineCount <= 0) {
            toast.error(`Not enough numbers selected for ${bet_type}`);
            return;
        }

        // ✅ Minimum price validation
        const minPrice = lineCount >= 3 ? makeEven(Math.ceil(lineCount * 0.5)) : 1;
        if (price < minPrice) {
            toast.error(`Minimum price for ${lineCount} lines is $${minPrice}`);
            return;
        }

        // ✅ Handle C2+C3 combined logic
        if (bet_type === "C2+C3") {
            const c2Lines = calculateLines(selectedNumbers, "C2");
            const c3Lines = calculateLines(selectedNumbers, "C3");
            const halfPrice = price / 2;

            if (c2Lines > 0) addBet(game_name, "C2", selectedNumbers, halfPrice);
            if (c3Lines > 0) addBet(game_name, "C3", selectedNumbers, halfPrice);
        }

        // ✅ Handle BONUS: split into individual bets
        else if (bet_type === "BONUS") {
            const perLinePrice = price / selectedNumbers.length;
            selectedNumbers.forEach((num) =>
                addBet(game_name, "BONUS", [num], perLinePrice)
            );
        }

        // ✅ Handle normal bet types (C1, C2, C3, C4)
        else {
            addBet(game_name, bet_type, selectedNumbers, price);
        }

        resetTempState();
    };

    function addBet(game_name, bet_type, numbers, amount) {
        setBets((prev) => [
            ...prev,
            {
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [...numbers],
                amount,
                bonus: false,
                addToWinningAmount,
                freePlay,
                discount,
            },
        ]);
    }

    function makeEven(n) {
        return n % 2 === 0 ? n : n + 1;
    }

    function resetTempState() {
        setShowPricePopup(false);
        setTempBetData(null);
        setSelectedNumbers([]);
        setPrice(0);
    }

    // Cancel bet creation
    const cancelBet = () => {
        setTempBetData(null);
        setPrice(1);
        setShowPricePopup(false);
        setSelectedNumbers([]);
    };

    const removeBet = (index) => {
        setBets(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelect = (num) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length >= 10) {
                toast.error("You can only select up to 10 numbers.");
                return;
            }
            setSelectedNumbers([...selectedNumbers, num]);
        }
    };

    const handleCancel = () => {
        setSelectedNumbers([]);
    };

    const openPop = () => {
        setPopup(true);
        setTimeout(() => {
            setPopup(false);
        }, 7000);
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
            case "BONUS":
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
    };

    // discount rules mapping [this is dummy we just make it call from api]
    const discountRules = {
        C1: 0.10,     // 10%
        C2: 0.10,
        C3: 0.20,     // 20%
        BONUS: 0.10,
        C4: 0.10,
        "C2+C3": 0.15 // 15%
    };

    const payoutRulesByGame = {
        "Big Dice": {
            C1: 5, C2: 35, C3: 300, C4: 640, BONUS: 30, JACKPOT: 30000
        },
        "Big Six": {
            C1: 7, C2: 50, C3: 550, C4: 640, BONUS: 30, JACKPOT: 30000
        },
        "Big Max": {
            C1: 7, C2: 35, C3: 200, C4: 640, BONUS: 30, JACKPOT: 30000
        },
        "Big Five": {
            C1: 7, C2: 70, C3: 800, C4: 640, BONUS: 30, JACKPOT: 30000
        }
    };

    function calculateWinnings(bet) {
        const gameRules = payoutRulesByGame[bet.game_name] || {};
        if (bet.bet_type === "JACKPOT") return gameRules.JACKPOT || 0;
        const multiplier = gameRules[bet.bet_type] || 0;
        return bet.amount * multiplier;
    }

    const [showDiscountPopup, setShowDiscountPopup] = useState(false);
    const [addToWinningAmount, setAddToWinningAmount] = useState(false);
    const [freePlay, setAddFreePlay] = useState(false);
    const [discount, setDiscount] = useState(0);

    const [priceBow, setPriceBow] = useState(0);

    const updatePriceBow = () => {
        if (discount > priceBow) {
            const newPrice = discount - priceBow;
            setDiscount(newPrice);
            tDesDef(newPrice);
        } else {
            const newPriceRev = priceBow - discount;
            setDiscount(newPriceRev);
            tDesDef(newPriceRev);
        };
    };

    const confirmBetBon = () => {
        if (!tempBetData) return;

        const { game_name, bet_type } = tempBetData;

        // ✅ If BONUS type, add one bet per number (no validation)
        if (bet_type === "BONUS") {
            const perLinePrice = price > 0
                ? price / selectedNumbers.length
                : discount / selectedNumbers.length; // fallback to discount if price is 0

            const newBets = selectedNumbers.map((num) => ({
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [num],
                amount: perLinePrice,
                bonus: true,  // ✅ mark as bonus
                addToWinningAmount,
                freePlay,
                discount,
            }));

            setBets((prev) => [...prev, ...newBets]);
        }
        else {
            // ✅ For other bet types, just add as single bonus bet
            const newBet = {
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [...selectedNumbers],
                amount: priceBow,
                bonus: true,
                addToWinningAmount,
                freePlay,
                discount,
            };

            setBets((prev) => [...prev, newBet]);
        }

        // ✅ Reset states after adding bet
        setShowPricePopup(false);
        setTempBetData(null);
        setSelectedNumbers([]);
        setPrice(0);
        updatePriceBow();
        setPriceBow(0);
    };

    const handleSubmit = () => {
        hS(openPop);
    };

    function calculateTotalDiscount(bets) {
        if (!Array.isArray(bets)) return "0.00";

        // only bets of the requested game
        const gameBets = bets.filter(bet => bet.game_name == "Big Six");

        let total = 0;
        total = gameBets.reduce((sum, bet) => {
            if (!bet.bonus) {
                const discountRate = discountRules[bet.bet_type] || 0;
                const amount = Number(bet.amount) || 0;
                if (discountRate > 0 && amount >= 5) {
                    sum += amount * discountRate;
                }
            } else {
                const amountBo = Number(bet.amount) || 0;
                sum -= amountBo;
            }
            return sum; // always return accumulator
        }, 0);

        const finalTotal = parseFloat(total.toFixed(2));
        tDesDef((finalTotal - priceBow).toFixed(1));
        setDiscount((finalTotal - priceBow).toFixed(1));

        return finalTotal;
    };

    const onSubmit = () => {
        const discount = calculateTotalDiscount(bets);
        if (discount > 0) {
            setShowDiscountPopup(true); // show popup
        } else {
            setShowDiscountPopup(false);
            handleSubmit();
        }
    };

    useEffect(() => {
        calculateTotalDiscount(bets);
    }, [bets]);

    useEffect(() => {
        setAddToWinningAmount(false);
        setAddFreePlay(false);
        setDiscount(0);
    }, [destroy]);

    function applyFreePlay() {
        toast.success("Discount applied as free gameplay!");
        flushSync(() => {
            setShowDiscountPopup(false);
            setAddFreePlay(true);
            setAddToWinningAmount(false);
        });
    };

    return (
        <div className="game-inner">
            {showDiscountPopup && (
                <div className="discount-popup-overlay">
                    <div className="discount-popup">
                        <h3>🎉 You have a discount of ${tDes}</h3>
                        <p>How would you like to use it?</p>
                        <div className="popup-buttons">
                            <button
                                className="submit"
                                onClick={() => applyFreePlay()}
                            >
                                Use for Free Play
                            </button>
                            <button
                                className="bonus"
                                onClick={() => {
                                    toast.success("Discount will be added to your winnings!");
                                    setShowDiscountPopup(false);
                                    setAddFreePlay(false);
                                    setAddToWinningAmount(true);
                                    handleSubmit();
                                }}
                            >
                                Add to Winning Amount
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="left">
                <div className="left-top">
                    <div className="head">
                        <div className="smt">Choose any number</div>
                        <div className="auto-pick-buttons" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <span style={{ marginRight: "5px" }}>Auto pick</span>
                            {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                                <button
                                    key={count}
                                    style={{ padding: "2px 10px" }}
                                    onClick={() => autoSelect(count)}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                        <div className="smt">{selectedNumbers.length}/10</div>
                    </div>
                    <div className="left-matrix step-1">
                        {range(game_matrix[1].lotto_six.clickable_numbers[0], game_matrix[1].lotto_six.clickable_numbers[1]).map((e, i) => (
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
                        {range(game_matrix[1].lotto_six.disabled_numbers[0], game_matrix[1].lotto_six.disabled_numbers[1]).map((e, i) => (
                            <button className="matrix-selector" key={i} disabled>{e}</button>
                        ))}
                    </div>
                </div>

                <div className="left-bottom">
                    <div className="head">
                        <div className="smt">Choose bet type</div>
                    </div>
                    <div className="controller">
                        <div className="left-controllers-row-one step-2">
                            {game_matrix[1].lotto_six.controllers.row_one.map((e, i) => (
                                <button
                                    key={i}
                                    className="left-controller"
                                    disabled={e.disabled}
                                    onClick={() => handleBetTypeClick("Big Six", e.name)}
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                        <div className="left-controllers-row-two">
                            {game_matrix[1].lotto_six.controllers.row_two.map((e, i) => {
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
                                    className="left-controller step-2"
                                    disabled={e.disabled}
                                    onClick={() => handleBetTypeClick("Big Six", e.name)}
                                >
                                    {e.name}
                                </button>
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Cart View */}
            <div className="right">
                <div className="head">
                    <div className="left-text">Selected bets</div>
                    <div className="right-text">{bets.length}/10</div>
                </div>
                <div className="selected-cart step-4">
                    {
                        bets.length <= 0 && <div className="empty">Empty Cart!<PiEmpty className="empty-icon" /></div>
                    }
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
                                        <div className="b-right">/L {calculateLines(e.numbers, e.bet_type)}</div>
                                    </div>
                                    <div>{e.bonus ? "Bonus" : null}</div>
                                </div>
                                <div className="bet-right">
                                    <div className="left">${e.amount}</div>
                                    <div className="right">/${(calculateWinnings(e)).toFixed(2)}</div>
                                </div>
                                <button className="delete" onClick={() => { bets.filter(bet => bet.bonus === true) && !e.bonus ? toast.warning("Please remove all bonus bets first.") : removeBet(i); }}>
                                    <AiFillDelete className="delete-icon" />
                                </button>
                            </div>
                            <div className="bottom-numbers">
                                <b>Selected Numbers:</b>
                                {e.numbers && (
                                    <div className="b-numbers">
                                        {e.numbers.join(", ")}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="selected-controls">
                    <button className="clear" onClick={() => setBets([])}>CLEAR ALL</button>
                    {(!freePlay || discount <= 0) && <button className="submit step-5" onClick={() => { onSubmit() }}>SUBMIT</button>}
                    {(freePlay && discount > 0) && <button className="submit step-5" onClick={() => setShowDiscountPopup(true)}>USE BONUS</button>}
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
                                <div className="bet-meta-type">Lotto Six</div>
                            </div>
                            <h3>Select Price</h3>
                            {price >= 5 && <div className="discount"><b>Hay!</b> you got <b>{(discountRules[tempBetData.bet_type] * 100).toFixed(2)}% DISCOUNT</b></div>}
                            {(!freePlay || discount <= 0) ? <div className="bet-price-selection">
                                <button onClick={() => price > 1 && setPrice(price - 1)}>${price - 1}</button>
                                <div className="input">${price} {price >= 5 && <span>${(price * discountRules[tempBetData.bet_type]).toFixed(2)}</span>}</div>
                                <button onClick={() => price < cdd.balance && setPrice(price + 1)}>${price + 1}</button>
                            </div> : <div className="bet-price-selection">
                                <div style={{
                                    height: "100%",
                                    backgroundColor: "yellow",
                                    padding: "15px",
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    outline: "2px solid black"
                                }}>FREE PLAY</div>

                                {/* 👇 Keep the math clean */}
                                <button onClick={() => priceBow >= 0.1 && setPriceBow(prev => parseFloat((prev - 0.1).toFixed(1)))}>
                                    ${parseFloat(priceBow - 0.1).toFixed(1)}
                                </button>

                                {/* 👇 Only format for display */}
                                <div className="input">${priceBow.toFixed(1)}</div>

                                <button onClick={() => priceBow <= discount - 0.1 && setPriceBow(prev => parseFloat((prev + 0.1).toFixed(1)))}>
                                    ${parseFloat(priceBow + 0.1).toFixed(1)}
                                </button>
                            </div>
                            }

                            {(!freePlay || discount <= 0) && <div className="number-pad">
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
                            </div>}

                            <div className="popup-buttons">
                                {(!freePlay || discount <= 0) && <button className="submit" onClick={confirmBet}>Submit</button>}
                                <button className="cancel" onClick={cancelBet}>{(freePlay && tempBetData.bet_type === "C2+C3" && discount > 0) ? "Discount is not applicable for this bet" : "Cancel"}</button>
                                {(freePlay && tempBetData.bet_type != "C2+C3" && discount > 0) && <button className="bonus step-3" onClick={confirmBetBon}>Bonus {priceBow}</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}