import React, { useState } from 'react';
import './scss/Pick2.scss';

const INITIAL_LINE = { number: '', stake: 2 };

function Pick2Game({ apiUrl = 'http://localhost:5000/api/tickets', storeId = null, gameId = 5, drawId = null }) {
  const [lines, setLines] = useState([INITIAL_LINE]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const total = lines.length * INITIAL_LINE.stake;

  function updateLine(idx, value) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, number: value } : l));
  }

  function addLine() {
    setLines(prev => [...prev, INITIAL_LINE]);
  }

  function removeLine(idx) {
    setLines(prev => prev.filter((_, i) => i !== idx));
  }

  function validate() {
    if (lines.length === 0) return 'Add at least one line.';
    for (const [i, l] of lines.entries()) {
      if (!/^\d{2}$/.test(l.number)) {
        return `Line ${i + 1}: enter exactly two digits (00-99).`;
      }
    }
    return null;
  }

  async function placeBet() {
    setMessage(null);
    const err = validate();
    if (err) return setMessage({ type: 'error', text: err });

    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.token}` },
        body: JSON.stringify({
          customer_id: localStorage.guid,
          store_id: storeId,
          game_id: gameId,
          draw_id: drawId,
          lines: lines.map(l => ({ bet_type: 'PICK2', numbers: String(l.number).split("").map(Number), stake: l.stake })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Purchase failed.' });
      } else {
        setMessage({ type: 'success', text: `Ticket ${data.serial} purchased. Total: $${total}` });
        setLines([INITIAL_LINE]);
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Network error.' });
    }
    setLoading(false);
  }

  return (
    <div className="pick2-root">
      <h2>Pick-2 Game</h2>
      <div className="summary">Total: <strong>${total}</strong></div>

      {lines.map((l, idx) => (
        <div className="line" key={idx}>
          <input type="text" maxLength="2" placeholder="00-99"
            value={l.number} onChange={e => updateLine(idx, e.target.value)} />
          <span className="stake">${l.stake}</span>
          <div className="actions">
            <button onClick={addLine}>＋</button>
            {lines.length > 1 && <button className="danger" onClick={() => removeLine(idx)}>−</button>}
          </div>
        </div>
      ))}

      <div className="controls">
        <button className="primary" onClick={placeBet} disabled={loading}>
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
      </div>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="rules">
        <h4>Rules & Payouts</h4>
        <ul>
          <li>Pick a two-digit number (00–99).</li>
          <li>Cost: $2 per play.</li>
          <li>Exact two-digit match pays $99.</li>
          <li>Match → first digit only pays $2.</li>
          <li>Draws occur twice daily (midday & evening).</li>
        </ul>
      </div>
    </div>
  );
}

export default Pick2Game;