import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { completeTask } from "@/lib/api.functions";
import { REFERRAL_BONUS } from "@/lib/config";
import { openLink, haptic } from "@/lib/telegram";
import { fmt } from "@/lib/ton";
import { Card, CoinIcon, GhostButton, ORAI_ICON, PrimaryButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/tasks")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ORAI Mining — Tasks" },
      { name: "description", content: "Complete tasks and invite friends to earn ORAI." },
      { property: "og:title", content: "ORAI Tasks" },
      { property: "og:description", content: "Complete tasks and invite friends to earn ORAI." },
    ],
  }),
  component: Tasks,
});

const BOT_USERNAME = "GamaCoinBot";

function Tasks() {
  const { data, t, initData, demo, setData } = useStore();
  const [tab, setTab] = useState<"tasks" | "refs">("tasks");
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const me = data!.me;
  const link = `https://t.me/${BOT_USERNAME}?start=ref_${me.id}`;

  async function onTask(task: any) {
    if (!opened[task.id]) {
      openLink(task.link);
      setOpened((o) => ({ ...o, [task.id]: true }));
      return;
    }
    if (demo) { toast(t("openInTelegram")); return; }
    try {
      const r = await completeTask({ data: { initData, taskId: task.id } });
      setData((d) => d && { ...d, me: { ...d.me, balance: r.balance }, done: [...d.done, task.id] });
      haptic("success");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <Title>{t("tasks")}</Title>
      <div className="glass mb-4 grid grid-cols-2 rounded-2xl p-1">
        {(["tasks", "refs"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`h-10 rounded-xl text-sm transition ${tab === k ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
            {k === "tasks" ? t("tasksTab") : t("referralsTab")}
          </button>
        ))}
      </div>

      {tab === "tasks" ? (
        <div className="space-y-3">
          {data!.tasks.map((task: any) => {
            const isDone = data!.done.includes(task.id);
            return (
              <Card key={task.id} className="flex items-center gap-3">
                <CoinIcon src={task.image_url || ORAI_ICON} className="size-12" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{task.title}</div>
                  <div className="text-sm text-primary">+{fmt(task.reward)} ORAI</div>
                </div>
                <GhostButton disabled={isDone} onClick={() => onTask(task)} className="h-10">
                  {isDone ? t("done") : opened[task.id] ? t("claim") : t("start")}
                </GhostButton>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <Card>
            <div className="text-lg">{t("inviteFriends")}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t("inviteText")} · +{REFERRAL_BONUS} ORAI</div>
            <PrimaryButton className="mt-4" onClick={() => { navigator.clipboard.writeText(link); toast(t("copied")); }}>
              {t("copyLink")}
            </PrimaryButton>
          </Card>
          <Card>
            <div className="mb-2 text-sm text-muted-foreground">{t("friends")} · {data!.referrals.length}</div>
            {data!.referrals.map((r: any) => (
              <div key={r.id} className="border-t border-muted py-2 first:border-0">{r.first_name || r.username}</div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
