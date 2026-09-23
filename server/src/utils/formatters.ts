/**
 * Convert paise to INR currency string e.g. 150000 -> "₹1,500"
 */
export const formatRupees = (paise: number): string => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};

/**
 * Convert paise to numeric rupees (e.g. 150000 -> 1500)
 */
export const paiseToRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Convert rupees to paise integer (e.g. 1500 -> 150000)
 */
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};
