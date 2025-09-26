import { useEffect, useState, useCallback } from "react";
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

// Moved constant objects outside the component to prevent re-creation on every render
const betRules = {
    C1: { min: 1, max: 10 },
    C2: { min: 2, max: 10 },
    C3: { min: 3, max: 10 },
    C4: { min: 4, max: 10 },
    "C2+C3": { min: 3, max: 10 },
    BONUS: { min: 1, max: 10 },
    JACKPOT: { min: 5, max: 5 }
};

const discountRules = {
    C1: 0.10,     // 10%
    C2: 0.10,     // 10%
    C3: 0.20,     // 20%
    C4: 0.10,     // 10%
    BONUS: 0.10,  // 10%
    "C2+C3": 0.15 // 15%
};

const payoutRulesByGame = {
    "Big Dice": {
        C1: 5, C2: 35, C3: 30, C4: 640, BONUS: 33, JACKPOT: 30000
    },
    "Big Six": {
        C1: 7, C2: 50, C3: 550, C4: 640, BONUS: 33, JACKPOT: 30000
    },
    "Big Max": {
        C1: 7, C2: 35, C3: 200, C4: 640, BONUS: 33, JACKPOT: 30000
    },
    "Big Five": {
        C1: 7, C2: 70, C3: 800, C4: 640, BONUS: 33, JACKPOT: 30000
    }
};

