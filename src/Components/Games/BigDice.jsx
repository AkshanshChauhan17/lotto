import { useState } from "react";
import { game_matrix } from "../../data/game_init";

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export default function BigDice() {
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const handleSelect = (num) => {
        if (selectedNumbers.includes(num)) {
            const updated = selectedNumbers.filter(n => n !== num);
            setSelectedNumbers(updated);
        } else {
            if (selectedNumbers.length >= 10) {
                alert("You can only select up to 10 numbers.");
                return;
            }
            const updated = [...selectedNumbers, num];
            setSelectedNumbers(updated);
        }
    };


    return <div className="big-dice">
        <div className="left-top">
            <div className="head">
                <div className="smt">Choose any number</div>
                <div className="smt">{selectedNumbers.length}/10</div>
            </div>
            <div className="left-matrix">
                {
                    range(game_matrix[0].big_dice.clickable_numbers[0], game_matrix[0].big_dice.clickable_numbers[1]).map((e, i) => {
                        return <button className="matrix-selector" style={{backgroundColor: selectedNumbers.find((v)=>{return v===e}) && "#1CA5FB", color: selectedNumbers.find((v)=>{return v===e}) && "white"}} key={i} onClick={() => handleSelect(e)}>{e}</button>
                    })
                }
                {
                    range(game_matrix[0].big_dice.disabled_numbers[0], game_matrix[0].big_dice.disabled_numbers[1]).map((e, i) => {
                        return <button className="matrix-selector" key={i} disabled>{e}</button>
                    })
                }
            </div>
        </div>
    </div>
}