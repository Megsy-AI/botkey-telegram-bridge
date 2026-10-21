import { ORAI_JETTON, GRAM_ADDRESS, MARKET_MAX_AGE } from "./config";
export async function marketSnapshot(db: any, force = false) {
  const { data: cached } = await db.from("market_snapshots").select("*").eq("id", "orai").maybeSingle();
  if (!force && cached && Date.now() - new Date(cached.updated_at).getTime() < MARKET_MAX_AGE) return cached.data;
  const get = async (addr: string) => {
    const response = await fetch(`https://api.ston.fi/v1/assets/${addr}`);
    if (!response.ok) throw new Error(`STON price unavailable [${response.status}]`);
    const json = await response.json() as any;
    const asset = json.asset ?? {};
    return { symbol: asset.symbol ?? "", name: asset.display_name ?? "", image: asset.image_url ?? "", priceUsd: Number(asset.dex_price_usd || asset.third_party_price_usd || 0) };
  };
  try {
    const [orai, gram] = await Promise.all([get(ORAI_JETTON), get(GRAM_ADDRESS)]);
    if (!Number.isFinite(orai.priceUsd) || orai.priceUsd <= 0) throw new Error("ORAI price unavailable");
    const result = { orai: { ...orai, symbol: "ORAI", name: orai.name || "Orange AI" }, gram: { ...gram, symbol: "GRAM", name: "Gram" }, updatedAt: new Date().toISOString(), stale: false };
    const { error } = await db.from("market_snapshots").upsert({ id: "orai", data: result, updated_at: result.updatedAt });
    if (error) throw new Error(error.message);
    return result;
  } catch (error) {
    console.error("Market refresh failed", error);
    if (cached) return { ...cached.data, stale: true };
    return { orai: { symbol: "ORAI", name: "Orange AI", image: "", priceUsd: 0 }, gram: { symbol: "GRAM", name: "Gram", image: "", priceUsd: 0 }, updatedAt: null, stale: true };
  }
}
