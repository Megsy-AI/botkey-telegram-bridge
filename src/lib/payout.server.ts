import { Address, beginCell, internal, SendMode, toNano, TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { ORAI_JETTON, PAYOUT_WALLET } from "./config";

const client = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC" });

async function payoutWallet() {
  const words = process.env.PAYOUT_WALLET_MNEMONIC;
  if (!words) throw new Error("Payout wallet not configured");
  const key = await mnemonicToPrivateKey(words.trim().split(/\s+/));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
  return { key, contract: client.open(wallet) };
}

async function oraiJettonWallet(owner: string) {
  const r = await fetch(
    `https://toncenter.com/api/v3/jetton/wallets?owner_address=${encodeURIComponent(owner)}&jetton_address=${ORAI_JETTON}&limit=1`,
  );
  if (!r.ok) throw new Error(`Blockchain lookup failed [${r.status}]`);
  const j = (await r.json()) as { jetton_wallets?: { address: string }[] };
  const addr = j.jetton_wallets?.[0]?.address;
  if (!addr) throw new Error("Payout wallet has no ORAI jetton wallet");
  return addr;
}

/** Sends ORAI from the payout wallet to a user address. */
export async function sendOrai(to: string, amount: number) {
  const { key, contract } = await payoutWallet();
  const jettonWallet = await oraiJettonWallet(PAYOUT_WALLET);
  const body = beginCell()
    .storeUint(0xf8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(toNano(amount.toFixed(9)))
    .storeAddress(Address.parse(to))
    .storeAddress(Address.parse(PAYOUT_WALLET))
    .storeBit(0)
    .storeCoins(toNano("0.01"))
    .storeBit(0)
    .endCell();
  const seqno = await contract.getSeqno();
  await contract.sendTransfer({
    seqno,
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [internal({ to: jettonWallet, value: toNano("0.05"), body })],
  });
  return { seqno };
}

/** Mints the next item of the owner's NFT collection straight to the buyer's wallet. */
export async function mintNft(collection: string, itemIndex: number, owner: string) {
  const { key, contract } = await payoutWallet();
  const content = beginCell()
    .storeAddress(Address.parse(owner))
    .storeRef(beginCell().storeUint(0, 8).endCell())
    .endCell();
  const body = beginCell()
    .storeUint(1, 32)
    .storeUint(Date.now(), 64)
    .storeUint(itemIndex, 64)
    .storeCoins(toNano("0.05"))
    .storeRef(content)
    .endCell();
  const seqno = await contract.getSeqno();
  await contract.sendTransfer({
    seqno,
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [internal({ to: collection, value: toNano("0.08"), body })],
  });
  return { seqno, itemIndex };
}
