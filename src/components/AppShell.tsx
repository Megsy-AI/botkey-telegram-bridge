import { useEffect } from "react";
import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Home, ListChecks, Zap, Wallet, UserRound } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider, useStore } from "@/lib/store";
import { getWebApp } from "@/lib/telegram";
import { DailyNotification } from "./DailyNotification";
import logo from "@/assets/orai-logo.png.asset.json";

const tabs = [
  { to: "/", icon: Home, key: "home" },
  { to: "/tasks", icon: ListChecks, key: "tasks" },
  { to: "/power", icon: Zap, key: "power" },
  { to: "/wallet", icon: Wallet, key: "wallet" },
  { to: "/profile", icon: UserRound, key: "profile" },
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
      <div className="mb-1 flex justify-end"><DailyNotification /></div>
      <Outlet />
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-2 py-2">
          {tabs.map(({ to, icon: Icon, key }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] transition ${active ? "bg-accent text-primary" : "text-muted-foreground"}`}>
                <Icon className="size-5" strokeWidth={2.4} />
                {key === "profile" ? x("profile") : t(key)}
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
        <Toaster position="top-center" />
      </StoreProvider>
    </TonConnectUIProvider>
  );
}
