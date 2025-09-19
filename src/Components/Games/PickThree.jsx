import React, { useState } from "react";
import "./scss/Pick3.scss";
import { toast } from "react-toastify";

const INITIAL_LINE = {
  number1: null,
  number2: null,
  number3: null,
  stake: 1,
  type: "STRAIGHT",
};

export default function Pick3Game({
  apiUrl = "http://localhost:5000/api/tickets",
  customerId = localStorage.guid,
  storeId = null,
  gameId = 6,
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
    const nums = [];
    while (nums.length < 3) {
      const n = Math.floor(Math.random() * 10);
      if (!nums.includes(n)) nums.push(n);
    }
    updateLine(idx, "number1", nums[0]);
    updateLine(idx, "number2", nums[1]);
    updateLine(idx, "number3", nums[2]);
  }

  function validate() {
    if (lines.length === 0) return "Add at least one line.";
    for (const [i, l] of lines.entries()) {
      if (l.number1 === null || l.number2 === null || l.number3 === null) {
        return `Line ${i + 1}: select three numbers (0–9).`;
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
            bet_type: "PICK3",
            numbers: `${l.number1},${l.number2},${l.number3}`,
            stake: l.stake,
            inner_type: l.type,
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
        toast.success(`Ticket ${data.serial} purchased. Total: $${total}`);
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

  function renderNumberRowDummy() {
    return (
      <div className="number-row">
        {[...Array(10).keys()].map(() => (
          <button className="num-btn">-</button>
        ))}
      </div>
    );
  }

  return (
    <div className="pick3-root">
      <h2 className="title">Pick-3 Game</h2>
      <div className="pick3-container">
        {/* Left Side Inputs */}
        <div className="pick3-left">
          {lines.map((l, idx) => (
            <div className="line-inputs card" key={idx}>
              <div className="lines">
                <div className="num-section">
                  <span className="label">{l.number1 || l.number1 === 0 ? 1 : 0}/1</span>
                  {renderNumberRow(idx, "number1", l.number1)}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
                <div className="num-section">
                  <span className="label">{l.number2 || l.number2 === 0 ? 1 : 0}/1</span>
                  {renderNumberRow(idx, "number2", l.number2)}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
                <div className="num-section">
                  <span className="label">{l.number3 || l.number3 === 0 ? 1 : 0}/1</span>
                  {renderNumberRow(idx, "number3", l.number3)}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
                <div className="num-section x">
                  <span className="label">--------</span>
                  {renderNumberRowDummy()}
                </div>
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
        <div className="pick3-cart card">
          <h3>Cart</h3>
          <ul>
            {lines.map((l, idx) => (
              <li key={idx}>
                {l.number1 !== null ? l.number1 : "?"}-
                {l.number2 !== null ? l.number2 : "?"}-
                {l.number3 !== null ? l.number3 : "?"} ({l.type}) | ${l.stake}
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
          <li>Pick exactly 3 numbers between 0 and 9.</li>
          <li>Cost: $1 per play.</li>
          <li>Straight win (exact order) pays $500.</li>
          <li>Box win (any order) pays $160.</li>
          <li>Draws occur twice daily (midday & evening).</li>
        </ul>
      </div>
    </div>
  );
}
