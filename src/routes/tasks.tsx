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
import { Card, CoinIcon, GhostButton, ORAI_ICON, PrimaryButton } from "@/components/ui-kit";

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

  return (
    <div>
      <div className="glass mb-4 grid grid-cols-2 rounded-2xl p-1">
        {(["tasks", "refs"] as const).map((k) => (
          <GhostButton key={k} onClick={() => setTab(k)}
            className={`h-10 rounded-xl text-sm transition ${tab === k ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
            {k === "tasks" ? t("tasksTab") : t("referralsTab")}
          </GhostButton>
        ))}
      </div>

      {tab === "tasks" ? (
        <div className="space-y-3">
          {pending.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">{x("allDone")}</div>}
          {pending.map((task: any) => (
            <Card key={task.id} className="flex items-center gap-3">
              <CoinIcon src={task.image_url || ORAI_ICON} className="size-12" />
              <div className="min-w-0 flex-1">
                <div className="truncate">{task.title}</div>
                <div className="text-sm text-primary">+{fmt(task.reward)} ORAI</div>
              </div>
              <GhostButton onClick={() => onTask(task)} className="h-10">
                {opened[task.id] ? t("claim") : t("start")}
              </GhostButton>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <img src={invitation} alt={t("inviteFriends")} className="aspect-[3/2] w-full rounded-lg object-cover" />
          <div className="py-4 text-center">
            <div className="text-2xl">{t("inviteFriends")}</div>
            <div className="mt-2 text-sm text-muted-foreground">{lang === "ar" ? "اربح 10% إضافية من مكافآت تعدين أصدقائك" : "Earn an additional 10% of friends' mining rewards"}</div>
            <div className="mt-3 text-2xl text-primary">{fmt(Number(me.referral_earned ?? 0), 4)} ORAI</div>
          </div>
          <Card>
            <div className="text-lg">{t("inviteFriends")}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t("inviteText")} · +{REFERRAL_BONUS} ORAI</div>
            <PrimaryButton className="mt-4" onClick={() => shareReferral(invitation, link, lang).catch(() => toast.error(t("pending")))}>
              {lang === "ar" ? "مشاركة الدعوة والصورة" : "Share invitation & image"}
            </PrimaryButton>
            <GhostButton className="mt-2 w-full" onClick={() => { navigator.clipboard.writeText(link); toast(t("copied")); }}>{t("copyLink")}</GhostButton>
          </Card>
          <Card>
            <div className="mb-2 text-sm text-muted-foreground">{t("friends")} · {data.referrals.length}</div>
            {data.referrals.map((r: any) => (
              <div key={r.id} className="border-t border-muted py-2 first:border-0">{r.first_name || r.username}</div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
