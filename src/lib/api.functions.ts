import { createServerFn } from "@tanstack/react-start";
import {
  MINING_HOURS, POWER_LEVELS, REFERRAL_BONUS, MIN_WITHDRAW, ORAI_JETTON, GRAM_ADDRESS,
  RECEIVE_WALLET, WITHDRAW_FEE_GRAM, ADMIN_USERNAMES, NFT_COLLECTION_ADDRESS, NFT_PRICE_GRAM,
  sessionReward, levelForHoldings, dailyOrai, MARKET_MAX_AGE,
} from "./config";

type Auth = { initData: string };
const auth = (i: Auth) => {
  if (typeof i?.initData !== "string" || !i.initData) throw new Error("Unauthorized");
  return i;
};

async function ctx(initData: string) {
  const { verifyInitData } = await import("./tg-auth.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const v = await verifyInitData(initData);
  return { ...v, db: supabaseAdmin };
}

async function loadUser(db: any, id: number) {
  const { data, error } = await db.from("tg_users").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export const bootstrap = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { user, startParam, db } = await ctx(data.initData);
    const { data: existing } = await db.from("tg_users").select("id").eq("id", user.id).maybeSingle();
    const profile = {
      id: user.id, username: user.username ?? null, first_name: user.first_name ?? null,
      photo_url: user.photo_url ?? null, language_code: user.language_code ?? null,
    };
    if (!existing) {
      const ref = startParam?.startsWith("ref_") ? Number(startParam.slice(4)) : null;
      const referred_by = ref && ref !== user.id ? ref : null;
      await db.from("tg_users").insert({ ...profile, referred_by });
      if (referred_by) {
        const { data: r } = await db.from("tg_users").select("balance").eq("id", referred_by).maybeSingle();
        if (r) await db.from("tg_users").update({ balance: Number(r.balance) + REFERRAL_BONUS }).eq("id", referred_by);
      }
    } else {
      await db.from("tg_users").update(profile).eq("id", user.id);
    }
    await syncPower(db, user.id);
    const [me, tasks, done, refs, wd] = await Promise.all([
      loadUser(db, user.id),
      db.from("tasks").select("*").eq("active", true).order("sort"),
      db.from("task_completions").select("task_id").eq("user_id", user.id),
      db.from("tg_users").select("id, first_name, username").eq("referred_by", user.id).limit(100),
      db.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    return {
      me,
      isAdmin: ADMIN_USERNAMES.includes((user.username ?? "").toLowerCase()),
      tasks: tasks.data ?? [],
      done: (done.data ?? []).map((d: any) => d.task_id as string),
      referrals: refs.data ?? [],
      withdrawals: wd.data ?? [],
    };
  });

export const startMining = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    const me = await loadUser(db, user.id);
    if (me.mining_started_at) throw new Error("Already mining");
    const synced = await syncPower(db, user.id);
    const now = new Date().toISOString();
    await db.from("tg_users").update({ mining_started_at: now, mining_settled_at: now, mining_pending: 0 }).eq("id", user.id);
    return { mining_started_at: now, mining_settled_at: now, mining_pending: 0, mining_rate_daily: synced.mining_rate_daily };
  });

export const claimMining = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    const me = await loadUser(db, user.id);
    if (!me.mining_started_at) throw new Error("Not mining");
    const { data: result, error } = await db.rpc("orange_mining_claim", { p_user_id: user.id });
    if (error) throw new Error(error.message);
    await syncPower(db, user.id);
    return { ...result, ...await loadUser(db, user.id) };
  });

export const completeTask = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { taskId: string }) => ({ ...auth(i), taskId: String(i.taskId) }))
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    const { data: task } = await db.from("tasks").select("*").eq("id", data.taskId).single();
    if (!task) throw new Error("Task not found");
    const { error } = await db.from("task_completions").insert({ user_id: user.id, task_id: task.id });
    if (error) throw new Error("Already completed");
    const me = await loadUser(db, user.id);
    const balance = Number(me.balance) + Number(task.reward);
    await db.from("tg_users").update({ balance }).eq("id", user.id);
    const synced = await syncPower(db, user.id);
    return { balance, power_level: synced.power_level };
  });

