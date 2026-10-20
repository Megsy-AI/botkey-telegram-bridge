import "@/lib/buffer-polyfill";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toNano } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useStore } from "@/lib/store";
import { buyNft, myNfts } from "@/lib/api.functions";
import { NFT_COLLECTION_ADDRESS, NFT_PRICE_GRAM, RECEIVE_WALLET } from "@/lib/config";
import { commentPayload } from "@/lib/ton";
import { haptic } from "@/lib/telegram";
import { Card, CoinIcon, ORAI_ICON, PrimaryButton, Title } from "@/components/ui-kit";

export const Route = createFileRoute("/nft")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orange — NFT" },
      { name: "description", content: "Buy an ORAI NFT — minted instantly to your wallet." },
      { property: "og:title", content: "ORAI NFT" },
      { property: "og:description", content: "Buy an ORAI NFT — minted instantly to your wallet." },
    ],
  }),
  component: NftPage,
});

function NftPage() {
  const { data, t, initData, demo } = useStore();
  const me = data!.me;
  const address = useTonAddress();
  const [tc] = useTonConnectUI();
  const [owned, setOwned] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => { if (!demo) myNfts({ data: { initData } }).then((r) => setOwned(r.nfts)).catch(() => {}); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const available = !!NFT_COLLECTION_ADDRESS;

  async function buy() {
    if (demo) { toast(t("openInTelegram")); return; }
    if (!address) { tc.openModal(); return; }
    setBusy(true);
    try {
      await tc.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: RECEIVE_WALLET, amount: toNano(NFT_PRICE_GRAM.toString()).toString(), payload: commentPayload(`nft:${me.id}`) }],
      });
      toast(t("pending"));
      await new Promise((r) => setTimeout(r, 12000));
      await buyNft({ data: { initData } });
      haptic("success");
      toast.success(t("done"));
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <Title>NFT</Title>

      <Card className="text-center">
        <div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-3xl bg-accent">
          <CoinIcon src={ORAI_ICON} className="size-16" />
        </div>
        {available ? (
          <>
            <div className="text-lg">ORAI NFT</div>
            <div className="mt-1 text-sm text-muted-foreground">{t("price")}: {NFT_PRICE_GRAM} GRAM</div>
            <PrimaryButton className="mt-4" onClick={buy} disabled={busy}>{t("buyNft")}</PrimaryButton>
          </>
        ) : (
          <div className="text-muted-foreground">{t("nftSoon")}</div>
        )}
      </Card>

      {owned.length > 0 && (
        <Card>
          {owned.map((n) => (
            <div key={n.id} className="flex justify-between border-t border-muted py-2 text-sm first:border-0">
              <span>ORAI NFT #{n.item_index}</span>
              <span className="text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
