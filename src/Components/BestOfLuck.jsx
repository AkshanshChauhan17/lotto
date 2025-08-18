import { useEffect, useState } from "react";

export default function BestOfLuckPopup({ show, onClose }) {
  const [seconds, setSeconds] = useState(7);

  useEffect(() => {
    if (show) {
      setSeconds(7);
      const interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="luck-overlay">
      <div className="luck-card">
        <div className="countdown">
          ⏳ Please wait until <strong>{seconds}s</strong>
        </div>
        <h2>🍀 Best of Luck!</h2>
        <p>Your bet has been placed successfully.</p>
      </div>
    </div>
  );
}