export const upgradePower = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { level: number }) => ({ ...auth(i), level: Number(i.level) }))
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    // Compatibility endpoint: holding coins grants power; never debit a balance.
    return syncPower(db, user.id);
  });

async function oraiHoldings(owner: string) {
  const url = `https://toncenter.com/api/v3/jetton/wallets?owner_address=${encodeURIComponent(owner)}&jetton_address=${ORAI_JETTON}&limit=1`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Blockchain lookup failed [${r.status}]`);
  const j = (await r.json()) as { jetton_wallets?: { balance: string }[] };
  return Number(j.jetton_wallets?.[0]?.balance ?? 0) / 1e9;
}

export const setWallet = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { address: string | null }) => ({ ...auth(i), address: i.address ? String(i.address).slice(0, 80) : null }))
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    await db.from("tg_users").update({ wallet_address: data.address, wallet_verified: false }).eq("id", user.id);
    return { ok: true };
  });

/** Grants the power level covered by ORAI the user actually holds in their connected wallet. */
export const verifyHoldings = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    return syncPower(db, user.id);
  });

/** Polls the receive wallet for an on-chain payment carrying a specific comment. */
async function findPayment(tag: string, minValue: number, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(`https://toncenter.com/api/v3/transactions?account=${RECEIVE_WALLET}&limit=100&sort=desc`);
      if (r.ok) {
        const j = (await r.json()) as any;
        const tx = (j.transactions ?? []).find((t: any) =>
          t.in_msg?.message_content?.decoded?.comment === tag && Number(t.in_msg?.value ?? 0) >= minValue);
        if (tx) return tx;
      }
    } catch { /* retry */ }
    await new Promise((res) => setTimeout(res, 4000));
  }
  return null;
}

export const requestWithdraw = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { amount: number }) => ({ ...auth(i), amount: Number(i.amount) }))
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    if (!(data.amount >= MIN_WITHDRAW)) throw new Error(`Minimum is ${MIN_WITHDRAW} ORAI`);
    const me = await loadUser(db, user.id);
    if (!me.wallet_address) throw new Error("Connect your wallet first");
    if (Number(me.balance) < data.amount) throw new Error("Not enough ORAI");
    const tx = await findPayment(`fee:${user.id}`, WITHDRAW_FEE_GRAM * 1e9);
    if (!tx) throw new Error("Fee payment not found yet, try again in a minute");
    const { data: used } = await db.from("withdrawals").select("id").eq("fee_tx", tx.hash).maybeSingle();
    if (used) throw new Error("This fee payment was already used");
    const balance = Number(me.balance) - data.amount;
    await db.from("tg_users").update({ balance }).eq("id", user.id);
    const { sendOrai } = await import("./payout.server");
    await sendOrai(me.wallet_address, data.amount);
    await db.from("withdrawals").insert({
      user_id: user.id, amount: data.amount, to_address: me.wallet_address, status: "sent", fee_tx: tx.hash,
    });
    return { balance, status: "sent" };
  });

