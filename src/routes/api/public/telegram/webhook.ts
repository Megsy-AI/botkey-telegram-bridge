import { createFileRoute } from "@tanstack/react-router";
import { pickLang } from "@/lib/i18n";

const START: Record<string, { text: string; btn: string }> & { en: { text: string; btn: string } } = {
  en: { text: "<b>Welcome to ORAI</b>\n\n<b>Mine ORAI every 2 hours, complete tasks and grow your mining power.</b>", btn: "Open app" },
  ar: { text: "<b>أهلاً بك في ORAI</b>\n\n<b>عدّن ORAI كل ساعتين، أكمل المهام وزوّد قوة التعدين.</b>", btn: "افتح التطبيق" },
  ru: { text: "<b>Добро пожаловать в ORAI</b>\n\n<b>Майни ORAI каждые 2 часа, выполняй задания и увеличивай мощность.</b>", btn: "Открыть" },
  es: { text: "<b>Bienvenido a ORAI</b>\n\n<b>Mina ORAI cada 2 horas, completa tareas y aumenta tu poder.</b>", btn: "Abrir app" },
  fr: { text: "<b>Bienvenue sur ORAI</b>\n\n<b>Minez ORAI toutes les 2 heures et augmentez votre puissance.</b>", btn: "Ouvrir" },
  tr: { text: "<b>ORAI'ye hoş geldin</b>\n\n<b>Her 2 saatte ORAI kaz, görevleri tamamla ve gücünü artır.</b>", btn: "Uygulamayı aç" },
  fa: { text: "<b>به ORAI خوش آمدید</b>\n\n<b>هر ۲ ساعت ORAI استخراج کنید و قدرت خود را افزایش دهید.</b>", btn: "باز کردن" },
};

// Public front door (Vercel). The webhook runs behind a proxy, so request.url is not the public host.
const PUBLIC_APP_URL = "https://orange-telegram.vercel.app";
const BANNER_VERSION = "20261021b";

async function sha256b64url(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env['TELEGRAM_BOT_TOKEN'];
        if (!token) return new Response("Not configured", { status: 500 });
        const expected = await sha256b64url(`telegram-webhook:${token}`);
        if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const update = (await request.json()) as any;
        const msg = update.message;
        const command = msg?.text?.split(/\s/)[0]?.split("@")[0];
        if (command === "/101") {
          const { isAdminUsername } = await import("@/lib/config");
          if (msg.chat?.type !== "private" || !isAdminUsername(msg.from?.username)) return Response.json({ ok: true });
          const url = PUBLIC_APP_URL;
          const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: msg.chat.id, text: "<b>Orange Admin</b>", parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "Admin", web_app: { url: `${url}/admin` } }]] } }) });
          if (!response.ok) console.error("Admin message failed", response.status);
          return Response.json({ ok: true });
        }
        if (command !== "/start") return Response.json({ ok: true });

        const lang = pickLang(msg.from?.language_code);
        const s = START[lang as string] ?? START.en;
        const param = msg.text.split(" ")[1];
        const url = PUBLIC_APP_URL;
        if (param?.startsWith("ref_") && msg.from?.id) {
          const ref = Number(param.slice(4));
          const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
          const { data: exists } = await db.from("tg_users").select("id").eq("id", msg.from.id).maybeSingle();
          if (!exists && ref && ref !== msg.from.id) {
            const { data: r } = await db.from("tg_users").select("balance").eq("id", ref).maybeSingle();
            if (r) {
              const { REFERRAL_BONUS } = await import("@/lib/config");
              await db.from("tg_users").insert({ id: msg.from.id, first_name: msg.from.first_name ?? null, username: msg.from.username ?? null, language_code: msg.from.language_code ?? null, referred_by: ref });
              await db.from("tg_users").update({ balance: Number(r.balance) + REFERRAL_BONUS }).eq("id", ref);
            }
          }
        }
        const photo = `${PUBLIC_APP_URL}/start-banner.jpg?v=${BANNER_VERSION}`;

        const r = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            photo,
            caption: s.text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: s.btn, web_app: { url } }]] },
          }),
        });
        if (!r.ok) console.error(`sendPhoto failed [${r.status}]: ${await r.text()}`);
        return Response.json({ ok: true });
      },
    },
  },
});
