import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { useStore } from "@/lib/store";
import {
  getMarket, walletBalances, setWallet, requestWithdraw, verifySubscription, SUB_PRICE_GRAM,
} from "@/lib/api.functions";
import { MIN_WITHDRAW, RECEIVE_WALLET } from "@/lib/config";
import { commentPayload, fmt, oraiTransferMessage } from "@/lib/ton";
import { haptic } from "@/lib/telegram";
import { Card, CoinIcon, GhostButton, GRAM_ICON, ORAI_ICON, PrimaryButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/wallet")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ORAI Mining — Wallet" },
      { name: "description", content: "Connect your TON wallet, deposit GRAM or ORAI, and withdraw ORAI." },
      { property: "og:title", content: "ORAI Wallet" },
      { property: "og:description", content: "Connect your TON wallet, deposit GRAM or ORAI, and withdraw ORAI." },
    ],
  }),
  component: WalletPage,
});

type Market = Awaited<ReturnType<typeof getMarket>>;

function WalletPage() {
  const { data, t, initData, demo, patchMe, setData } = useStore();
  const me = data!.me;
  const address = useTonAddress();
  const [tc] = useTonConnectUI();
  const [market, setMarket] = useState<Market | null>(null);
  const [chain, setChain] = useState<{ orai: number; gram: number } | null>(null);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [coin, setCoin] = useState<"GRAM" | "ORAI">("GRAM");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getMarket().then(setMarket).catch(() => {}); }, []);
  useEffect(() => {
    if (!address) { setChain(null); return; }
    walletBalances({ data: { address } }).then(setChain).catch(() => {});
    if (!demo && address !== me.wallet_address) {
      setWallet({ data: { initData, address } }).then(() => patchMe({ wallet_address: address }));
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const n = Number(amount);
    if (!(n > 0)) return;
    if (!address) return tc.openModal();
    setBusy(true);
    try {
      if (mode === "deposit") {
        const msg = coin === "GRAM"
          ? { address: RECEIVE_WALLET, amount: toNano(amount).toString(), payload: commentPayload(`dep:${me.id}`) }
          : await oraiTransferMessage(address, RECEIVE_WALLET, n, `dep:${me.id}`);
        await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [msg] });
        toast(t("pending"));
      } else {
        if (demo) return toast(t("openInTelegram"));
        const r = await requestWithdraw({ data: { initData, amount: n } });
        setData((d) => d && { ...d, me: { ...d.me, balance: r.balance }, withdrawals: [
          { id: crypto.randomUUID(), amount: n, status: "pending", created_at: new Date().toISOString(), to_address: address } as any,
          ...d.withdrawals] });
      }
      haptic("success");
      setAmount("");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function subscribe() {
    if (demo) return toast(t("openInTelegram"));
    if (!address) return tc.openModal();
    try {
      await tc.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: RECEIVE_WALLET, amount: toNano(SUB_PRICE_GRAM.toString()).toString(), payload: commentPayload(`pro:${me.id}`) }],
      });
      toast(t("pending"));
      setTimeout(checkSub, 20000);
    } catch (e: any) { toast.error(e.message); }
  }
  async function checkSub() {
    try {
      const r = await verifySubscription({ data: { initData } });
      patchMe(r); haptic("success");
    } catch (e: any) { toast.error(e.message); }
  }

  const pro = me.subscribed_until && new Date(me.subscribed_until).getTime() > Date.now();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Title>{t("wallet")}</Title>
        <div className="-mt-4"><TonConnectButton /></div>
      </div>

      <Card className="text-center">
        <div className="text-sm text-muted-foreground">{t("balance")}</div>
        <div className="mt-1 text-4xl tracking-tight">{fmt(Number(me.balance), 4)} ORAI</div>
        {market?.orai.priceUsd ? (
          <div className="text-sm text-muted-foreground">≈ ${fmt(Number(me.balance) * market.orai.priceUsd, 2)}</div>
        ) : null}
      </Card>

      {[
        { s: "ORAI", n: market?.orai.name ?? "Orange AI", icon: market?.orai.image || ORAI_ICON, p: market?.orai.priceUsd, b: chain?.orai },
        { s: "GRAM", n: "Gram", icon: GRAM_ICON, p: market?.gram.priceUsd, b: chain?.gram },
      ].map((c) => (
        <Card key={c.s} className="flex items-center gap-3">
          <CoinIcon src={c.icon} />
          <div className="flex-1">
            <div>{c.s}</div>
            <div className="text-xs text-muted-foreground">{c.n} · {t("price")} ${c.p ? fmt(c.p, 6) : "—"}</div>
          </div>
          <div className="text-end">{c.b !== undefined ? fmt(c.b, 4) : "—"}</div>
        </Card>
      ))}

      <Card>
        <div className="glass mb-3 grid grid-cols-2 rounded-2xl p-1">
          {(["deposit", "withdraw"] as const).map((k) => (
            <button key={k} onClick={() => { setMode(k); if (k === "withdraw") setCoin("ORAI"); }}
              className={`h-10 rounded-xl text-sm ${mode === k ? "bg-card shadow" : "text-muted-foreground"}`}>{t(k)}</button>
          ))}
        </div>
        {mode === "deposit" && (
          <div className="mb-3 flex gap-2">
            {(["GRAM", "ORAI"] as const).map((c) => (
              <button key={c} onClick={() => setCoin(c)}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm ${coin === c ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                <CoinIcon src={c === "GRAM" ? GRAM_ICON : ORAI_ICON} className="size-5" />{c}
              </button>
            ))}
          </div>
        )}
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`${t("amount")} (${mode === "withdraw" ? "ORAI" : coin})`}
          className="h-14 w-full rounded-2xl bg-card px-4 text-lg outline-none placeholder:text-muted-foreground" />
        {mode === "withdraw" && <div className="mt-2 text-xs text-muted-foreground">{t("minWithdraw")}: {MIN_WITHDRAW} ORAI</div>}
        <PrimaryButton className="mt-3" onClick={submit} disabled={busy}>
          {!address ? t("connectWallet") : mode === "deposit" ? t("deposit") : t("withdraw")}
        </PrimaryButton>
      </Card>

      <Card>
        <div className="text-lg">{t("subscription")}</div>
        <div className="mt-1 text-sm text-muted-foreground">x2 mining · {SUB_PRICE_GRAM} GRAM / 30d</div>
        {pro ? (
          <div className="mt-3 text-sm text-primary">{t("subscribed")} {new Date(me.subscribed_until!).toLocaleDateString()}</div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PrimaryButton className="h-12" onClick={subscribe}>{t("subscribe")}</PrimaryButton>
            <GhostButton onClick={checkSub}>{t("verifyHoldings").split(" ")[0]}</GhostButton>
          </div>
        )}
      </Card>

      {data!.withdrawals.length > 0 && (
        <Card>
          {data!.withdrawals.map((w: any) => (
            <div key={w.id} className="flex justify-between border-t border-muted py-2 text-sm first:border-0">
              <span>{fmt(w.amount)} ORAI</span>
              <span className="text-muted-foreground">{w.status === "pending" ? t("pending") : w.status}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
