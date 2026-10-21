import "@/lib/buffer-polyfill";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { verifySubscription, SUB_PRICE_GRAM } from "@/lib/api.functions";
import { SWAP_URL, SUPPORTER_URL, RECEIVE_WALLET } from "@/lib/config";
import { openLink } from "@/lib/telegram";
import { fmt, commentPayload } from "@/lib/ton";
import { CoinIcon, ORAI_ICON, GhostButton, PrimaryButton, Title } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ExtraKey } from "@/lib/i18n";
import mascot from "@/assets/orai-mascot.jpg.asset.json";
export const Route = createFileRoute("/profile")({ ssr: false, head: () => ({ meta: [ { title: "Orange — Your profile" }, { name: "description", content: "Your Telegram profile, ORAI holdings, Premium and project information." }, { property: "og:title", content: "Orange Profile" }, { property: "og:description", content: "Your Telegram profile, ORAI holdings, Premium and project information." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" } ]}), component: Profile });
function Profile() {
 const { data, t, x, demo, initData, patchMe } = useStore(); const [section, setSection] = useState<ExtraKey | null>(null), [busy, setBusy] = useState(false); const address = useTonAddress(), [tc] = useTonConnectUI();
 if (!data) return null; const me = data.me;
 const bodies: Partial<Record<ExtraKey, ExtraKey>> = { guide: "guideBody", about: "aboutBody", supporter: "supporterBody", whitepaper: "whitepaperBody", roadmap: "roadmapBody", premium: "premiumBody" };
 async function subscribe() { if (demo) { toast(t("openInTelegram")); return; } if (!address) { tc.openModal(); return; } setBusy(true); try { await tc.sendTransaction({ validUntil: Math.floor(Date.now()/1000)+600, messages: [{ address: RECEIVE_WALLET, amount: toNano(String(SUB_PRICE_GRAM)).toString(), payload: commentPayload(`pro:${me.id}`) }] }); toast(t("pending")); } catch(e: any) { toast.error(e.message); } finally { setBusy(false); } }
 const subscribed = me.subscribed_until && new Date(me.subscribed_until).getTime() > Date.now();
 return <div><Title>{x("profile")}</Title><div className="flex items-center gap-4 py-5"><img src={me.photo_url || mascot.url} alt="" className="size-20 rounded-full object-cover" /><div className="min-w-0"><h2 className="break-words text-2xl">{me.first_name || me.username}</h2><div className="mt-1 text-sm text-muted-foreground" dir="ltr">{me.username ? `@${me.username}` : "—"}</div></div></div><div className="border-y border-input py-5"><div className="text-xs text-muted-foreground">{x("holdings")}</div><div className="mt-2 flex items-center gap-2 text-3xl"><CoinIcon src={ORAI_ICON} className="size-7" />{fmt(Number(me.balance),4)} ORAI</div><div className="mt-2 text-xs text-muted-foreground">{x("appHoldings")}</div></div>
 <div className="mt-5">{(["guide", "about", "premium"] as ExtraKey[]).map(key => <GhostButton key={key} onClick={() => setSection(key)} className="mb-2 flex h-14 w-full items-center justify-between text-start">{x(key)}<ChevronRight className="size-4 shrink-0 rtl:rotate-180" /></GhostButton>)}<Link to="/nft" className="mb-2 flex h-14 items-center justify-between rounded-2xl bg-card px-4">NFT<ChevronRight className="size-4 rtl:rotate-180" /></Link><GhostButton className="mb-2 flex h-14 w-full items-center justify-between" onClick={() => openLink(SWAP_URL)}>STON.fi<ChevronRight className="size-4 rtl:rotate-180" /></GhostButton>{(["supporter", "whitepaper", "roadmap"] as ExtraKey[]).map(key => <GhostButton key={key} onClick={() => setSection(key)} className="mb-2 flex h-14 w-full items-center justify-between text-start">{x(key)}<ChevronRight className="size-4 shrink-0 rtl:rotate-180" /></GhostButton>)}</div>
 <Dialog open={section !== null} onOpenChange={open => { if (!open) setSection(null); }}><DialogContent><DialogTitle>{section ? x(section) : ""}</DialogTitle><DialogDescription className="text-start leading-7">{section && bodies[section] ? x(bodies[section] as ExtraKey) : ""}</DialogDescription>{section === "supporter" && <PrimaryButton onClick={() => openLink(SUPPORTER_URL)}>{x("openWebsite")}</PrimaryButton>}{section === "premium" && (subscribed ? <div>{t("subscribed")} {new Date(me.subscribed_until).toLocaleDateString()}</div> : <><PrimaryButton onClick={subscribe} disabled={busy}>{t("subscribe")}</PrimaryButton><GhostButton onClick={async () => { try { patchMe(await verifySubscription({ data: { initData } })); toast(t("done")); } catch(e: any) { toast.error(e.message); } }}>{t("claim")}</GhostButton></>)}</DialogContent></Dialog>
 </div>;
}
