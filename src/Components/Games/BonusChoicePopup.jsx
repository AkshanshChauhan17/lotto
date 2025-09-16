import React from "react";

export default function BonusChoicePopup({ onUseBonus, onAddToCart, onCancel }) {
  return (
    <div className="bonus-choice-overlay">
      <div className="bonus-choice-popup">
        <h3>Bonus Available 🎉</h3>
        <p>Do you want to play using bonus or just add to cart?</p>
        <div className="bonus-choice-buttons">
          <button className="use-bonus" onClick={onUseBonus}>Use Bonus</button>
          <button className="add-bonus" onClick={onAddToCart}>Add to Cart</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}