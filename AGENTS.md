<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- App runs as a Telegram Mini App: every server function receives Telegram initData and verifies it server-side (src/lib/tg-auth.server.ts); no Supabase auth. Why: identity comes from Telegram.
- All tables are service-role only (RLS on, no policies); access goes through server functions. Why: no browser sessions.
- App shell (TON Connect, store) is client-only via ClientOnly + lazy import, and routes set ssr:false. Why: TON Connect and Telegram SDK need window.
- @ton/core needs src/lib/buffer-polyfill imported before it, plus the `buffer-polyfill-resolve` pre plugin in vite.config.ts (client-only, ssr option check) and `sideEffects` whitelist in package.json. Why: Buffer missing in browsers; without the plugin Vite stubs `buffer` as an empty browser-external in the client build, and without the ssr check the workerd server build fails on base64-js.
- Business constants (wallets, levels, mining hours) live in src/lib/config.ts.
