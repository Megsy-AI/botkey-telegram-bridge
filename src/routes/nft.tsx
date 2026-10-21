import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/nft")({
  head: () => ({ meta: [
    { title: "Orange — NFT collection" },
    { name: "description", content: "Explore Orange collectible characters and their mining, referral and task benefits." },
    { property: "og:title", content: "Orange — NFT collection" },
    { property: "og:description", content: "Explore Orange collectible characters and their mining, referral and task benefits." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/power", search: { tab: "nft" } });
  },
});
