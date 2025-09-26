// utils.js
export function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

// Combination formula: n choose k
export function combinations(n, k) {
    if (k > n) return 0;
    let num = 1, den = 1;
    for (let i = 0; i < k; i++) {
        num *= n - i;
        den *= i + 1;
    }
    return num / den;
}

// Round to even
export function makeEven(n) {
    return n % 2 === 0 ? n : n + 1;
}