export const ORAI_JETTON = "EQCY5dx1kTGT-r1RPXA-LTRyv73_LtfcaTl0g1E_WBlRdUyI";
export const GRAM_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const RECEIVE_WALLET = "UQAp1QxnLJ2z44IooUovvtVShw7hJBEdxCRV3RlbCYC3D8qj";
export const PAYOUT_WALLET = "UQA5k2qscmlDz0tYaNMlmhCW5czvc6zMJpB78T4y4GDz9Q5a";
export const CHANNEL_ID = "-1002616088306";
export const SWAP_URL =
  "https://app.ston.fi/swap?chartVisible=false&ft=GRAM&tt=EQCY5dx1kTGT-r1RPXA-LTRyv73_LtfcaTl0g1E_WBlRdUyI";
export const MINING_HOURS = 6;
export const REFERRAL_BONUS = 25;
export const MIN_WITHDRAW = 100;
export const DECIMALS = 9;

/** Mining power levels: ORAI earned per day, and ORAI cost to unlock. */
export const POWER_LEVELS = [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000, 10000].map(
  (perDay, level) => ({ level, perDay, price: level === 0 ? 0 : perDay * 30 }),
);

export function sessionReward(level: number) {
  const l = POWER_LEVELS[Math.min(level, POWER_LEVELS.length - 1)];
  return (l.perDay * MINING_HOURS) / 24;
}

/** Highest level whose price is covered by an on-chain ORAI holding. */
export function levelForHoldings(holdings: number) {
  let lvl = 0;
  for (const l of POWER_LEVELS) if (l.price <= holdings) lvl = l.level;
  return lvl;
}
