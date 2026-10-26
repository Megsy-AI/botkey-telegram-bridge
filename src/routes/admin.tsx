import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { adminAddApp, adminAddTask, adminOverview, adminToggleTask, adminMintPending } from "@/lib/api.functions";
import { fmt, changeOwnerPayload } from "@/lib/ton";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { NFT_COLLECTION_ADDRESS, PAYOUT_WALLET } from "@/lib/config";

function NftOwnerCard() {
  const { initData } = useStore();
  const [tc] = useTonConnectUI();
  const [busy, setBusy] = useState(false);
  async function transfer() {
    if (!tc.connected) { tc.openModal(); return; }
    setBusy(true);
    try {
      await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: NFT_COLLECTION_ADDRESS, amount: "50000000", payload: changeOwnerPayload(PAYOUT_WALLET) }] });
      toast.success("تم الإرسال — انتظر دقيقة ثم اضغط إنشاء المعلّق");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function mint() {
    setBusy(true);
    try { const r = await adminMintPending({ data: { initData } }); toast.success(`Minted ${r.minted}, waiting ${r.pending}`); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }
  return (
    <Card className="space-y-2">
      <div className="font-bold">NFT</div>
      <p className="text-xs text-muted-foreground">اربط محفظة الاستلام (مالكة المجموعة) ووافق — رسوم 0.05 GRAM.</p>
      <PrimaryButton onClick={transfer} disabled={busy}>نقل ملكية المجموعة لمحفظة السحب</PrimaryButton>
      <GhostButton className="w-full" onClick={mint} disabled={busy}>إنشاء الـNFT المعلّقة</GhostButton>
    </Card>
  );
}
import { Card, GhostButton, PrimaryButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [appId, setAppId] = useState("");
  const [addingApp, setAddingApp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appName, setAppName] = useState("");
  const [image, setImage] = useState("");
  function pickImage(f?: File) {
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const k = Math.max(160 / img.width, 160 / img.height);
      const context = c.getContext("2d");
      if (!context) return;
      context.drawImage(img, (160 - img.width * k) / 2, (160 - img.height * k) / 2, img.width * k, img.height * k);
      setImage(c.toDataURL("image/jpeg", 0.85)); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  }

  const load = () => adminOverview({ data: { initData } }).then(setOv).catch((e) => toast.error(e.message));
  useEffect(() => { if (data?.isAdmin) load(); }, [data?.isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data?.isAdmin) {
    return <Card className="mt-10 text-center text-muted-foreground">{t("adminsOnly")}</Card>;
  }

  async function addTask() {
    if (!title || !link || !appId) return;
    setBusy(true);
    try {
      await adminAddTask({ data: { initData, title, link, appId } });
      setTitle(""); setLink("");
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

      <section className="space-y-3">
        <PrimaryButton onClick={() => setAddingApp(v => !v)}>إضافة تطبيق</PrimaryButton>
        {addingApp && <div className="space-y-3">
          <input aria-label="اسم التطبيق" value={appName} onChange={e => setAppName(e.target.value)} placeholder="اسم التطبيق" className="h-12 w-full rounded-xl bg-card px-4" />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3">
            {image && <img src={image} alt="" className="size-12 rounded-xl object-cover" />}
            صورة التطبيق<input type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0])} />
          </label>
          <PrimaryButton disabled={busy || !appName.trim() || !image} onClick={async () => {
            setBusy(true);
            try { await adminAddApp({ data: { initData, name: appName, image } }); setAppName(""); setImage(""); setAddingApp(false); await load(); }
            catch(e) { toast.error(e instanceof Error ? e.message : "Error"); } finally { setBusy(false); }
          }}>{t("save")}</PrimaryButton>
        </div>}
        <label className="block text-sm font-bold" htmlFor="task-app">اختار التطبيق</label>
        <select id="task-app" value={appId} onChange={e => setAppId(e.target.value)} className="h-12 w-full rounded-xl bg-card px-4">
          <option value="">اختار التطبيق</option>
          {(ov?.apps ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {appId && <div className="space-y-3">
          <h2 className="font-bold">{t("addTask")}</h2>
          <input aria-label={t("taskTitle")} value={title} onChange={e => setTitle(e.target.value)} placeholder={t("taskTitle")} className="h-12 w-full rounded-xl bg-card px-4" />
          <input aria-label={t("taskLink")} type="url" value={link} onChange={e => setLink(e.target.value)} placeholder={t("taskLink")} className="h-12 w-full rounded-xl bg-card px-4" />
          <PrimaryButton onClick={addTask} disabled={busy || !title.trim() || !link}>{t("save")}</PrimaryButton>
        </div>}
      </section>
      <NftOwnerCard />

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
