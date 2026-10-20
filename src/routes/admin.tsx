import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { adminAddTask, adminOverview, adminToggleTask } from "@/lib/api.functions";
import { fmt } from "@/lib/ton";
import { Card, GhostButton, PrimaryButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orange — Admin" },
      { name: "description", content: "ORAI admin: stats, withdrawals and task management." },
      { property: "og:title", content: "ORAI Admin" },
      { property: "og:description", content: "ORAI admin: stats, withdrawals and task management." },
    ],
  }),
  component: AdminPage,
});

type Overview = Awaited<ReturnType<typeof adminOverview>>;

function AdminPage() {
  const { data, t, initData } = useStore();
  const [ov, setOv] = useState<Overview | null>(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [reward, setReward] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => adminOverview({ data: { initData } }).then(setOv).catch((e) => toast.error(e.message));
  useEffect(() => { if (data?.isAdmin) load(); }, [data?.isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data?.isAdmin) {
    return <Card className="mt-10 text-center text-muted-foreground">{t("adminsOnly")}</Card>;
  }

  async function addTask() {
    if (!title || !(Number(reward) > 0)) return;
    setBusy(true);
    try {
      await adminAddTask({ data: { initData, title, link, reward: Number(reward) } });
      setTitle(""); setLink(""); setReward("");
      await load();
      toast.success(t("done"));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function toggle(taskId: string, active: boolean) {
    try {
      await adminToggleTask({ data: { initData, taskId, active } });
      await load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-3">
      <Title>{t("admin")}</Title>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <div className="text-2xl">{ov ? fmt(ov.users, 0) : "—"}</div>
          <div className="text-xs text-muted-foreground">{t("users")}</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl">{ov ? fmt(ov.totalBalance, 0) : "—"}</div>
          <div className="text-xs text-muted-foreground">ORAI</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl">{ov ? fmt(ov.nfts, 0) : "—"}</div>
          <div className="text-xs text-muted-foreground">NFT</div>
        </Card>
      </div>

      <Card>
        <div className="mb-2 text-lg">{t("addTask")}</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("taskTitle")}
          className="mb-2 h-12 w-full rounded-2xl bg-card px-4 outline-none placeholder:text-muted-foreground" />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("taskLink")}
          className="mb-2 h-12 w-full rounded-2xl bg-card px-4 outline-none placeholder:text-muted-foreground" />
        <input inputMode="decimal" value={reward} onChange={(e) => setReward(e.target.value.replace(/[^0-9.]/g, ""))} placeholder={t("taskReward")}
          className="mb-3 h-12 w-full rounded-2xl bg-card px-4 outline-none placeholder:text-muted-foreground" />
        <PrimaryButton onClick={addTask} disabled={busy}>{t("save")}</PrimaryButton>
      </Card>

      <Card>
        <div className="mb-2 text-lg">{t("tasks")}</div>
        {(ov?.tasks ?? []).map((task: any) => (
          <div key={task.id} className="flex items-center justify-between gap-2 border-t border-muted py-2 text-sm first:border-0">
            <span className="flex-1">{task.title} · {fmt(task.reward)} ORAI</span>
            <GhostButton className="h-9 px-3 text-xs" onClick={() => toggle(task.id, !task.active)}>
              {task.active ? t("done") : t("pending")}
            </GhostButton>
          </div>
        ))}
      </Card>

      <Card>
        <div className="mb-2 text-lg">{t("withdrawals")}</div>
        {(ov?.withdrawals ?? []).map((w: any) => (
          <div key={w.id} className="flex justify-between border-t border-muted py-2 text-sm first:border-0">
            <span>{fmt(w.amount)} ORAI</span>
            <span className="text-muted-foreground">{w.status === "sent" ? t("sent") : w.status}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
