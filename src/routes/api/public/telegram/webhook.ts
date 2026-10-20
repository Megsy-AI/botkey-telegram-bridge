import { createFileRoute } from "@tanstack/react-router";
import { pickLang } from "@/lib/i18n";

const START: Record<string, { text: string; btn: string }> = {
  en: { text: "<b>Welcome to ORAI</b>\n\n<b>Mine ORAI every 6 hours, complete tasks and grow your mining power.</b>", btn: "Open app" },
  ar: { text: "<b>أهلاً بك في ORAI</b>\n\n<b>عدّن ORAI كل 6 ساعات، أكمل المهام وزوّد قوة التعدين.</b>", btn: "افتح التطبيق" },
  ru: { text: "<b>Добро пожаловать в ORAI</b>\n\n<b>Майни ORAI каждые 6 часов, выполняй задания и увеличивай мощность.</b>", btn: "Открыть" },
  es: { text: "<b>Bienvenido a ORAI</b>\n\n<b>Mina ORAI cada 6 horas, completa tareas y aumenta tu poder.</b>", btn: "Abrir app" },
  fr: { text: "<b>Bienvenue sur ORAI</b>\n\n<b>Minez ORAI toutes les 6 heures et augmentez votre puissance.</b>", btn: "Ouvrir" },
  tr: { text: "<b>ORAI'ye hoş geldin</b>\n\n<b>Her 6 saatte ORAI kaz, görevleri tamamla ve gücünü artır.</b>", btn: "Uygulamayı aç" },
  fa: { text: "<b>به ORAI خوش آمدید</b>\n\n<b>هر ۶ ساعت ORAI استخراج کنید و قدرت خود را افزایش دهید.</b>", btn: "باز کردن" },
};

async function sha256b64url(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return new Response("Not configured", { status: 500 });
        const expected = await sha256b64url(`telegram-webhook:${token}`);
        if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const update = (await request.json()) as any;
        const msg = update.message;
        if (!msg?.text?.startsWith("/start")) return Response.json({ ok: true });

        const lang = pickLang(msg.from?.language_code);
        const s = START[lang] ?? START.en;
        const param = msg.text.split(" ")[1];
        const appUrl = process.env.APP_URL || new URL(request.url).origin;
        const url = param ? `${appUrl}/?tgWebAppStartParam=${encodeURIComponent(param)}` : appUrl;
        const photo = `${new URL(request.url).origin}/start-banner.jpg`;

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
