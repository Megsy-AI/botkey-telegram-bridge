import "@/lib/buffer-polyfill";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { toNano } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useStore } from "@/lib/store";
import { verifySubscription, SUB_PRICE_GRAM } from "@/lib/api.functions";
import { RECEIVE_WALLET } from "@/lib/config";
import { commentPayload } from "@/lib/ton";
import { InfoPage, PrimaryButton, GhostButton } from "@/components/ui-kit";

export const Route = createFileRoute("/premium")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — Premium" }, { name: "description", content: "Orange Premium: double mining speed for 30 days." },
  { property: "og:title", content: "Orange Premium" }, { property: "og:description", content: "Orange Premium: double mining speed for 30 days." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Premium });

function Premium() {
  const { data, t, x, lang, demo, initData, patchMe } = useStore();
  const [busy, setBusy] = useState(false);
  const address = useTonAddress();
  const [tc] = useTonConnectUI();
  if (!data) return null;
  const me = data.me;
  const ar = lang === "ar";
  const subscribed = me.subscribed_until && new Date(me.subscribed_until).getTime() > Date.now();
  async function subscribe() {
    if (demo) { toast(t("openInTelegram")); return; }
    if (!address) { tc.openModal(); return; }
    setBusy(true);
    try {
      await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: RECEIVE_WALLET, amount: toNano(String(SUB_PRICE_GRAM)).toString(), payload: commentPayload(`pro:${me.id}`) }] });
      toast(t("pending"));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }
  const sections = ar ? [
    { h: "ميزة بريميوم", p: "بريميوم يضاعف سرعة التعدين الخاصة بك (×2) لمدة 30 يومًا كاملة. كل ما تعدّنه خلال فترة الاشتراك يُحسب بضعف المعدل المعتاد." },
    { h: "السعر", p: `الاشتراك ${SUB_PRICE_GRAM} GRAM لكل 30 يومًا. الدفع يتم مباشرة من محفظتك عبر TON Connect، ويُفعّل الاشتراك تلقائيًا بعد تأكيد الدفع على الشبكة.` },
    { h: "التفعيل", p: "اربط محفظتك، اضغط زر الاشتراك، ووقّع المعاملة. بعد دقائق اضغط زر الاستلام ليتحقق النظام من الدفع ويفعّل بريميوم على حسابك." },
  ] : [
    { h: "Premium benefit", p: "Premium doubles your mining speed (×2) for a full 30 days. Everything you mine during the subscription counts at twice the usual rate." },
    { h: "Price", p: `The subscription is ${SUB_PRICE_GRAM} GRAM per 30 days. Payment is made directly from your wallet via TON Connect and activates automatically once confirmed on-chain.` },
    { h: "Activation", p: "Connect your wallet, tap subscribe and sign the transaction. After a few minutes tap claim — the system verifies the payment and activates Premium on your account." },
  ];
  return <InfoPage title={x("premium")} sections={sections}>
    {subscribed
      ? <div className="text-center text-primary">{t("subscribed")} {new Date(me.subscribed_until).toLocaleDateString()}</div>
      : <div className="space-y-2">
          <PrimaryButton onClick={subscribe} disabled={busy}>{t("subscribe")} · {SUB_PRICE_GRAM} GRAM</PrimaryButton>
          <GhostButton className="w-full" onClick={async () => { try { patchMe(await verifySubscription({ data: { initData } })); toast(t("done")); } catch (e: any) { toast.error(e.message); } }}>{t("claim")}</GhostButton>
        </div>}
  </InfoPage>;
}
