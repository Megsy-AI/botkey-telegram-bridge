import "@/lib/buffer-polyfill";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toNano } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useStore } from "@/lib/store";
import { verifyHoldings, buyNft, myNfts } from "@/lib/api.functions";
import { POWER_LEVELS, SWAP_URL, NFT_TIERS, NFT_COLLECTION_URL, RECEIVE_WALLET } from "@/lib/config";
import nft1 from "@/assets/nft/display1.jpg";
import nft2 from "@/assets/nft/display2.jpg";
import nft3 from "@/assets/nft/display3.jpg";
import nft4 from "@/assets/nft/display4.jpg";
import nft5 from "@/assets/nft/display5.jpg";
import nft6 from "@/assets/nft/display6.jpg";
import nft7 from "@/assets/nft/display7.jpg";
import nft8 from "@/assets/nft/display8.jpg";
import nft9 from "@/assets/nft/display9.jpg";
import nft10 from "@/assets/nft/display10.jpg";
import { ArrowUpRight } from "lucide-react";
import { openLink, haptic } from "@/lib/telegram";
import { fmt, commentPayload } from "@/lib/ton";
import { Card, CoinIcon, GhostButton, GRAM_ICON, PrimaryButton, Segmented } from "@/components/ui-kit";

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
const NFT_DESCRIPTIONS = [
  ["رفيقك الأول في عالم Orange.", "Your first companion in Orange."],
  ["الكشّاف المستعد لرحلة جديدة.", "A scout ready for a new journey."],
  ["مستكشف بروح المغامرة.", "An explorer with an adventurous spirit."],
  ["رائد بلمسة من المستقبل.", "A pioneer with a futuristic edge."],
  ["حارس المجموعة بدرعه الفضي.", "The collection guardian in silver armor."],
  ["قائد بإطلالة مميزة.", "A commander with a signature look."],
  ["شخصية ساحرة بتفاصيل مضيئة.", "A magical character with luminous details."],
  ["بطل ذهبي برداء ملكي.", "A golden champion in a royal cape."],
  ["شخصية أسطورية بفرو متلألئ.", "A legendary character with iridescent fur."],
  ["ملك المجموعة بتاجه البلوري.", "The collection king with a crystal crown."],
];