async function marketSnapshot(db: any, force = false) {
  const { data: cached } = await db.from("market_snapshots").select("*").eq("id", "orai").maybeSingle();
  if (!force && cached && Date.now() - new Date(cached.updated_at).getTime() < MARKET_MAX_AGE) return cached.data;
  const get = async (addr: string) => {
    const response = await fetch(`https://api.ston.fi/v1/assets/${addr}`);
    if (!response.ok) throw new Error(`STON price unavailable [${response.status}]`);
    const json = await response.json() as any;
    const asset = json.asset ?? {};
    return { symbol: asset.symbol ?? "", name: asset.display_name ?? "", image: asset.image_url ?? "", priceUsd: Number(asset.dex_price_usd || asset.third_party_price_usd || 0) };
  };
  try {
    await ctx(data.initData);
    const [orai, gram] = await Promise.all([get(ORAI_JETTON), get(GRAM_ADDRESS)]);
    if (!Number.isFinite(orai.priceUsd) || orai.priceUsd <= 0) throw new Error("ORAI price unavailable");
    const result = { orai: { ...orai, symbol: "ORAI", name: orai.name || "Orange AI" }, gram: { ...gram, symbol: "GRAM", name: "Gram" }, updatedAt: new Date().toISOString(), stale: false };
    const { error } = await db.from("market_snapshots").upsert({ id: "orai", data: result, updated_at: result.updatedAt });
    if (error) throw new Error(error.message);
    return result;
  } catch (error) {
    console.error("Market refresh failed", error);
    if (cached) return { ...cached.data, stale: true };
    return { orai: { symbol: "ORAI", name: "Orange AI", image: "", priceUsd: 0 }, gram: { symbol: "GRAM", name: "Gram", image: "", priceUsd: 0 }, updatedAt: null, stale: true };
  }
}
async function syncPower(db: any, id: number) {
  const me = await loadUser(db, id);
  const market = await marketSnapshot(db);
  let external = 0;
  try { if (me.wallet_verified && me.wallet_address) external = await oraiHoldings(me.wallet_address); }
  catch { return { ...me, market, holdings: null, syncUnavailable: true }; }
  if (!market.orai.priceUsd || market.stale) return { ...me, market, holdings: Number(me.balance) + external, syncUnavailable: true };
  const holdings = Number(me.balance) + external;
  const level = levelForHoldings(holdings, market.orai.priceUsd);
  const pro = me.subscribed_until && new Date(me.subscribed_until).getTime() > Date.now();
  const rate = dailyOrai(level, market.orai.priceUsd) * (pro ? 2 : 1);
  const { error } = await db.rpc("orange_sync_power", { p_user_id: id, p_level: level, p_rate: rate });
  if (error) throw new Error(error.message);
  return { ...await loadUser(db, id), market, holdings, syncUnavailable: false };
}
export const getMarket = createServerFn({ method: "POST" }).inputValidator(auth).handler(async ({ data }) => {
  const { db } = await ctx(data.initData);
  return marketSnapshot(db);
});
export const refreshMarket = createServerFn({ method: "POST" }).inputValidator(auth).handler(async ({ data }) => {
  const { db } = await adminCtx(data.initData);
  return marketSnapshot(db, true);
});

export const walletBalances = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { address: string }) => ({ ...auth(i), address: String(i.address).slice(0, 80) }))
  .handler(async ({ data }) => {
    await ctx(data.initData);
    const [orai, gram] = await Promise.all([
      oraiHoldings(data.address).catch(() => 0),
      fetch(`https://toncenter.com/api/v3/account?address=${encodeURIComponent(data.address)}`)
        .then((r) => r.json() as Promise<any>).then((j) => Number(j.balance ?? 0) / 1e9).catch(() => 0),
    ]);
    return { orai, gram };
  });

export const SUB_PRICE_GRAM = 5;

