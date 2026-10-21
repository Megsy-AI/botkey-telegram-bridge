import "@/lib/buffer-polyfill";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toNano } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useStore } from "@/lib/store";
import { verifyHoldings, buyNft, myNfts } from "@/lib/api.functions";
import { POWER_LEVELS, SWAP_URL, NFT_TIERS, NFT_COLLECTION_URL, RECEIVE_WALLET } from "@/lib/config";
import nft1 from "@/assets/nft/tier1.jpg";
import nft2 from "@/assets/nft/tier2.jpg";
import nft3 from "@/assets/nft/tier3.jpg";
import nft4 from "@/assets/nft/tier4.jpg";
import nft5 from "@/assets/nft/tier5.jpg";
import nft6 from "@/assets/nft/tier6.jpg";
import nft7 from "@/assets/nft/tier7.jpg";
import nft8 from "@/assets/nft/tier8.jpg";
import nft9 from "@/assets/nft/tier9.jpg";
import nft10 from "@/assets/nft/tier10.jpg";
import { openLink, haptic } from "@/lib/telegram";
import { fmt, commentPayload } from "@/lib/ton";
import { Card, CoinIcon, GhostButton, GRAM_ICON, PrimaryButton } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/power")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ tab: s["tab"] === "nft" ? ("nft" as const) : ("power" as const) }),
  head: () => ({ meta: [
    { title: "Orange — Holding power & NFT" },
    { name: "description", content: "Holding-based mining power tiers and ORAI NFT characters with mining, referral and task boosts." },
    { property: "og:title", content: "Orange — Holding power & NFT" },
    { property: "og:description", content: "Holding-based mining power tiers and ORAI NFT characters with mining, referral and task boosts." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Power,
});

const NFT_IMAGES = [nft1, nft2, nft3, nft4, nft5, nft6, nft7, nft8, nft9, nft10];

function NftTab() {
  const { data, t, initData, demo, lang } = useStore();
  const me = data!.me;
  const ar = lang === "ar";
  const address = useTonAddress();
  const [tc] = useTonConnectUI();
  const [owned, setOwned] = useState<any[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const load = () => { if (!demo) myNfts({ data: { initData } }).then((r) => setOwned(r.nfts)).catch(() => {}); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ownedTiers = owned.map((n) => n.tier);
  async function buy(tier: (typeof NFT_TIERS)[number]) {
    if (demo) { toast(t("openInTelegram")); return; }
    if (!address) { tc.openModal(); return; }
    setBusy(tier.tier);
    try {
      await tc.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: RECEIVE_WALLET, amount: toNano(tier.price.toString()).toString(), payload: commentPayload(`nft:${me.id}:${tier.tier}`) }],
      });
      toast(t("pending"));
      await new Promise((r) => setTimeout(r, 12000));
      await buyNft({ data: { initData, tier: tier.tier } });
      haptic("success");
      toast.success(t("done"));
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {NFT_TIERS.map((n) => (
          <Card key={n.tier} className={`overflow-hidden p-0 ${ownedTiers.includes(n.tier) ? "ring-2 ring-primary" : ""}`}>
            <img src={NFT_IMAGES[n.tier - 1]} alt={n.name} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="space-y-1 p-3">
              <div className="text-sm font-bold leading-tight">{n.name}</div>
              <div className="text-xs text-muted-foreground">{ar ? "تعدين" : "Mining"} +{Math.round(n.mining * 100)}%</div>
              <div className="text-xs text-muted-foreground">{ar ? "إحالة" : "Referral"} +{Math.round(n.referral * 100)}%</div>
              <div className="text-xs text-muted-foreground">{ar ? "مهام" : "Tasks"} ×{n.tasks}</div>
              <PrimaryButton className="mt-2 h-10 w-full text-sm" onClick={() => buy(n)} disabled={busy !== null}>
                {busy === n.tier ? "…" : <span className="flex items-center justify-center gap-1"><CoinIcon src={GRAM_ICON} className="size-4" />{n.price} GRAM</span>}
              </PrimaryButton>
            </div>
          </Card>
        ))}
      </div>
      <GhostButton className="w-full" onClick={() => openLink(NFT_COLLECTION_URL)}>Getgems</GhostButton>
      <p className="text-xs text-muted-foreground">{ar ? "المزايا حسب أعلى فئة تملكها، وليست ضمانًا لأرباح." : "Perks follow your highest owned tier and are not a guaranteed return."}</p>
    </div>
  );
}


      {owned.length > 0 && (
        <Card>
          {owned.map((n) => (
            <div key={n.id} className="flex justify-between border-t border-muted py-2 text-sm first:border-0">
              <span>ORAI NFT #{n.item_index}</span>
              <span className="text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Power() {
  const { data, t, x, demo, initData, patchMe } = useStore();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [gramPrice, setGramPrice] = useState(0);
  const [visible, setVisible] = useState(24);
  const [selected, setSelected] = useState<(typeof POWER_LEVELS)[number] | null>(null);

  useEffect(() => {
    if (demo) return;
    let active = true;
    async function check() {
      try {
        const result = await verifyHoldings({ data: { initData } });
        if (active) { patchMe(result); setGramPrice(Number(result.market?.gram?.priceUsd) || 0); }
      } catch { /* silent auto-check */ }
    }
    void check();
    const timer = setInterval(check, 3600000);
    window.addEventListener("focus", check);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", check); };
  }, [demo, initData]);

  if (!data) return null;
  const me = data.me;
  const tiers = POWER_LEVELS.slice(1).slice(0, visible);
  const gramAmount = selected && gramPrice > 0 ? selected.price / gramPrice : 0;

  return <div>
    <div className="glass mb-4 grid grid-cols-2 rounded-2xl p-1">
      {(["power", "nft"] as const).map((k) => (
        <button key={k} onClick={() => navigate({ to: "/power", search: { tab: k }, replace: true })}
          className={`h-10 rounded-xl text-sm transition ${tab === k ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
          {k === "power" ? t("power") : "NFT"}
        </button>
      ))}
    </div>

    {tab === "nft" ? <NftTab /> : <>
      <PrimaryButton onClick={() => openLink(SWAP_URL)}>{t("buyOnSton")}</PrimaryButton>
      <div className="mb-2 mt-5 grid grid-cols-[1fr_1fr] px-3 text-xs text-muted-foreground"><span>{x("requiredHoldings")}</span><span className="text-end">{x("dailyReward")}</span></div>
      <div className="space-y-2">{tiers.map(l => <GhostButton key={l.level} onClick={() => setSelected(l)} className={`flex h-auto min-h-16 w-full items-center justify-between rounded-xl px-4 py-3 text-start ${l.level === me.power_level ? "ring-2 ring-primary" : ""}`}><div className="text-xl">${fmt(l.price, 2)}</div><div className="text-end"><div className="text-lg text-primary">${fmt(l.perDay, 2)}</div><div className="mt-1 text-xs text-muted-foreground">{t("perDay")}</div></div></GhostButton>)}</div>
      {POWER_LEVELS.length - 1 > visible && <GhostButton className="mt-4 w-full" onClick={() => setVisible(v => v + 24)}>{x("loadMore")}</GhostButton>}
      <p className="mt-4 text-xs text-muted-foreground">{x("estimate")}</p>
      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogTitle>{x("buy")} · ${fmt(selected?.price ?? 0, 2)}</DialogTitle>
          <DialogDescription>{x("gramAmount")}</DialogDescription>
          <div className="flex items-center justify-center gap-2 break-all text-2xl"><CoinIcon src={GRAM_ICON} className="size-7" />{gramAmount > 0 ? fmt(gramAmount, 4) : "—"}</div>
          <PrimaryButton disabled={!(gramAmount > 0)} onClick={async () => { try { await navigator.clipboard.writeText(gramAmount.toFixed(4)); toast(t("copied")); openLink(SWAP_URL); setSelected(null); } catch { openLink(SWAP_URL); setSelected(null); } }}>{x("payWithGram")}</PrimaryButton>
        </DialogContent>
      </Dialog>
    </>}
  </div>;
}
