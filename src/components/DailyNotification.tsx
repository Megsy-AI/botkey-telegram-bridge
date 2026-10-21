import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { GhostButton } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export function DailyNotification() {
  const { data, x } = useStore();
  const [unread, setUnread] = useState(false), [open, setOpen] = useState(false);
  const day = new Date().toLocaleDateString("en-CA");
  const key = `orange:notification:${data?.me.id}:${day}`;
  useEffect(() => { setUnread(!localStorage.getItem(key)); }, [key]);
  return <><GhostButton title={x("notifications")} aria-label={x("notifications")} onClick={() => { setOpen(true); setUnread(false); localStorage.setItem(key, "read"); }} className="relative flex size-9 items-center justify-center rounded-full p-0"><Bell className="size-4" />{unread && <span className="absolute end-1 top-1 size-2 rounded-full bg-primary" />}</GhostButton><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>{x("notifications")}</DialogTitle><div className="text-xs text-muted-foreground">{x("day")} · {day}</div><DialogDescription className="text-start leading-7">{x("dailyNotice")}</DialogDescription></DialogContent></Dialog></>;
}