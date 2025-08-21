import React, { useState } from "react";
import "./scss/Pick3.scss";

const INITIAL_LINE = { number1: "", number2: "", number3: "", stake: 1, type: "STRAIGHT" };

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

  const total = lines.length * INITIAL_LINE.stake;

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

  function validate() {
    if (lines.length === 0) return "Add at least one line.";
    for (const [i, l] of lines.entries()) {
      if (
        !/^[0-9]{1,2}$/.test(l.number1) ||
        !/^[0-9]{1,2}$/.test(l.number2) ||
        !/^[0-9]{1,2}$/.test(l.number3)
      ) {
        return `Line ${i + 1}: select three numbers (0–99).`;
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
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.token}` },
        body: JSON.stringify({
          customer_id: customerId,
          store_id: storeId,
          game_id: gameId,
          draw_id: drawId,
          lines: lines.map((l) => ({
            bet_type: "PICK3",
            numbers: `${l.number1}-${l.number2}-${l.number3}`,
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

  return (
    <div className="pick3-root">
      <h2>Pick-3 Game</h2>
      <div className="pick3-container">
        {/* Left Side Inputs */}
        <div className="pick3-left">
          {lines.map((l, idx) => (
            <div className="line-inputs" key={idx}>
              <label>
                <span>Select Number 1</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={l.number1}
                  onChange={(e) => updateLine(idx, "number1", e.target.value)}
                />
              </label>
              <label>
                <span>Select Number 2</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={l.number2}
                  onChange={(e) => updateLine(idx, "number2", e.target.value)}
                />
              </label>
              <label>
                <span>Select Number 3</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={l.number3}
                  onChange={(e) => updateLine(idx, "number3", e.target.value)}
                />
              </label>
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
        <div className="pick3-cart">
          <h3>Cart</h3>
          <ul>
            {lines.map((l, idx) => (
              <li key={idx}>
                {l.number1}-{l.number2}-{l.number3} ({l.type}) | ${l.stake}
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

      <div className="rules">
        <h4>Rules & Payouts</h4>
        <ul>
          <li>Pick exactly 3 numbers between 0 and 99.</li>
          <li>Cost: $1 per play.</li>
          <li>Straight win (exact order) pays $550.</li>
          <li>Box win (any order) pays $91.</li>
          <li>Draws occur twice daily (midday & evening).</li>
        </ul>
      </div>
    </div>
  );
}