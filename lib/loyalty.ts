import type { LoyaltyConfig } from "@/types/config";

/**
 * Calculate how many FCC Coins a customer earns for a given order total.
 * @param orderTotal - Total paid in INR (after discounts + coin redemption)
 * @param config - LoyaltyConfig from Firestore
 */
export function calculateCoinsEarned(
  orderTotal: number,
  config: LoyaltyConfig,
): number {
  if (!config.active || orderTotal <= 0) return 0;
  // coinsPerRupee: e.g. 0.01 = 1 coin per ₹100
  return Math.floor(orderTotal * config.coinsPerRupee);
}

/**
 * Calculate the maximum number of coins a user is allowed to redeem on an order.
 * Respects minCoinsToRedeem and maxRedeemPercent caps.
 *
 * @param userCoins   - Coins the user currently holds
 * @param orderTotal  - Order total in INR (after any discount codes)
 * @param config      - LoyaltyConfig from Firestore
 * @returns Maximum number of coins that may be redeemed
 */
export function calculateMaxRedeemable(
  userCoins: number,
  orderTotal: number,
  config: LoyaltyConfig,
): number {
  if (!config.active || userCoins < config.minCoinsToRedeem || orderTotal <= 0) {
    return 0;
  }

  // Maximum discount allowed = a percentage of the order total
  const maxDiscountRupees = Math.floor(
    (orderTotal * config.maxRedeemPercent) / 100,
  );

  // Convert that maximum rupee discount back to coins
  const maxCoinsByPercent = Math.floor(maxDiscountRupees / config.rupeePerCoin);

  // Can't redeem more than the user has
  return Math.min(userCoins, maxCoinsByPercent);
}

/**
 * Convert coin amount to its INR equivalent.
 * @param coins  - Number of FCC Coins
 * @param config - LoyaltyConfig from Firestore
 * @returns Value in INR (floored to whole rupees)
 */
export function coinsToRupees(coins: number, config: LoyaltyConfig): number {
  if (coins <= 0) return 0;
  return Math.floor(coins * config.rupeePerCoin);
}

/**
 * Calculate the INR discount amount for a given coin redemption.
 * Ensures the discount never exceeds the order total.
 *
 * @param coinsToRedeem - Coins the user wants to redeem
 * @param orderTotal    - Order total in INR (after discount codes)
 * @param config        - LoyaltyConfig from Firestore
 * @returns Discount amount in INR to subtract from orderTotal
 */
export function applyCoinsToOrder(
  coinsToRedeem: number,
  orderTotal: number,
  config: LoyaltyConfig,
): number {
  if (!config.active || coinsToRedeem <= 0 || orderTotal <= 0) return 0;
  const discount = coinsToRupees(coinsToRedeem, config);
  return Math.min(discount, orderTotal);
}
