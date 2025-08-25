import React, { useState } from "react";
import "./scss/Pick2.scss";

const INITIAL_LINE = { number1: null, number2: null, stake: 1, type: "STRAIGHT" };

export default function Pick2Game({
  apiUrl = "http://localhost:5000/api/tickets",
  customerId = localStorage.guid,
  storeId = null,
  gameId = 5,
  drawId = null,
}) {
  const [lines, setLines] = useState([INITIAL_LINE]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const total = lines.reduce((sum, l) => sum + (l.stake || 1), 0);

  function updateLine(idx, field, value) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  }

  function addLine() {
    setLines((prev) => [...prev, INITIAL_LINE]);
  }

  function removeLine(idx) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function autoPick(idx) {
    const n1 = Math.floor(Math.random() * 10);
    let n2 = Math.floor(Math.random() * 10);
    while (n2 === n1) {
      n2 = Math.floor(Math.random() * 10); // avoid duplicate for fun
    }
    updateLine(idx, "number1", n1);
    updateLine(idx, "number2", n2);
  }

  function validate() {
    if (lines.length === 0) return "Add at least one line.";
    for (const [i, l] of lines.entries()) {
      if (l.number1 === null || l.number2 === null) {
        return `Line ${i + 1}: select two numbers (0–9).`;
      }
    }
    return null;
  }

  async function placeBet() {
    setMessage(null);
    const err = validate();
    if (err) return setMessage({ type: "error", text: err });

    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.token}`,
        },
        body: JSON.stringify({
          customer_id: customerId,
          store_id: storeId,
          game_id: gameId,
          draw_id: drawId,
          lines: lines.map((l) => ({
            bet_type: "PICK2",
            numbers: `${l.number1}-${l.number2}`,
            stake: l.stake,
            play_type: l.type,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Purchase failed." });
      } else {
        setMessage({
          type: "success",
          text: `Ticket ${data.serial} purchased. Total: $${total}`,
        });
        setLines([INITIAL_LINE]);
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Network error." });
    }
    setLoading(false);
  }

  function renderNumberRow(idx, field, selected) {
    return (
      <div className="number-row">
        {[...Array(10).keys()].map((num) => (
          <button
            key={num}
            className={`num-btn ${selected === num ? "selected" : ""}`}
            onClick={() => updateLine(idx, field, num)}
          >
            {num}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="pick2-root">
      <h2 className="title">Pick-2 Game</h2>
      <div className="pick2-container">
        {/* Left Side Inputs */}
        <div className="pick2-left">
          {lines.map((l, idx) => (
            <div className="line-inputs card" key={idx}>
              <div className="num-section">
                <span className="label">Select Number 1</span>
                {renderNumberRow(idx, "number1", l.number1)}
              </div>
              <div className="num-section">
                <span className="label">Select Number 2</span>
                {renderNumberRow(idx, "number2", l.number2)}
              </div>

              <div className="controls">
                <label>
                  <span>Play Type</span>
                  <select
                    value={l.type}
                    onChange={(e) => updateLine(idx, "type", e.target.value)}
                  >
                    <option value="STRAIGHT">Straight</option>
                    <option value="BOX">Box</option>
                  </select>
                </label>

                <button className="btn auto" onClick={() => autoPick(idx)}>
                  🎲 Auto Pick
                </button>
              </div>

              {lines.length > 1 && (
                <button className="btn danger" onClick={() => removeLine(idx)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="btn add" onClick={addLine}>
            ＋ Add Line
          </button>
        </div>

        {/* Right Side Cart */}
        <div className="pick2-cart card">
          <h3>Cart</h3>
          <ul>
            {lines.map((l, idx) => (
              <li key={idx}>
                {l.number1 !== null ? l.number1 : "?"}-
                {l.number2 !== null ? l.number2 : "?"} ({l.type}) | ${l.stake}
              </li>
            ))}
          </ul>
          <div className="summary">
            Total: <strong>${total}</strong>
          </div>
          <button
            className="btn primary"
            onClick={placeBet}
            disabled={loading}
          >
            {loading ? "Placing..." : "Place Bet"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="rules card">
        <h4>Rules & Payouts</h4>
        <ul>
          <li>Pick exactly 2 numbers between 0 and 9.</li>
          <li>Cost: $1 per play.</li>
          <li>Straight win (exact order) pays $50.</li>
          <li>Box win (any order) pays $25.</li>
          <li>Draws occur twice daily (midday & evening).</li>
        </ul>
      </div>
    </div>
  );
}