/** Confirms a Pro payment on-chain (comment pro:<userId> to the receive wallet) and extends Pro by 30 days. */
export const verifySubscription = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { RECEIVE_WALLET } = await import("./config");
    const { user, db } = await ctx(data.initData);
    const r = await fetch(`https://toncenter.com/api/v3/transactions?account=${RECEIVE_WALLET}&limit=100&sort=desc`);
    if (!r.ok) throw new Error(`Blockchain lookup failed [${r.status}]`);
    const j = (await r.json()) as any;
    const tag = `pro:${user.id}`;
    const tx = (j.transactions ?? []).find((t: any) =>
      t.in_msg?.message_content?.decoded?.comment === tag && Number(t.in_msg?.value ?? 0) >= SUB_PRICE_GRAM * 1e9);
    if (!tx) throw new Error("Payment not found yet, try again in a minute");
    const me = await loadUser(db, user.id);
    const txTime = Number(tx.now) * 1000;
    const base = Math.max(Date.now(), me.subscribed_until ? new Date(me.subscribed_until).getTime() : 0);
    // only credit a payment made after the current period was purchased
    if (me.subscribed_until && txTime < new Date(me.subscribed_until).getTime() - 30 * 86400_000) throw new Error("Payment already used");
    const until = new Date(base + 30 * 86400_000).toISOString();
    await db.from("tg_users").update({ subscribed_until: until }).eq("id", user.id);
    return { subscribed_until: until };
  });

// ============= Admin =============

async function adminCtx(initData: string) {
  const c = await ctx(initData);
  if (!ADMIN_USERNAMES.includes((c.user.username ?? "").toLowerCase())) throw new Error("Forbidden");
  return c;
}

export const adminOverview = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { db } = await adminCtx(data.initData);
    const [users, withdrawals, tasks, nfts] = await Promise.all([
      db.from("tg_users").select("id, balance"),
      db.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(50),
      db.from("tasks").select("*").order("sort"),
      db.from("nfts").select("id"),
    ]);
    const list = (users.data ?? []) as { balance: number }[];
    return {
      users: list.length,
      totalBalance: list.reduce((s, u) => s + Number(u.balance), 0),
      withdrawals: withdrawals.data ?? [],
      tasks: tasks.data ?? [],
      nfts: (nfts.data ?? []).length,
    };
  });

export const adminAddTask = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { title: string; link: string; reward: number }) => ({
    ...auth(i), title: String(i.title).slice(0, 120), link: String(i.link).slice(0, 300), reward: Number(i.reward),
  }))
  .handler(async ({ data }) => {
    const { db } = await adminCtx(data.initData);
    if (!data.title || !(data.reward > 0)) throw new Error("Invalid task");
    const { error } = await db.from("tasks").insert({ title: data.title, link: data.link, reward: data.reward });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleTask = createServerFn({ method: "POST" })
  .inputValidator((i: Auth & { taskId: string; active: boolean }) => ({ ...auth(i), taskId: String(i.taskId), active: !!i.active }))
  .handler(async ({ data }) => {
    const { db } = await adminCtx(data.initData);
    const { error } = await db.from("tasks").update({ active: data.active }).eq("id", data.taskId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= NFT =============

/** Buys an NFT: verifies the on-chain payment, then mints the next item straight to the buyer's wallet. */
export const buyNft = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    if (!NFT_COLLECTION_ADDRESS) throw new Error("NFT collection is not available yet");
    const { user, db } = await ctx(data.initData);
    const me = await loadUser(db, user.id);
    if (!me.wallet_address) throw new Error("Connect your wallet first");
    const tx = await findPayment(`nft:${user.id}`, NFT_PRICE_GRAM * 1e9);
    if (!tx) throw new Error("Payment not found yet, try again in a minute");
    const { data: used } = await db.from("nfts").select("id").eq("tx_hash", tx.hash).maybeSingle();
    if (used) throw new Error("This payment was already used");
    const { count } = await db.from("nfts").select("id", { count: "exact", head: true });
    const itemIndex = count ?? 0;
    const { mintNft } = await import("./payout.server");
    await mintNft(NFT_COLLECTION_ADDRESS, itemIndex, me.wallet_address);
    await db.from("nfts").insert({ user_id: user.id, item_index: itemIndex, price_gram: NFT_PRICE_GRAM, tx_hash: tx.hash });
    return { itemIndex };
  });

export const myNfts = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    const { user, db } = await ctx(data.initData);
    const { data: rows } = await db.from("nfts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return { nfts: rows ?? [], collection: NFT_COLLECTION_ADDRESS, price: NFT_PRICE_GRAM };
  });
