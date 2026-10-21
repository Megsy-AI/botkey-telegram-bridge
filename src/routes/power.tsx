import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getMarket, verifyHoldings } from "@/lib/api.functions";
import { POWER_LEVELS, SWAP_URL } from "@/lib/config";
import { openLink } from "@/lib/telegram";
import { fmt } from "@/lib/ton";
import { GhostButton, PrimaryButton, Title } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export const Route = createFileRoute("/power")({ ssr: false, head: () => ({ meta: [
 { title: "Orange — Holding power" }, { name: "description", content: "ORAI holding tiers from $0.10 to $10,000, with automatic mining power." }, { property: "og:title", content: "Orange Holding Power" }, { property: "og:description", content: "ORAI holding tiers from $0.10 to $10,000, with automatic mining power." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Power });
function Power() {
 const { data, t, x, demo, initData, patchMe } = useStore();
 const [price, setPrice] = useState(0), [updated, setUpdated] = useState<string | null>(null), [busy, setBusy] = useState(false), [visible, setVisible] = useState(24), [search, setSearch] = useState("");
 const [selected, setSelected] = useState<(typeof POWER_LEVELS)[number] | null>(null);
 useEffect(() => {
   let active = true;
   async function check() { if (demo) return; setBusy(true); try { const result = await verifyHoldings({ data: { initData } }); if (active) { patchMe(result); setPrice(result.market.orai.priceUsd); setUpdated(result.market.updatedAt); if (result.syncUnavailable) toast(x("priceUnavailable")); } } catch { if (active) toast.error(x("priceUnavailable")); } finally { if (active) setBusy(false); } }
   void check(); const timer = setInterval(check, 3600000); window.addEventListener("focus", check);
   return () => { active = false; clearInterval(timer); window.removeEventListener("focus", check); };
 }, [demo, initData]);
 if (!data) return null;
 const me = data.me;
 const tiers = POWER_LEVELS.slice(1).filter(l => !search || String(l.price).includes(search)).slice(0, visible);
 return <div><Title>{t("miningPower")}</Title>
   <div className="mb-5 flex justify-between border-b border-input pb-5"><div><div className="text-xs text-muted-foreground">{t("current")}</div><div className="mt-1 text-3xl">{t("level")} {me.power_level}</div></div><div className="text-end"><div className="text-xs text-muted-foreground">{x("dailyReward")}</div><div className="mt-1 text-2xl text-primary">${fmt(POWER_LEVELS[me.power_level]?.perDay ?? 0, 2)}</div></div></div>
   <PrimaryButton onClick={() => openLink(SWAP_URL)}>{t("buyOnSton")}</PrimaryButton>
   <div className="my-3 text-xs text-muted-foreground">{busy ? x("checking") : price > 0 ? `1 ORAI = $${fmt(price, 8)} · ${x("updated")} ${updated ? new Date(updated).toLocaleTimeString() : "—"}` : x("priceUnavailable")}</div>
   <input aria-label={x("searchLevels")} placeholder={x("searchLevels")} value={search} onChange={e => { setSearch(e.target.value); setVisible(24); }} inputMode="decimal" className="mb-4 h-12 w-full rounded-xl border border-input bg-card px-4 outline-none focus:ring-2 focus:ring-primary" />
   <div className="mb-2 grid grid-cols-[1fr_1fr] px-3 text-xs text-muted-foreground"><span>{x("requiredHoldings")}</span><span className="text-end">{x("dailyReward")}</span></div>
   <div className="space-y-2">{tiers.map(l => <GhostButton key={l.level} onClick={() => setSelected(l)} className={`flex h-auto min-h-20 w-full items-center justify-between rounded-xl px-4 py-3 text-start ${l.level === me.power_level ? "ring-2 ring-primary" : ""}`}><div><div className="text-xs text-muted-foreground">{t("level")} {l.level}{l.level === me.power_level ? ` · ${t("current")}` : ""}</div><div className="mt-1 text-xl">${fmt(l.price, 2)}</div><div className="mt-1 text-xs text-muted-foreground">{price > 0 ? `${fmt(l.price / price, 2)} ORAI` : "— ORAI"}</div></div><div className="text-end"><div className="text-lg text-primary">${fmt(l.perDay, 2)}</div><div className="mt-1 text-xs text-muted-foreground">{t("perDay")}</div></div></GhostButton>)}</div>
   {tiers.length >= visible && <GhostButton className="mt-4 w-full" onClick={() => setVisible(v => v + 24)}>{x("loadMore")}</GhostButton>}
   <p className="mt-4 text-xs text-muted-foreground">{x("estimate")}</p>
   <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent><DialogTitle>{x("buy")} · ${fmt(selected?.price ?? 0, 2)}</DialogTitle><DialogDescription>{x("buyAmount")}</DialogDescription><div className="break-all text-2xl">{price > 0 ? `${fmt((selected?.price ?? 0) / price, 4)} ORAI` : x("priceUnavailable")}</div><PrimaryButton disabled={!price} onClick={async () => { try { await navigator.clipboard.writeText(String((selected?.price ?? 0) / price)); toast(t("copied")); openLink(SWAP_URL); setSelected(null); } catch { toast.error(t("copied")); } }}>{x("copyAmount")}</PrimaryButton></DialogContent></Dialog>
 </div>;
}
