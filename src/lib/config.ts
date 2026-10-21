export const ORAI_JETTON = "EQCY5dx1kTGT-r1RPXA-LTRyv73_LtfcaTl0g1E_WBlRdUyI";
export const GRAM_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const RECEIVE_WALLET = "UQAp1QxnLJ2z44IooUovvtVShw7hJBEdxCRV3RlbCYC3D8qj";
export const PAYOUT_WALLET = "UQA5k2qscmlDz0tYaNMlmhCW5czvc6zMJpB78T4y4GDz9Q5a";
export const CHANNEL_ID = "-1002616088306";
export const SWAP_URL = `https://app.ston.fi/swap?chartVisible=false&ft=TON&tt=${ORAI_JETTON}`;
export const MINING_HOURS = 2;
export const DAILY_YIELD = 0.2;
export const BASE_ORAI_PER_DAY = 0.1;
export const REFERRAL_BONUS = 25;
export const REFERRAL_COMMISSION = 0.10;
export function referralCommission(reward: number) { return reward * REFERRAL_COMMISSION; }
export const MIN_WITHDRAW = 100;
export const DECIMALS = 9;
export const WITHDRAW_FEE_GRAM = 0.15;
export const ADMIN_USERNAMES = ["eigiza"];
export const NFT_COLLECTION_ADDRESS = "";
export const NFT_PRICE_GRAM = 1;
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
