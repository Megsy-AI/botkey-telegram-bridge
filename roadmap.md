# Orange — task roadmap

## Current requests
- [x] Refresh bot token: getMe identifies @sramaibot; webhook and menu registered; referral links updated.
- [x] Dedicated referral artwork; remove wallet/tasks titles; ten vertical rectangular NFT showcases and per-tier increase-power buttons. Browser tested at 434×763 and 1280×1800; no runtime errors or overflow. Eleven existing tests pass.
- [x] Owner-provided https://getgems.io/orangeai above NFT list; receive-wallet royalty address provided.
- [x] Review GitHub→Vercel standalone hosting: current Vercel is a catch-all proxy; full standalone app requires a secure replacement for inaccessible managed service-role access. GitHub API connector has no accessible connection; Git sync must be managed through project Git settings.
- [ ] Badge removal / independent GitHub→Vercel deployment blocked: badge tool requires Pro; independent hosting needs a separately approved secure backend migration, not a proxy or exposed credentials.
- [x] Republish the current app through the Vercel front door; production READY and browser HTTP 200 with no page errors. Lovable badge remains visible due to plan restriction.
- [x] New /start banner image (solid orange background, no circles) and full Vercel redeploy with orange nav tabs; verified live at orange-telegram.vercel.app with no page errors.
- [x] Fixed stale Vercel bundle (old JS was deployed): full rebuild + redeploy; verified live chunks contain orange nav, NFT config with Getgems link, and orange.coin manifest. Verified bot webhook pipeline end-to-end (token @sramaibot valid, secret matches, endpoint 200).
- [x] Audit actual language coverage: EN/AR main catalogs and profile content, 11 partial website languages; /start localized in 7 languages. Bot reminders not implemented.
- [x] Explain proposed NFT purchase, mint, ownership and additional-mining benefits; no bonus rates approved yet.
- [ ] NFT activation awaits owner-signed collection ownership transfer and verified contract mint/ownership flow; native TON is labeled GRAM, collection and artwork are configured.

## Completed
- [x] Continuous mining, two-hour accumulation cap and automatic restart on claim; atomic claim and 10% additional referral credit.
- [x] No ORAI deduction to unlock power; staged USD holding tiers with hourly market snapshots and automatic up/down synchronization when price is available.
- [x] Wallet ownership proof before external holdings count.
- [x] Clean home, elevated mining controls, NFT home entry, clean wallet/dialogs and profile instead of Swap.
- [x] /101 admin entry with server authorization; daily localized in-app notification.
- [x] Referral character image and prepared native-sharing message; Megsy AI description and draft white paper/roadmap.
- [x] V5 payout fix, atomic withdrawal reservation and confirmation checks. Real 0.01 ORAI transfer between project wallets confirmed; full user fee/payment flow still not exercised.
- [x] Nine tests pass; authenticated Arabic mobile pages load without runtime errors or horizontal overflow.
- [x] Lovable publishing requested.
- [x] Vercel reverse-proxy deployment ready at https://orange-telegram.vercel.app; authenticated Arabic UI and Cloud reads verified, no runtime errors.

## Blocked / incomplete
- [ ] Dollar pricing and prefilled purchase amount: STON.fi currently reports no ORAI liquidity and no price. Quantity copy/open fallback implemented; STON URL amount selection is undocumented.
- [ ] NFT: owner must supply collection address, price, metadata and compatible mint contract. Current mint must be reviewed against that contract before enabling.
- [ ] Full user withdrawal flow: requires user wallet signature and fee; only direct real payout was verified. Ambiguous broadcasts stay pending for safe reconciliation.
- [ ] Automatic deposit crediting: existing payments do not yet automatically credit app balance; needs verified chain ledger reconciliation.
- [ ] White paper funding/supply/audit/legal content requires owner approval; current pages explicitly marked draft.
- [ ] Daily channel AI posts intentionally paused by user request.
- [ ] Telegram bot daily reminders requested; delivery scheduling not implemented (in-app bell removed).

## Completed (2026-10-21 UI overhaul)
- Home: removed Orange text/username/level row; big user photo with circular mining progress ring.
- Power: removed header/search/price texts; tiers $0.10–$10,000 clean list; buy dialog computes GRAM amount and copies it + opens STON.fi; NFT merged as a tab (/nft redirects).
- Wallet: removed disconnect/verify buttons; wallet proof verification is automatic and silent (no more repeated failure toasts).
- Tasks: completed tasks hidden; real membership verification via bot getChatMember for t.me channel/group links.
- Profile: sections are now full separate pages (/guide /about /premium /supporter /whitepaper /roadmap) with expanded bilingual content; premium subscribe moved to /premium.
- Nav: new icons (House, Gift, Gauge, Wallet, CircleUserRound); in-app notification bell removed (bot notifications only).

## NFT (2026-10-21)
- [x] 10 tiers (0.5→300 GRAM) with mining/referral/task boosts, new characters, Getgems collection linked, new /start image
- [ ] Automatic mint into buyer wallet — blocked: collection owner is the receive wallet; ownership must move to the payout wallet (purchases are recorded as pending mint until then)
- [x] Remove wallet address from wallet banner
- [x] Show withdraw/deposit once wallet connected
- [x] Redesign power level cards
- [x] Remove "Start" task; STON buy task with real on-chain check
- [x] Add channel as task
- [x] Auto-translate admin-added tasks
- [x] Redesign profile page
- [x] Complete translations for all languages
- [x] Tasks grouped by app: app card (name+image) opens its own tasks page; admin sets image per task/app
- [x] NFT minting via Getgems minting API (minting wallet must hold GRAM)
- [x] Fix automatic withdrawals
- [x] Wallet balance flicker + mined coins not showing
- [x] Android-style top notifications
- [ ] In-app real ORAI buy through DEX pool (needs owner decision on liquidity pool)
- [x] Save every /start user in DB even without opening app
- [x] Broadcast bot message every 4 hours
- [x] Fix automatic channel posts
