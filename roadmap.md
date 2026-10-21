# Orange — task roadmap

## Current requests
- [x] Republish the current app through the Vercel front door; production READY and browser HTTP 200 with no page errors. Lovable badge remains visible due to plan restriction.
- [x] Audit actual language coverage: EN/AR main catalogs and profile content, 11 partial website languages; /start localized in 7 languages. Bot reminders not implemented.
- [x] Explain proposed NFT purchase, mint, ownership and additional-mining benefits; no bonus rates approved yet.
- [ ] NFT activation awaits collection address/contract, GRAM jetton address, artwork, price and approved benefit rules; implement safe orders and confirmed mint before sale.

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
