import { createFileRoute } from "@tanstack/react-router";
import { SWAP_URL } from "@/lib/config";

export const Route = createFileRoute("/swap")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orange — Swap" },
      { name: "description", content: "Buy ORAI with GRAM on STON.fi." },
      { property: "og:title", content: "Swap GRAM to ORAI" },
      { property: "og:description", content: "Buy ORAI with GRAM on STON.fi." },
    ],
  }),
  component: () => (
    <div className="glass -mx-1 flex-1 overflow-hidden rounded-3xl">
      <iframe src={SWAP_URL} title="STON.fi" className="h-[calc(100dvh-180px)] w-full border-0" allow="clipboard-write" />
    </div>
  ),
});
