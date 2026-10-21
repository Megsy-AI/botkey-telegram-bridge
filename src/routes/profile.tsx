import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { SWAP_URL } from "@/lib/config";
import { openLink } from "@/lib/telegram";
import { fmt } from "@/lib/ton";
import { CoinIcon, ORAI_ICON, GhostButton } from "@/components/ui-kit";
import mascot from "@/assets/orai-mascot.jpg.asset.json";

export const Route = createFileRoute("/profile")({ ssr: false, head: () => ({ meta: [ { title: "Orange — Your profile" }, { name: "description", content: "Your Telegram profile, ORAI holdings, Premium and project information." }, { property: "og:title", content: "Orange Profile" }, { property: "og:description", content: "Your Telegram profile, ORAI holdings, Premium and project information." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" } ]}), component: Profile });

function Profile() {
  const { data, x } = useStore();
  if (!data) return null;
  const me = data.me;
  const pages = [
    { to: "/guide", label: x("guide") },
    { to: "/about", label: x("about") },
    { to: "/premium", label: x("premium") },
    { to: "/supporter", label: x("supporter") },
    { to: "/whitepaper", label: x("whitepaper") },
    { to: "/roadmap", label: x("roadmap") },
  ] as const;
  return <div>
    <div className="flex items-center gap-4 py-5"><img src={me.photo_url || mascot.url} alt="" className="size-20 rounded-full object-cover" /><div className="min-w-0"><h2 className="break-words text-2xl">{me.first_name || me.username}</h2><div className="mt-1 text-sm text-muted-foreground" dir="ltr">{me.username ? `@${me.username}` : "—"}</div></div></div>
    <div className="border-y border-input py-5"><div className="text-xs text-muted-foreground">{x("holdings")}</div><div className="mt-2 flex items-center gap-2 text-3xl"><CoinIcon src={ORAI_ICON} className="size-7" />{fmt(Number(me.balance), 4)} ORAI</div><div className="mt-2 text-xs text-muted-foreground">{x("appHoldings")}</div></div>
    <div className="mt-5">
      {pages.map(p => <Link key={p.to} to={p.to} className="mb-2 flex h-14 items-center justify-between rounded-2xl bg-card px-4">{p.label}<ChevronRight className="size-4 shrink-0 rtl:rotate-180" /></Link>)}
      <Link to="/power" search={{ tab: "nft" }} className="mb-2 flex h-14 items-center justify-between rounded-2xl bg-card px-4">NFT<ChevronRight className="size-4 rtl:rotate-180" /></Link>
      <GhostButton className="mb-2 flex h-14 w-full items-center justify-between" onClick={() => openLink(SWAP_URL)}>STON.fi<ChevronRight className="size-4 rtl:rotate-180" /></GhostButton>
    </div>
  </div>;
}
