import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { completeTask } from "@/lib/api.functions";
import { REFERRAL_BONUS } from "@/lib/config";
import { openLink, haptic } from "@/lib/telegram";
import { fmt } from "@/lib/ton";
import invitation from "@/assets/referral-invitation.jpg";
import { shareReferral } from "@/lib/referral-share";
import { CoinIcon, GhostButton, ORAI_ICON, PrimaryButton, Segmented } from "@/components/ui-kit";

export const Route = createFileRoute("/tasks")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Orange — Tasks" },
      { name: "description", content: "Complete tasks and invite friends to earn ORAI." },
      { property: "og:title", content: "ORAI Tasks" },
      { property: "og:description", content: "Complete tasks and invite friends to earn ORAI." },
    ],
  }),
  component: Tasks,
});

const BOT_USERNAME = "sramaibot";

function Tasks() {
  const { data, t, x, initData, demo, setData, lang } = useStore();
  const [tab, setTab] = useState<"tasks" | "refs">("tasks");
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  if (!data) return null;
  const me = data.me;
  const link = `https://t.me/${BOT_USERNAME}?start=ref_${me.id}`;
  const pending = data.tasks.filter((task: any) => !data.done.includes(task.id));

  async function onTask(task: any) {
    if (!opened[task.id]) {
      openLink(task.link);
      setOpened((o) => ({ ...o, [task.id]: true }));
      return;
    }
    if (demo) { toast(t("openInTelegram")); return; }
    try {
      const r = await completeTask({ data: { initData, taskId: task.id } });
      setData((d) => d && { ...d, me: { ...d.me, balance: r.balance, power_level: r.power_level }, done: [...d.done, task.id] });
      haptic("success");
    } catch (e: any) {
      toast.error(e?.message === "TASK_NOT_VERIFIED" ? x("taskNotVerified") : e.message);
    }
  }

  const ar = lang === "ar";
  return (
    <div>
      <Segmented value={tab} onChange={setTab} options={[{ key: "tasks", label: t("tasksTab") }, { key: "refs", label: t("referralsTab") }]} />

      {tab === "tasks" ? (
        pending.length === 0
          ? <div className="rounded-2xl bg-card py-12 text-center text-sm font-bold text-muted-foreground">{x("allDone")}</div>
          : <div className="overflow-hidden rounded-2xl bg-card">
            {pending.map((task: any, i: number) => (
              <div key={task.id} className={`flex items-center gap-3 px-4 py-3.5 ${i ? "border-t border-muted" : ""}`}>
                <CoinIcon src={task.image_url || ORAI_ICON} className="size-11" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{task.title}</div>
                  <div className="mt-0.5 text-xs font-bold text-primary" dir="ltr">+{fmt(task.reward)} ORAI</div>
                </div>
                <button onClick={() => onTask(task)}
                  className={`h-9 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 ${opened[task.id] ? "btn-orange" : "bg-accent text-accent-foreground"}`}>
                  {opened[task.id] ? t("claim") : t("start")}
                </button>
              </div>
            ))}
          </div>
      ) : (
        <div className="space-y-4">
          <img src={invitation} alt={t("inviteFriends")} className="aspect-[3/2] w-full rounded-3xl object-cover" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-4 text-center"><div className="text-2xl font-bold tabular-nums">{data.referrals.length}</div><div className="mt-1 text-xs text-muted-foreground">{t("friends")}</div></div>
            <div className="rounded-2xl bg-card p-4 text-center"><div className="truncate text-2xl font-bold tabular-nums text-primary" dir="ltr">{fmt(Number(me.referral_earned ?? 0), 2)}</div><div className="mt-1 text-xs text-muted-foreground">ORAI</div></div>
          </div>
          <p className="px-2 text-center text-sm text-muted-foreground">{ar ? `اربح 10% من تعدين أصدقائك + ${REFERRAL_BONUS} ORAI لكل دعوة` : `Earn 10% of friends' mining + ${REFERRAL_BONUS} ORAI per invite`}</p>
          <PrimaryButton onClick={() => shareReferral(invitation, link, lang).catch(() => toast.error(t("pending")))}>{t("inviteFriends")}</PrimaryButton>
          <GhostButton className="w-full font-bold" onClick={() => { navigator.clipboard.writeText(link); toast(t("copied")); }}>{t("copyLink")}</GhostButton>
          {data.referrals.length > 0 && <div className="overflow-hidden rounded-2xl bg-card">
            {data.referrals.map((r: any, i: number) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i ? "border-t border-muted" : ""}`}>
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{(r.first_name || r.username || "?").slice(0, 1).toUpperCase()}</div>
                <div className="truncate font-bold">{r.first_name || r.username}</div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  );
}
