import "@/lib/buffer-polyfill";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { useStore } from "@/lib/store";
import { getMarket, walletBalances, setWallet, requestWithdraw, checkWithdrawal, walletChallenge, proveWallet } from "@/lib/api.functions";
import { MIN_WITHDRAW, RECEIVE_WALLET, WITHDRAW_FEE_GRAM } from "@/lib/config";
import { commentPayload, fmt, oraiTransferMessage, short } from "@/lib/ton";
import { Card, CoinIcon, GhostButton, GRAM_ICON, ORAI_ICON, PrimaryButton, Title } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export const Route = createFileRoute("/wallet")({ ssr: false, head: () => ({ meta: [
 { title: "Orange — Wallet" }, { name: "description", content: "Your ORAI balance, TON wallet, deposits and withdrawals." }, { property: "og:title", content: "Orange Wallet" }, { property: "og:description", content: "Your ORAI balance, TON wallet, deposits and withdrawals." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: WalletPage });
function WalletPage() {
 const { data, t, x, initData, demo, patchMe, refresh } = useStore();
 const address = useTonAddress(), wallet = useTonWallet(), [tc] = useTonConnectUI();
 const [market, setMarket] = useState<Awaited<ReturnType<typeof getMarket>> | null>(null), [chain, setChain] = useState<{orai: number; gram: number} | null>(null);
 const [mode, setMode] = useState<"deposit" | "withdraw" | null>(null), [coin, setCoin] = useState<"GRAM" | "ORAI">("ORAI"), [amount, setAmount] = useState(""), [busy, setBusy] = useState(false);
 useEffect(() => { if (!demo) getMarket({ data: { initData } }).then(setMarket).catch(() => {}); }, [demo, initData]);
 useEffect(() => { if (!address || demo) { setChain(null); return; } walletBalances({ data: { initData, address } }).then(setChain).catch(() => {});
   const proof = wallet?.connectItems?.tonProof;
   if (proof && "proof" in proof) proveWallet({ data: { initData, address, proof: proof.proof } }).then(patchMe).catch(() => toast.error(x("proofFailed")));
   else if (address !== data?.me.wallet_address) setWallet({ data: { initData, address } }).then(() => patchMe({ wallet_address: address, wallet_verified: false })).catch(() => {});
 }, [address, demo, initData, wallet]);
 if (!data) return null;
 const me = data.me;
 async function connect() {
   if (demo) { toast(t("openInTelegram")); return; }
   try { if (tc.connected) await tc.disconnect(); const { nonce } = await walletChallenge({ data: { initData } }); tc.setConnectRequestParameters({ state: "ready", value: { tonProof: nonce } }); await tc.openModal(); } catch (e: any) { toast.error(e.message); }
 }
 async function submit() {
   if (demo) { toast(t("openInTelegram")); return; }
   const n = Number(amount);
   if (!Number.isFinite(n) || n <= 0) return;
   if (!address) { await connect(); return; }
   if (mode === "withdraw" && (n < MIN_WITHDRAW || n > Number(me.balance))) { toast.error(n < MIN_WITHDRAW ? `${t("minWithdraw")}: ${MIN_WITHDRAW} ORAI` : t("insufficient")); return; }
   setBusy(true);
   try {
     if (mode === "deposit") {
       const msg = coin === "GRAM" ? { address: RECEIVE_WALLET, amount: toNano(amount).toString(), payload: commentPayload(`dep:${me.id}`) } : await oraiTransferMessage(address, RECEIVE_WALLET, n, `dep:${me.id}`);
       await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [msg] }); toast(t("pending"));
     } else {
       await checkWithdrawal({ data: { initData, amount: n } });
       await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: RECEIVE_WALLET, amount: toNano(String(WITHDRAW_FEE_GRAM)).toString(), payload: commentPayload(`fee:${me.id}`) }] });
       toast(t("pending")); const result = await requestWithdraw({ data: { initData, amount: n } }); patchMe({ balance: result.balance }); await refresh(); toast(t("pending"));
     }
     setAmount(""); setMode(null);
   } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
 }
 return <div><Title>{t("wallet")}</Title>
   <div className="py-7 text-center"><div className="text-sm text-muted-foreground">{t("balance")}</div><div className="mt-3 flex items-center justify-center gap-2 break-all text-4xl"><CoinIcon src={ORAI_ICON} className="size-8" />{fmt(Number(me.balance), 4)}</div><div className="mt-2 text-sm text-muted-foreground">ORAI {market?.orai.priceUsd ? `· $${fmt(Number(me.balance) * market.orai.priceUsd, 2)}` : ""}</div></div>
   {!address ? <PrimaryButton onClick={connect}>{t("connectWallet")}</PrimaryButton> : <><div className="mb-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">{short(address)}</span><GhostButton className="h-9 px-3 text-xs" onClick={async () => { await tc.disconnect(); if (!demo) await setWallet({ data: { initData, address: null } }); patchMe({ wallet_address: null, wallet_verified: false }); }}>{x("disconnect")}</GhostButton></div><div className="grid grid-cols-2 gap-3"><PrimaryButton onClick={() => { setCoin("ORAI"); setMode("withdraw"); }}>{t("withdraw")}</PrimaryButton><GhostButton className="h-14" onClick={() => setMode("deposit")}>{t("deposit")}</GhostButton></div>{!me.wallet_verified && <GhostButton className="mt-3 w-full" onClick={connect}>{x("verifyWallet")}</GhostButton>}</>}
   <div className="mt-8 border-t border-input pt-5"><h2 className="mb-4 text-sm text-muted-foreground">{x("holdings")}</h2>{[{ s: "ORAI", name: market?.orai.name || "Orange AI", icon: ORAI_ICON, price: market?.orai.priceUsd, balance: chain?.orai }, { s: "GRAM", name: "Gram", icon: GRAM_ICON, price: market?.gram.priceUsd, balance: chain?.gram }].map(c => <div key={c.s} className="flex items-center gap-3 border-b border-input py-4"><CoinIcon src={c.icon} className="size-11" /><div className="min-w-0 flex-1"><div>{c.name}</div><div className="mt-1 text-xs text-muted-foreground">{c.s} · {c.price ? `$${fmt(c.price, 8)}` : "—"}</div></div><div className="text-end"><div>{c.balance === undefined ? "—" : fmt(c.balance, 4)}</div><div className="mt-1 text-xs text-muted-foreground">{c.s}</div></div></div>)}</div>
   {data.withdrawals.length > 0 && <div className="mt-6"><h2 className="mb-2 text-sm text-muted-foreground">{t("withdrawals")}</h2>{data.withdrawals.map((w: any) => <div key={w.id} className="flex justify-between py-3 text-sm"><span>{fmt(w.amount)} ORAI</span><span className="text-muted-foreground">{w.status === "sent" ? t("sent") : t("pending")}</span></div>)}</div>}
   <Dialog open={mode !== null} onOpenChange={open => { if (!open && !busy) setMode(null); }}><DialogContent><DialogTitle>{mode === "deposit" ? t("deposit") : t("withdraw")}</DialogTitle><DialogDescription>{mode === "withdraw" ? `${t("minWithdraw")}: ${MIN_WITHDRAW} ORAI · ${t("fee")}: ${WITHDRAW_FEE_GRAM} GRAM` : t("amount")}</DialogDescription>{mode === "deposit" && <div className="grid grid-cols-2 gap-2">{(["ORAI", "GRAM"] as const).map(c => <GhostButton key={c} onClick={() => setCoin(c)} className={coin === c ? "ring-2 ring-primary" : ""}>{c}</GhostButton>)}</div>}<input aria-label={t("amount")} inputMode="decimal" placeholder={`0.00 ${mode === "withdraw" ? "ORAI" : coin}`} value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="h-16 w-full rounded-xl bg-muted px-4 text-2xl outline-none" /><PrimaryButton onClick={submit} disabled={busy || !(Number(amount) > 0)}>{busy ? t("pending") : mode === "deposit" ? t("deposit") : t("withdraw")}</PrimaryButton></DialogContent></Dialog>
 </div>;
}
