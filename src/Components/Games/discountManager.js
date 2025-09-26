// discountManager.js
export const discountRules = {
    C1: 0.10,
    C2: 0.10,
    C3: 0.20,
    C4: 0.10,
    BONUS: 0.10,
    "C2+C3": 0.15
};

// Calculate discount for a single bet
export function calculateBetDiscount(bet) {
    if (!bet || bet.bonus) return 0;
    const rate = discountRules[bet.bet_type] || 0;
    const amount = Number(bet.amount) || 0;
    if (rate > 0 && amount >= 5) return parseFloat((amount * rate).toFixed(2));
    return 0;
}

// Calculate total discount for cart
export function calculateCartDiscount(bets) {
    if (!Array.isArray(bets)) return 0;
    return parseFloat(
        bets.reduce((total, bet) => total + calculateBetDiscount(bet), 0).toFixed(2)
    );
}

// Apply discount to a price
export function applyDiscountToPrice(price, discount) {
    return parseFloat((price + discount).toFixed(2));
}