import { describe, it, expect } from "vitest";
import { POWER_LEVELS, MINING_HOURS, levelForHoldings, dailyOrai, miningAccrued, holdingsPower, isAdminUsername, referralCommission } from "./config";
describe("Orange holding and mining rules", () => {
  it("referrers earn an additional 10% without deducting invitee rewards", () => { const reward = 100; expect(referralCommission(reward)).toBe(10); expect(reward).toBe(100); });
  it("caps accumulation at two hours", () => { expect(MINING_HOURS).toBe(2); expect(miningAccrued(0, 10 * 3600_000, 24)).toBe(2); });
  it("starts paid tiers at $0.10, $0.15 and $0.20", () => expect(POWER_LEVELS.slice(1, 4).map(t => t.price)).toEqual([0.1, 0.15, 0.2]));
  it("ends tiers at $10,000", () => expect(POWER_LEVELS.at(-1)?.price).toBe(10000));
  it("$10 holdings earn $2 daily in ORAI", () => { const level = levelForHoldings(100, 0.1); expect(dailyOrai(level, 0.1)).toBe(20); expect(dailyOrai(level, 0.1) * 0.1).toBe(2); });
  it("combines app and external holdings without deducting coins", () => { const result = holdingsPower(50, 50, 0.1); expect(result.balance).toBe(50); expect(result.holdings).toBe(100); expect(POWER_LEVELS[result.power_level]?.price).toBe(10); });
  it("automatically downgrades when holdings fall", () => expect(levelForHoldings(10, 0.1)).toBeLessThan(levelForHoldings(100, 0.1)));
  it("admin command authorization allows only configured username", () => { expect(isAdminUsername("eIgiza")).toBe(true); expect(isAdminUsername("guest")).toBe(false); });
});

import { NFT_TIERS, nftBenefits } from "./config";
describe("NFT tiers", () => {
  it("has 10 tiers with rising price and mining boost", () => {
    expect(NFT_TIERS).toHaveLength(10);
    for (let i = 1; i < 10; i++) { expect(NFT_TIERS[i]!.price).toBeGreaterThan(NFT_TIERS[i - 1]!.price); expect(NFT_TIERS[i]!.mining).toBeGreaterThan(NFT_TIERS[i - 1]!.mining); }
  });
  it("uses the best owned tier, not stacking", () => {
    expect(nftBenefits([])).toEqual({ mining: 1, referralRate: 0.1, tasks: 1 });
    const b = nftBenefits([1, 10]);
    expect(b.mining).toBeCloseTo(3.5); expect(b.referralRate).toBeCloseTo(0.25); expect(b.tasks).toBe(2.5);
  });
});
