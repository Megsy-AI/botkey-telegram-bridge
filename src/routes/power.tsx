import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { upgradePower, verifyHoldings } from "@/lib/api.functions";
import { POWER_LEVELS, SWAP_URL } from "@/lib/config";
import { openLink, haptic } from "@/lib/telegram";
import { fmt } from "@/lib/ton";
import { Card, GhostButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/power")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ORAI Mining — Power" },
      { name: "description", content: "Upgrade your mining power from 0.1 to 10,000 ORAI per day." },
      { property: "og:title", content: "ORAI Mining Power" },
      { property: "og:description", content: "Upgrade your mining power from 0.1 to 10,000 ORAI per day." },
    ],
  }),
  component: Power,
});

function Power() {
  const { data, t, initData, demo, patchMe } = useStore();
  const me = data!.me;
  const [busy, setBusy] = useState<number | "verify" | null>(null);

  async function buy(level: number) {
    if (demo) { toast(t("openInTelegram")); return; }
    setBusy(level);
    try {
      const r = await upgradePower({ data: { initData, level } });
      patchMe(r); haptic("success");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  }
  async function verify() {
    if (demo) { toast(t("openInTelegram")); return; }
    if (!me.wallet_address) { toast(t("needWallet")); return; }
    setBusy("verify");
    try {
      const r = await verifyHoldings({ data: { initData } });
      patchMe({ power_level: r.power_level });
      toast(`${fmt(r.holdings)} ORAI · ${t("level")} ${r.power_level}`);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  }

  return (
    <div>
      <Title>{t("miningPower")}</Title>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <GhostButton onClick={() => openLink(SWAP_URL)}>{t("buyOnSton")}</GhostButton>
        <GhostButton onClick={verify} disabled={busy === "verify"}>{t("verifyHoldings")}</GhostButton>
      </div>
      <div className="space-y-2.5">
        {POWER_LEVELS.map((l) => {
          const owned = l.level <= me.power_level;
          const current = l.level === me.power_level;
          return (
            <Card key={l.level} className={`flex items-center gap-3 ${current ? "ring-2 ring-primary" : ""}`}>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">{l.level}</div>
              <div className="flex-1">
                <div className="text-lg">{fmt(l.perDay)} ORAI</div>
                <div className="text-xs text-muted-foreground">{t("perDay")}</div>
              </div>
              {current ? (
                <span className="text-sm text-primary">{t("current")}</span>
              ) : owned ? (
                <span className="text-sm text-muted-foreground">{t("done")}</span>
              ) : (
                <GhostButton className="h-10" disabled={busy === l.level || Number(me.balance) < l.price} onClick={() => buy(l.level)}>
                  {fmt(l.price)} ORAI
                </GhostButton>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