function NftTab() {
  const { data, t, initData, demo, lang } = useStore();
  const ar = lang === "ar";
  const address = useTonAddress();
  const [tc] = useTonConnectUI();
  const [owned, setOwned] = useState<any[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const load = () => { if (!demo) myNfts({ data: { initData } }).then((r) => setOwned(r.nfts)).catch(() => {}); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ownedTiers = owned.map((n) => n.tier);
  async function buy(tier: (typeof NFT_TIERS)[number]) {
    if (!data) return;
    const me = data.me;
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
    <div className="space-y-5">
      <GhostButton className="flex w-full items-center justify-between rounded-lg" onClick={() => openLink(NFT_COLLECTION_URL)}><span>Orange · Getgems</span><ArrowUpRight className="size-4" /></GhostButton>
      <div className="space-y-5">
        {NFT_TIERS.map((n) => (
          <Card key={n.tier} className={`overflow-hidden rounded-3xl p-2 ${ownedTiers.includes(n.tier) ? "ring-2 ring-primary" : ""}`}>
            <img src={NFT_IMAGES[n.tier - 1]} alt={n.name} loading="lazy" className="aspect-[4/1] w-full rounded-2xl object-cover" />
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{n.name}</h2><span className="flex items-center gap-1.5 text-sm font-bold" dir="ltr"><CoinIcon src={GRAM_ICON} className="size-4" />{n.price} GRAM</span></div>
              <p className="mt-1.5 text-sm text-muted-foreground">{NFT_DESCRIPTIONS[n.tier - 1]?.[ar ? 0 : 1]}</p>
              <dl className="my-4 grid grid-cols-3 divide-x divide-input border-y border-input py-3 text-center">
                <div><dd className="text-lg font-bold text-primary" dir="ltr">+{Math.round(n.mining * 100)}%</dd><dt className="mt-1 text-xs text-muted-foreground">{ar ? "التعدين" : "Mining"}</dt></div>
                <div><dd className="text-lg font-bold" dir="ltr">+{Math.round(n.referral * 100)}%</dd><dt className="mt-1 text-xs text-muted-foreground">{ar ? "الإحالة" : "Referral"}</dt></div>
                <div><dd className="text-lg font-bold" dir="ltr">×{n.tasks.toFixed(2)}</dd><dt className="mt-1 text-xs text-muted-foreground">{ar ? "المهام" : "Tasks"}</dt></div>
              </dl>
              <PrimaryButton className="h-11 rounded-lg text-sm" onClick={() => buy(n)} disabled={busy !== null}>
                {busy === n.tier ? t("pending") : `${ar ? "شراء" : "Buy"} · ${n.price} GRAM`}
              </PrimaryButton>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{ar ? "المزايا حسب أعلى فئة تملكها، وليست ضمانًا لأرباح." : "Perks follow your highest owned tier and are not a guaranteed return."}</p>
    </div>
  );
}

function Power() {
  const { data, t, x, demo, initData, patchMe, lang } = useStore();
  const ar = lang === "ar";
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(20);
  const [holdings, setHoldings] = useState<number | null>(null);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (demo) return;
    let active = true;
    async function check() {
      try {
        const result: any = await verifyHoldings({ data: { initData } });
        if (!active) return;
        patchMe(result);
        if (typeof result.holdings === "number") setHoldings(result.holdings);
        if (result.market?.orai?.priceUsd) setPrice(result.market.orai.priceUsd);
      } catch { /* silent auto-check */ }
    }
    void check();
    const timer = setInterval(check, 60000);
    window.addEventListener("focus", check);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", check); };
  }, [demo, initData]);

  if (!data) return null;
  const me = data.me;
  const lvl = me.power_level ?? 0;
  const current = (POWER_LEVELS[lvl] ?? POWER_LEVELS[0])!;
  const next = POWER_LEVELS[lvl + 1];
  const usd = holdings !== null && price ? holdings * price : null;
  const progress = next && usd !== null ? Math.min(100, Math.max(0, ((usd - current.price) / (next.price - current.price)) * 100)) : 0;
  const tiers = POWER_LEVELS.slice(Math.max(1, lvl)).slice(0, visible);
  const boost = () => { haptic("light"); openLink(SWAP_URL); };

  return <div>
    <Segmented value={tab} onChange={(k) => navigate({ to: "/power", search: { tab: k }, replace: true })}
      options={[{ key: "power", label: t("power") }, { key: "nft", label: "NFT" }]} />

    {tab === "nft" ? <NftTab /> : <>
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center justify-between text-xs font-bold opacity-90"><span>{ar ? "المستوى" : "Level"} {lvl}</span><span>Staking</span></div>
        <div className="mt-3 flex items-end justify-between gap-3" dir="ltr">
          <div><div className="text-3xl font-bold tabular-nums">+${fmt(current.perDay, 2)}</div><div className="text-xs font-bold opacity-80">{t("perDay")}</div></div>
          <div className="text-end"><div className="text-lg font-bold tabular-nums">{usd !== null ? `$${fmt(usd, 2)}` : `$${fmt(current.price, 2)}`}</div><div className="text-xs font-bold opacity-80">{ar ? "رصيدك" : "Holdings"}</div></div>
        </div>
        {next && <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-primary-foreground/25"><div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${progress}%` }} /></div>
          <div className="mt-1.5 text-xs font-bold opacity-80" dir="ltr">{ar ? "المستوى التالي" : "Next"} · ${fmt(next.price, 2)}</div></div>}
      </div>
      <PrimaryButton className="mt-4" onClick={boost}>{ar ? "زيادة قوة التعدين" : "Boost mining power"}</PrimaryButton>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {tiers.map((l) => {
          const active = l.level === lvl;
          return <button key={l.level} onClick={active ? undefined : boost} className={`rounded-3xl p-4 text-start transition active:scale-[0.97] ${active ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <div className={`text-xs font-bold ${active ? "opacity-80" : "text-muted-foreground"}`}>{ar ? "المستوى" : "Level"} {l.level}</div>
            <div className="mt-2 text-2xl font-bold tabular-nums" dir="ltr">${fmt(l.price, 2)}</div>
            <div className={`mt-3 rounded-xl px-2.5 py-1.5 text-center text-xs font-bold tabular-nums ${active ? "bg-primary-foreground/20" : "bg-accent text-primary"}`} dir="ltr">+${fmt(l.perDay, 2)} / {ar ? "يوم" : "day"}</div>
          </button>;
        })}
      </div>
      {POWER_LEVELS.length - Math.max(1, lvl) > visible && <GhostButton className="mt-4 w-full" onClick={() => setVisible(v => v + 20)}>{x("loadMore")}</GhostButton>}
      <p className="mt-4 text-xs text-muted-foreground">{x("estimate")}</p>
    </>}
  </div>;
}
