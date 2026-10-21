import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { startMining, claimMining } from "@/lib/api.functions";
import { MINING_HOURS, POWER_LEVELS } from "@/lib/config";
import { fmt } from "@/lib/ton";
import { haptic } from "@/lib/telegram";
import { CoinIcon, ORAI_ICON, PrimaryButton } from "@/components/ui-kit";
import mascot from "@/assets/orai-mascot.jpg.asset.json";
export const Route = createFileRoute("/")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — Mining" }, { name: "description", content: "Mine ORAI continuously and claim every two hours." },
  { property: "og:title", content: "Orange Mining" }, { property: "og:description", content: "Mine ORAI continuously and claim every two hours." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Home });
function Home() {
  const { data, t, x, initData, demo, patchMe } = useStore();
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  if (!data) return null;
  const me = data.me;
  const started = me.mining_started_at ? new Date(me.mining_started_at).getTime() : null;
  const total = MINING_HOURS * 3600_000;
  const elapsed = started === null ? 0 : Math.max(0, Math.min(now - started, total));
  const done = started !== null && elapsed >= total;
  const settled = me.mining_settled_at ? new Date(me.mining_settled_at).getTime() : started;
  const mined = started !== null && settled !== null ? Number(me.mining_pending ?? 0) + Math.max(0, Math.min(now, started + total) - settled) / 86400_000 * Number(me.mining_rate_daily ?? 0.1) : 0;
  const left = Math.max(0, total - elapsed);
  const clock = [Math.floor(left / 3600_000), Math.floor(left % 3600_000 / 60000), Math.floor(left % 60000 / 1000)].map(v => String(v).padStart(2, "0")).join(":");
  async function act() {
    if (demo) { toast(t("openInTelegram")); return; }
    setBusy(true);
    try { const result = done ? await claimMining({ data: { initData } }) : await startMining({ data: { initData } }); patchMe(result); haptic("success"); }
    catch (error: any) { toast.error(error.message); } finally { setBusy(false); }
  }
  return <div className="flex flex-col items-center pt-4 text-center">
    <div className="flex w-full items-center justify-between"><span className="text-xl">Orange</span><Link to="/profile" className="flex items-center gap-2 text-sm"><img src={me.photo_url || mascot.url} alt="" className="size-8 rounded-full object-cover" /><span className="max-w-36 truncate">{me.first_name || me.username}</span></Link></div>
    <img src={mascot.url} alt="Orange" className="mt-5 size-24 rounded-full object-cover" />
    <div className="mt-4 text-sm text-muted-foreground">{t("balance")}</div>
    <div className="mt-2 flex max-w-full items-center justify-center gap-2 break-all text-4xl tabular-nums"><CoinIcon src={ORAI_ICON} className="size-8" />{fmt(Number(me.balance) + mined, 4)}</div>
    <span className="mt-1 text-sm text-muted-foreground">ORAI</span>
    <Link to="/power" className="mt-4 flex w-full items-center justify-between border-y border-input py-4 text-start"><div><div className="text-xs text-muted-foreground">{t("level")}</div><div className="mt-1 text-2xl">{me.power_level}</div></div><div className="text-end"><div className="text-xs text-muted-foreground">{x("dailyReward")}</div><div className="mt-1 text-lg text-primary">{`${fmt(Number(me.mining_rate_daily ?? 0.1), 4)} ORAI`}</div></div></Link>
    <Link to="/nft" className="mt-4 flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3 text-sm"><span className="flex items-center gap-2"><CoinIcon src={ORAI_ICON} className="size-6" />Orange NFT</span><span className="text-muted-foreground">→</span></Link>
    <div className="mt-5 w-full">
      {started !== null && <><div className="flex justify-between text-sm"><span>{done ? x("capNotice") : t("mining")}</span><span className="tabular-nums">{done ? "02:00:00" : clock}</span></div><progress aria-label={t("mining")} max={100} value={elapsed / total * 100} className="mt-3 h-1.5 w-full accent-primary" /></>}
      {started === null || done ? <PrimaryButton className="mt-4" onClick={act} disabled={busy}>{done ? `${t("claim")} +${fmt(mined, 4)} ORAI` : t("startMining")}</PrimaryButton> : <div className="mt-4 rounded-2xl bg-accent py-4 text-primary">+{fmt(mined, 4)} ORAI</div>}
    </div>
  </div>;
}