export default function BigDice({ bets, setBets, cdd, hS, tDes, tDesDef, destroy }) {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [showPricePopup, setShowPricePopup] = useState(false);
    const [tempBetData, setTempBetData] = useState(null);
    const [price, setPrice] = useState(0);
    const [popup, setPopup] = useState(false);

    // Discount system state
    const [showDiscountPopup, setShowDiscountPopup] = useState(false);
    const [addToWinningAmount, setAddToWinningAmount] = useState(false);
    const [freePlay, setFreePlay] = useState(false);
    const [totalAvailableDiscount, setTotalAvailableDiscount] = useState(0);
    const [usedDiscountAmount, setUsedDiscountAmount] = useState(0);
    const [betsWithLiveDiscount, setBetsWithLiveDiscount] = useState([]);

    // ===== DISCOUNT CALCULATION SYSTEM =====
    
    /**
     * Calculates the total available discount from the main bets state.
     */
    const calculateTotalDiscount = useCallback(() => {
        const gameBets = bets.filter(bet => bet.game_name === "Big Dice");
        
        let totalEarned = 0;
        let totalSpent = 0;

        gameBets.forEach(bet => {
            if (bet.bonus) { // This is a bet made with discount money
                totalSpent += Number(bet.amount) || 0;
            } else { // This is a regular bet that might have earned a discount
                totalEarned += Number(bet.discount) || 0;
            }
        });

        const availableDiscount = totalEarned - totalSpent;
        return Math.max(0, availableDiscount);
    }, [bets]);
    
    /**
     * Calculates the discount for a potential bet based on user-entered price.
     */
    const getPotentialDiscountInfo = (baseAmount, bet_type) => {
        const discountRate = discountRules[bet_type] || 0;
        if (discountRate > 0 && baseAmount >= 5) {
            const discount = baseAmount * discountRate;
            return {
                stake: baseAmount,       // The amount the user is paying
                earnedDiscount: discount // The discount this bet earns
            };
        }
        return {
            stake: baseAmount,
            earnedDiscount: 0
        };
    };

    // ===== CORE BETTING LOGIC =====

    const autoSelect = (count) => {
        const allNums = range(
            game_matrix[0].lotto_dice.clickable_numbers[0],
            game_matrix[0].lotto_dice.clickable_numbers[1]
        );
        const shuffled = allNums.sort(() => 0.5 - Math.random());
        setSelectedNumbers(shuffled.slice(0, count));
    };

    const handleBetTypeClick = (game_name, bet_type) => {
        if (bets.length >= 1000) {
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

        // JACKPOT bet - fixed price, no discount
        if (bet_type === "JACKPOT") {
            const newBet = {
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [...selectedNumbers],
                amount: 2,
                bonus: false,
                addToWinningAmount: false,
                freePlay: false,
                discount: 0,
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

        // Validation: Must have at least 1 valid line
        if (lineCount <= 0) {
            toast.error(`Not enough numbers selected for ${bet_type}`);
            return;
        }

        // Minimum price validation
        const minPrice = lineCount >= 3 ? makeEven(Math.ceil(lineCount * 0.5)) : 1;
        if (price < minPrice) {
            toast.error(`Minimum price for ${lineCount} lines is $${minPrice}`);
            return;
        }

        // Calculate earned discount based on user-entered price
        const priceInfo = getPotentialDiscountInfo(price, bet_type);

        // Handle C2+C3 combined logic
        if (bet_type === "C2+C3") {
            const c2Lines = calculateLines(selectedNumbers, "C2");
            const c3Lines = calculateLines(selectedNumbers, "C3");
            const halfStake = priceInfo.stake / 2;
            const halfDiscount = priceInfo.earnedDiscount / 2;

            if (c2Lines > 0) addBet(game_name, "C2", selectedNumbers, halfStake, halfDiscount);
            if (c3Lines > 0) addBet(game_name, "C3", selectedNumbers, halfStake, halfDiscount);
        }
        // Handle BONUS: split into individual bets
        else if (bet_type === "BONUS") {
            const perLineStake = priceInfo.stake / selectedNumbers.length;
            const perLineDiscount = priceInfo.earnedDiscount / selectedNumbers.length;
            selectedNumbers.forEach((num) =>
                addBet(game_name, "BONUS", [num], perLineStake, perLineDiscount)
            );
        }
        // Handle normal bet types (C1, C2, C3, C4)
        else {
            addBet(game_name, bet_type, selectedNumbers, priceInfo.stake, priceInfo.earnedDiscount);
        }

        resetTempState();
    };

    const confirmBetWithDiscount = () => {
        if (!tempBetData) return;

        const { game_name, bet_type } = tempBetData;
        const availableDiscount = calculateTotalDiscount();

        if (usedDiscountAmount <= 0) {
            toast.error("Please select a discount amount to use.");
            return;
        }

        if (usedDiscountAmount > availableDiscount) {
            toast.error(`Cannot use more than available discount: $${availableDiscount.toFixed(2)}`);
            return;
        }

        // Handle BONUS type with discount
        if (bet_type === "BONUS") {
            const perLinePrice = usedDiscountAmount / selectedNumbers.length;
            const newBets = selectedNumbers.map((num) => ({
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [num],
                amount: perLinePrice,
                bonus: true,
                addToWinningAmount: false,
                freePlay: true,
                discount: 0, // Bonus bets don't earn discounts
            }));

            setBets((prev) => [...prev, ...newBets]);
        } else {
            // For other bet types
            const newBet = {
                date: new Date().toLocaleString("en-GB"),
                ticket_id: `#TKT${Math.floor(100000 + Math.random() * 900000)}`,
                game_name,
                bet_type,
                numbers: [...selectedNumbers],
                amount: usedDiscountAmount,
                bonus: true,
                addToWinningAmount: false,
                freePlay: true,
                discount: 0, // Bonus bets don't earn discounts
            };

            setBets((prev) => [...prev, newBet]);
        }

        resetTempState();
        setUsedDiscountAmount(0);
    };

    function addBet(game_name, bet_type, numbers, amount, discount) {
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
                addToWinningAmount: addToWinningAmount,
                freePlay: freePlay,
                discount: discount || 0,
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

    const cancelBet = () => {
        resetTempState();
    };

    const removeBet = (index) => {
        const betToRemove = bets[index];
        
        const hasBonusBets = bets.some(bet => bet.bonus === true);
        if (hasBonusBets && !betToRemove.bonus) {
            toast.warning("Please remove all bonus bets first.");
            return;
        }

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
    }

    const calculateWinnings = useCallback((bet) => {
        const gameRules = payoutRulesByGame[bet.game_name] || {};
        const totalStake = bet.bonus ? bet.amount : bet.amount + (addToWinningAmount ? bet.liveDiscount : 0);
        
        if (bet.bet_type === "JACKPOT") return gameRules.JACKPOT || 0;
        
        const multiplier = gameRules[bet.bet_type] || 0;
        return totalStake * multiplier;
    }, [addToWinningAmount]);

    const handleSubmit = () => {
        hS(openPop);
    };

    const onSubmit = () => {
        const availableDiscount = calculateTotalDiscount();
        setTotalAvailableDiscount(availableDiscount);
        tDesDef(availableDiscount);
        
        if (availableDiscount > 0 && !addToWinningAmount) {
            setShowDiscountPopup(true);
        } else {
            handleSubmit();
        }
    };

    const applyFreePlay = () => {
        toast.success("Free Play mode activated!");
        flushSync(() => {
            setShowDiscountPopup(false);
            setFreePlay(true);
            setAddToWinningAmount(false);
        });
    };

    const applyToWinnings = () => {
        toast.success("Discounts will now be added to your winnings!");
        flushSync(() => {
            setShowDiscountPopup(false);
            setFreePlay(false);
            setAddToWinningAmount(true);
        });
    };

    // Effects
    useEffect(() => {
        const availableDiscount = calculateTotalDiscount();
        setTotalAvailableDiscount(availableDiscount);
        tDesDef(availableDiscount);

        let remainingDiscountPool = availableDiscount;

        const liveBets = bets.map(bet => {
            let liveDiscount = 0;
            if (addToWinningAmount && !bet.bonus) {
                liveDiscount = bet.discount;
            } else if (!addToWinningAmount && !bet.bonus && bet.discount > 0) {
                const discountToApply = Math.min(remainingDiscountPool, bet.discount);
                liveDiscount = discountToApply;
                remainingDiscountPool -= discountToApply;
            }

            return {
                ...bet,
                liveDiscount,
                effectiveStake: bet.bonus ? bet.amount : (bet.amount + liveDiscount),
            };
        });

        setBetsWithLiveDiscount(liveBets);

    }, [bets, addToWinningAmount, calculateTotalDiscount, tDesDef]);

    useEffect(() => {
        setAddToWinningAmount(false);
        setFreePlay(false);
        setTotalAvailableDiscount(0);
        setUsedDiscountAmount(0);
    }, [destroy]);

    return (
        <div className="game-inner">
            {showDiscountPopup && (
                <div className="discount-popup-overlay">
                    <div className="discount-popup">
                        <h3>🎉 You have a discount of ${totalAvailableDiscount.toFixed(2)}</h3>
                        <p>How would you like to use it?</p>
                        <div className="popup-buttons">
                            <button
                                className="submit"
                                onClick={applyFreePlay}
                            >
                                Use for Free Play
                            </button>
                            <button
                                className="bonus"
                                onClick={applyToWinnings}
                            >
                                Add to Winnings
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
                        {range(game_matrix[0].lotto_dice.clickable_numbers[0], game_matrix[0].lotto_dice.clickable_numbers[1]).map((e, i) => (
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
                        {range(game_matrix[0].lotto_dice.disabled_numbers[0], game_matrix[0].lotto_dice.disabled_numbers[1]).map((e, i) => (
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
                            {game_matrix[0].lotto_dice.controllers.row_one.map((e, i) => (
                                <button
                                    key={i}
                                    className="left-controller"
                                    disabled={e.disabled}
                                    onClick={() => handleBetTypeClick("Big Dice", e.name)}
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                        <div className="left-controllers-row-two">
                            {game_matrix[0].lotto_dice.controllers.row_two.map((e, i) => {
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
                                    onClick={() => handleBetTypeClick("Big Dice", e.name)}
                                >
                                    {e.name}
                                </button>
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart View */}
            <div className="right">
                <div className="head">
                    <div className="left-text">Selected bets</div>
                    <div className="right-text">{bets.length}/1000</div>
                </div>
                <div className="selected-cart step-4">
                    {
                        betsWithLiveDiscount.length <= 0 && <div className="empty">Empty Cart!<PiEmpty className="empty-icon" /></div>
                    }
                    {betsWithLiveDiscount.map((e, i) => (
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
                                    <div>{e.bonus ? <div style={{padding: "0px 10px", borderRadius: "10px", outline: "1px solid blue", backgroundColor: "lightblue", fontWeight: 500, fontSize: 12, textAlign: "center", marginTop: "5px"}}>Bonus</div> : null}</div>
                                </div>
                                <div className="bet-right">
                                    <div className="left">
                                        ${e.effectiveStake.toFixed(2)}
                                        {!e.bonus && e.liveDiscount > 0 && !addToWinningAmount && (
                                            <span style={{ fontSize: 10, color: 'red', textDecoration: 'line-through' }}>
                                                {' '}${e.amount.toFixed(2)}
                                            </span>
                                        )}
                                         {addToWinningAmount && e.liveDiscount > 0 && (
                                            <span style={{ fontSize: 10, color: 'green' }}>
                                                {' '}+${e.liveDiscount.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="right">/${(calculateWinnings(e)).toFixed(2)}</div>
                                </div>
                                <button className="delete" onClick={() => removeBet(i)}>
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
                    <button className="submit step-5" onClick={onSubmit}>SUBMIT</button>
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
                            {tempBetData && price >= 5 && (
                                <div className="discount">
                                    <b>Hey!</b> You will earn a discount of <b>${getPotentialDiscountInfo(price, tempBetData.bet_type).earnedDiscount.toFixed(2)}</b>!
                                </div>
                            )}
                            
                            {!freePlay ? (
                                <div className="bet-price-selection">
                                    <button onClick={() => price > 1 && setPrice(price - 1)}>${price - 1}</button>
                                    <div className="input">
                                        ${price}
                                    </div>
                                    <button onClick={() => price < cdd.balance && setPrice(price + 1)}>${price + 1}</button>
                                </div>
                            ) : (
                                <div className="bet-price-selection">
                                    <div style={{
                                        height: "100%",
                                        backgroundColor: "yellow",
                                        padding: "15px",
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        outline: "2px solid black"
                                    }}>
                                        FREE PLAY (Available: ${totalAvailableDiscount.toFixed(2)})
                                    </div>

                                    <button onClick={() => usedDiscountAmount > 0 && setUsedDiscountAmount(prev => parseFloat(Math.max(0, prev - 0.1).toFixed(2)))}>
                                        -
                                    </button>

                                    <div className="input">${usedDiscountAmount.toFixed(2)}</div>

                                    <button onClick={() => usedDiscountAmount < totalAvailableDiscount && setUsedDiscountAmount(prev => parseFloat(Math.min(totalAvailableDiscount, prev + 0.1).toFixed(2)))}>
                                        +
                                    </button>
                                </div>
                            )}

                            {!freePlay && (
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
                            )}

                            <div className="popup-buttons">
                                {!freePlay ? (
                                    <button className="submit" onClick={confirmBet}>Submit</button>
                                ) : (
                                    tempBetData?.bet_type === "C2+C3" ? (
                                        <button className="cancel" disabled>Discount not applicable for C2+C3</button>
                                    ) : (
                                        <button className="bonus step-3" onClick={confirmBetWithDiscount}>
                                            Use Bonus ${usedDiscountAmount.toFixed(2)}
                                        </button>
                                    )
                                )}
                                <button className="cancel" onClick={cancelBet}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}