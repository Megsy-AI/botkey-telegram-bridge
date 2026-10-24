import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { pickLang } from "@/lib/i18n";

const APP = "https://orangeorai.vercel.app";
const CHANNEL = "-1002616088306";
const BANNER = `${APP}/start-banner.jpg?v=20261021b`;
const MSG: Record<string, [string, string]> = {
  en: ["<b>Your ORAI mining is waiting</b>\n\n<b>Open Orange, claim your rewards and keep mining.</b>", "Open app"],
  ar: ["<b>تعدين ORAI في انتظارك</b>\n\n<b>افتح Orange، اجمع أرباحك واستمر في التعدين.</b>", "افتح التطبيق"],
  ru: ["<b>Ваш майнинг ORAI ждёт</b>\n\n<b>Откройте Orange, заберите награды и продолжайте.</b>", "Открыть"],
  es: ["<b>Tu minería de ORAI te espera</b>\n\n<b>Abre Orange, reclama tus recompensas y sigue minando.</b>", "Abrir app"],
  fr: ["<b>Votre minage ORAI vous attend</b>\n\n<b>Ouvrez Orange et récupérez vos gains.</b>", "Ouvrir"],
  tr: ["<b>ORAI madenciliğin seni bekliyor</b>\n\n<b>Orange'ı aç, ödüllerini topla.</b>", "Uygulamayı aç"],
  fa: ["<b>استخراج ORAI منتظر شماست</b>\n\n<b>Orange را باز کنید و پاداش خود را بگیرید.</b>", "باز کردن"],
};

async function tg(token: string, method: string, body: unknown) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return (await r.json().catch(() => ({ ok: false }))) as any;
}

async function channelText() {
  try {
    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    const r = await generateResponse({ model: "openai/gpt-6-astra", input: "Write a short Telegram channel post (2-3 sentences, English) for Orange, a Telegram mining app on TON where users mine ORAI coins every two hours, complete tasks, invite friends and raise mining power. Vary the angle each time. No emoji, no links, no hashtags. Return plain text only." });
    const text = (r.output ?? []).flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("").trim();
    if (text) return text.replace(/[<>&]/g, "").slice(0, 700);
  } catch (e) { console.error("Channel text failed", e); }
  return "Mine ORAI every two hours, complete tasks and grow your mining power with Orange.";
}

export const Route = createFileRoute("/api/public/jobs/bot")({ server: { handlers: { POST: async ({ request }) => {
  const failure = await authenticateCronRequest(request);
  if (failure) return failure;
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) return new Response("Not configured", { status: 500 });
  const body = (await request.json().catch(() => ({}))) as { kind?: string };

  if (body.kind === "channel") {
    const text = await channelText();
    const j = await tg(token, "sendPhoto", { chat_id: CHANNEL, photo: BANNER, caption: `<b>${text}</b>`, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Open app", url: "https://t.me/sramaibot?startapp" }]] } });
    if (!j.ok) console.error("Channel post failed", j.description);
    return Response.json({ ok: !!j.ok });
  }

  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data: users } = await db.from("tg_users").select("id,language_code").order("created_at", { ascending: false }).limit(2000);
  let sent = 0;
  const list = users ?? [];
  for (let i = 0; i < list.length; i += 25) {
    const res = await Promise.all(list.slice(i, i + 25).map((u: any) => {
      const [text, btn] = MSG[pickLang(u.language_code) as string] ?? MSG['en']!;
      return tg(token, "sendPhoto", { chat_id: u.id, photo: BANNER, caption: text, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: btn, web_app: { url: APP } }]] } });
    }));
    sent += res.filter((r) => r.ok).length;
    if (i + 25 < list.length) await new Promise((r) => setTimeout(r, 1100));
  }
  return Response.json({ ok: true, sent, total: list.length });
} } } });
