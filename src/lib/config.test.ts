import { describe, it, expect } from "vitest";
import { POWER_LEVELS, MINING_HOURS, levelForHoldings, dailyOrai, miningAccrued, holdingsPower, isAdminUsername } from "./config";
describe("Orange holding and mining rules", () => {
  it("caps accumulation at two hours", () => { expect(MINING_HOURS).toBe(2); expect(miningAccrued(0, 10 * 3600_000, 24)).toBe(2); });
  it("starts paid tiers at $0.10, $0.15 and $0.20", () => expect(POWER_LEVELS.slice(1, 4).map(t => t.price)).toEqual([0.1, 0.15, 0.2]));
  it("ends tiers at $10,000", () => expect(POWER_LEVELS.at(-1)?.price).toBe(10000));
  it("$10 holdings earn $2 daily in ORAI", () => { const level = levelForHoldings(100, 0.1); expect(dailyOrai(level, 0.1)).toBe(20); expect(dailyOrai(level, 0.1) * 0.1).toBe(2); });
  it("combines app and external holdings without deducting coins", () => { const result = holdingsPower(50, 50, 0.1); expect(result.balance).toBe(50); expect(result.holdings).toBe(100); expect(POWER_LEVELS[result.power_level]?.price).toBe(10); });
  it("automatically downgrades when holdings fall", () => expect(levelForHoldings(10, 0.1)).toBeLessThan(levelForHoldings(100, 0.1)));
  it("admin command authorization allows only configured username", () => { expect(isAdminUsername("eIgiza")).toBe(true); expect(isAdminUsername("guest")).toBe(false); });
});
