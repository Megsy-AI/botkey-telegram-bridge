import { describe, it, expect } from "vitest";
import { sessionReward, levelForHoldings, POWER_LEVELS, MINING_HOURS } from "./config";

describe("mining rules", () => {
  it("a mining session lasts 6 hours", () => expect(MINING_HOURS).toBe(6));
  it("power ranges from 0.1 to 10,000 per day", () => {
    expect(POWER_LEVELS[0].perDay).toBe(0.1);
    expect(POWER_LEVELS.at(-1)!.perDay).toBe(10000);
  });
  it("session reward is a quarter of the daily rate", () => expect(sessionReward(2)).toBe(0.25));
  it("holdings unlock the matching level", () => {
    expect(levelForHoldings(0)).toBe(0);
    expect(levelForHoldings(30)).toBe(2);
  });
});
