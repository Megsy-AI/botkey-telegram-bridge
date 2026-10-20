import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { startMining, claimMining } from "@/lib/api.functions";
import { MINING_HOURS, POWER_LEVELS, sessionReward } from "@/lib/config";
import { fmt } from "@/lib/ton";
import { haptic } from "@/lib/telegram";
import { CoinIcon, ORAI_ICON, PrimaryButton } from "@/components/ui-kit";
import mascot from "@/assets/orai-mascot.jpg.asset.json";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ORAI Mining — Home" },
      { name: "description", content: "Start a 6-hour ORAI mining session and watch your balance grow." },
      { property: "og:title", content: "ORAI Mining" },
      { property: "og:description", content: "Start a 6-hour ORAI mining session and watch your balance grow." },
    ],
  }),
  component: Home,
});

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  return now;
}

function Home() {
  const { data, t, initData, demo, patchMe } = useStore();
  const me = data!.me;
  const now = useNow();
  const [busy, setBusy] = useState(false);
  const level = POWER_LEVELS[me.power_level];
  const started = me.mining_started_at ? new Date(me.mining_started_at).getTime() : null;
  const total = MINING_HOURS * 3600_000;
  const elapsed = started ? Math.min(now - started, total) : 0;
  const done = started !== null && elapsed >= total;
  const mined = started ? (sessionReward(me.power_level) * elapsed) / total : 0;
  const left = total - elapsed;
  const hh = String(Math.floor(left / 3600_000)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600_000) / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60_000) / 1000)).padStart(2, "0");

  async function act() {
    if (demo) return toast(t("openInTelegram"));
    setBusy(true);
    try {
      if (done) {
        const r = await claimMining({ data: { initData } });
        patchMe({ balance: r.balance, mining_started_at: null });
        haptic("success");
      } else if (!started) {
        const r = await startMining({ data: { initData } });
        patchMe({ mining_started_at: r.mining_started_at });
        haptic("medium");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-1 flex-col items-center pt-4 text-center">
      <div className="text-xl">{me.first_name || me.username}</div>
      <div className="mt-1 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
        {t("level")} {me.power_level} · {fmt(level.perDay)} ORAI {t("perDay")}
      </div>

      <div className="relative mt-8">
        {started && !done && <span className="mining-ring absolute inset-0 rounded-full bg-primary/30" />}
        <img src={me.photo_url || mascot.url} alt=""
          className="relative size-40 rounded-full border-4 border-glass-edge object-cover shadow-xl" />
      </div>

      <div className="mt-8 text-sm text-muted-foreground">{t("balance")}</div>
      <div className="mt-1 flex items-center gap-2 text-5xl tracking-tight">
        <CoinIcon src={ORAI_ICON} className="size-9" />
        {fmt(Number(me.balance) + mined, 4)}
      </div>
      <div className="text-sm text-muted-foreground">ORAI</div>

      <div className="mt-auto w-full pt-10">
        {started && !done ? (
          <div className="glass w-full rounded-2xl p-4">
            <div className="text-base">{t("mining")}</div>
            <div className="mt-1 text-3xl tabular-nums">{hh}:{mm}:{ss}</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="btn-orange h-full rounded-full" style={{ width: `${(elapsed / total) * 100}%` }} />
            </div>
          </div>
        ) : (
          <PrimaryButton onClick={act} disabled={busy}>
            {done ? `${t("claim")} +${fmt(sessionReward(me.power_level), 4)} ORAI` : t("startMining")}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
