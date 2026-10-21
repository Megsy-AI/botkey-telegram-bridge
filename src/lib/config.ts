export const ORAI_JETTON = "EQCY5dx1kTGT-r1RPXA-LTRyv73_LtfcaTl0g1E_WBlRdUyI";
export const GRAM_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const RECEIVE_WALLET = "UQAp1QxnLJ2z44IooUovvtVShw7hJBEdxCRV3RlbCYC3D8qj";
export const PAYOUT_WALLET = "UQA5k2qscmlDz0tYaNMlmhCW5czvc6zMJpB78T4y4GDz9Q5a";
export const CHANNEL_ID = "-1002616088306";
export const SWAP_URL = `https://app.ston.fi/swap?chartVisible=false&ft=TON&tt=${ORAI_JETTON}`;
export const MINING_HOURS = 2;
export const DAILY_YIELD = 0.5;
export const BASE_ORAI_PER_DAY = 0.1;
export const REFERRAL_BONUS = 25;
export const REFERRAL_COMMISSION = 0.10;
export function referralCommission(reward: number) { return reward * REFERRAL_COMMISSION; }
export const MIN_WITHDRAW = 100;
export const DECIMALS = 9;
export const WITHDRAW_FEE_GRAM = 0.15;
export const ADMIN_USERNAMES = ["eigiza"];
export const NFT_COLLECTION_ADDRESS = "EQAUV6nlIAxPqWMy-vpuuTXu14bGyYJjeK7wgiqs0COnbv2X";
export const NFT_COLLECTION_URL = "https://getgems.io/orangeai";
/** Ten NFT tiers paid in GRAM: higher price → bigger mining, referral and task boosts. */
export const NFT_TIERS = [
  { tier: 1, name: "Orange Rookie", price: 2, mining: 0.03, referral: 0.01, tasks: 1.05 },
  { tier: 2, name: "Orange Scout", price: 4, mining: 0.06, referral: 0.02, tasks: 1.10 },
  { tier: 3, name: "Orange Explorer", price: 7, mining: 0.12, referral: 0.03, tasks: 1.20 },
  { tier: 4, name: "Orange Pioneer", price: 12, mining: 0.20, referral: 0.04, tasks: 1.30 },
  { tier: 5, name: "Orange Guardian", price: 20, mining: 0.35, referral: 0.05, tasks: 1.40 },
  { tier: 6, name: "Orange Commander", price: 35, mining: 0.50, referral: 0.06, tasks: 1.50 },
  { tier: 7, name: "Orange Master", price: 60, mining: 0.75, referral: 0.08, tasks: 1.65 },
  { tier: 8, name: "Orange Champion", price: 100, mining: 1.00, referral: 0.10, tasks: 1.80 },
  { tier: 9, name: "Orange Legend", price: 180, mining: 1.50, referral: 0.12, tasks: 2.00 },
  { tier: 10, name: "Cyber Lord", price: 300, mining: 2.50, referral: 0.15, tasks: 2.50 },
];
/** Benefits come from the best owned tier (not stacked). */
export function nftBenefits(tiers: number[]) {
  const best = NFT_TIERS.filter(t => tiers.includes(t.tier)).sort((a, b) => b.tier - a.tier)[0];
  return { mining: 1 + (best?.mining ?? 0), referralRate: REFERRAL_COMMISSION + (best?.referral ?? 0), tasks: best?.tasks ?? 1 };
}
export const NFT_PRICE_GRAM = NFT_TIERS[0]!.price;
export const SUPPORTER_URL = "https://megsyai.com";
export const MARKET_MAX_AGE = 3600_000;
const thresholds: number[] = [];
for (const [start, end, step] of ([[10, 100, 5], [125, 1000, 25], [1250, 10000, 250], [12500, 100000, 2500], [125000, 1000000, 25000]] as [number, number, number][])) {
  for (let cents = start; cents <= end; cents += step) thresholds.push(cents / 100);
}
export const POWER_LEVELS = [{ level: 0, price: 0, perDay: 0 }, ...thresholds.map((price, index) => ({ level: index + 1, price, perDay: price * DAILY_YIELD }))];
export function levelForHoldings(holdings: number, priceUsd = 1) {
  const usd = Math.max(0, holdings) * Math.max(0, priceUsd);
  let level = 0;
  for (const tier of POWER_LEVELS) if (tier.price <= usd + 1e-10) level = tier.level;
  return level;
}
export function dailyOrai(level: number, priceUsd: number) {
  const tier = POWER_LEVELS[level];
  return tier && tier.level > 0 && priceUsd > 0 ? tier.perDay / priceUsd : BASE_ORAI_PER_DAY;
}
export function sessionReward(level: number, priceUsd = 1) { return dailyOrai(level, priceUsd) * MINING_HOURS / 24; }
export function miningAccrued(started: number, now: number, rateDaily: number) {
  return Math.max(0, Math.min(now - started, MINING_HOURS * 3600_000)) / 86400_000 * rateDaily;
}
export function holdingsPower(appOrai: number, externalOrai: number, priceUsd: number) {
  return { balance: appOrai, holdings: Math.max(0, appOrai) + Math.max(0, externalOrai), power_level: levelForHoldings(appOrai + externalOrai, priceUsd) };
}
export function isAdminUsername(username?: string) { return ADMIN_USERNAMES.includes((username ?? "").toLowerCase()); }
