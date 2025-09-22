import React, { useEffect, useState } from "react";

export default function GameHistory({
  apiUrl = "http://72.60.71.162:5000/api/tickets",
  customerId = localStorage.guid,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?customer_id=${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load history");
      setHistory(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="history-root">
      <h2 className="title">My Game History</h2>

      {loading && <div className="loader">Loading history...</div>}
      {error && <div className="message error">{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div className="empty">No tickets found.</div>
      )}

      {!loading && history.length > 0 && (
        <div className="history-table card">
          <table>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Numbers</th>
                <th>Play Type</th>
                <th>Stake</th>
                <th>Total</th>
                <th>Status</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.serial}</td>
                  <td>{h.numbers}</td>
                  <td>{h.play_type}</td>
                  <td>${h.stake}</td>
                  <td>${h.total_amount}</td>
                  <td>
                    <span className={`status ${h.status.toLowerCase()}`}>
                      {h.status}
                    </span>
                  </td>
                  <td>{new Date(h.purchase_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}