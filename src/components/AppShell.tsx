import { useEffect } from "react";
import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { House, Gift, Gauge, Wallet, CircleUserRound } from "lucide-react";
import { StoreProvider, useStore } from "@/lib/store";
import { getWebApp } from "@/lib/telegram";
import logo from "@/assets/orai-logo.png.asset.json";

const tabs = [
  { to: "/", icon: House, key: "home" },
  { to: "/tasks", icon: Gift, key: "tasks" },
  { to: "/power", icon: Gauge, key: "power" },
  { to: "/wallet", icon: Wallet, key: "wallet" },
  { to: "/profile", icon: CircleUserRound, key: "profile" },
] as const;

function BackButtonSync() {
  const { pathname } = useLocation();
  const router = useRouter();
  useEffect(() => {
    const bb = getWebApp()?.BackButton;
    if (!bb) return;
    const onBack = () => router.history.back();
    if (pathname === "/") bb.hide();
    else { bb.show(); bb.onClick(onBack); }
    return () => bb.offClick?.(onBack);
  }, [pathname, router]);
  return null;
}

function Frame() {
  const { data, error, t, x, demo } = useStore();
  const { pathname } = useLocation();
  if (error) {
    return <div className="flex min-h-dvh items-center justify-center p-8 text-center text-muted-foreground">{error}</div>;
  }
  if (!data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <img src={logo.url} alt="ORAI" className="size-20 animate-pulse rounded-full" />
      </div>
    );
  }
  return (
    <div className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28">
      {demo && (
        <div className="glass mb-3 rounded-2xl px-4 py-2 text-center text-xs text-muted-foreground">{t("openInTelegram")}</div>
      )}
      <Outlet />
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-5">
        <div className="glass-strong grid grid-cols-5 gap-2 rounded-[26px] p-2">
          {tabs.map(({ to, icon: Icon, key }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                <Icon className="size-[22px]" strokeWidth={2.2} />
                <span className="w-full truncate px-0.5 text-center text-[10px] font-bold leading-none">{key === "profile" ? x("profile") : t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function AppShell() {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <StoreProvider>
        <BackButtonSync />
        <Frame />
      </StoreProvider>
    </TonConnectUIProvider>
  );
}
