import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { InfoPage } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — About the project" }, { name: "description", content: "About Orange, the ORAI token and the TON network." },
  { property: "og:title", content: "About Orange & ORAI" }, { property: "og:description", content: "About Orange, the ORAI token and the TON network." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: About });

function About() {
  const { x, lang } = useStore();
  const ar = lang === "ar";
  const sections = ar ? [
    { h: "ما هو Orange؟", p: "Orange تطبيق مصغّر داخل تليجرام مبني على شبكة TON. يتيح لك تعدين عملة ORAI ومتابعة رصيدك ومحفظتك من مكان واحد، بهوية تليجرام الخاصة بك دون تسجيل إضافي." },
    { h: "ما هي عملة ORAI؟", p: "ORAI هي عملة المشروع على شبكة TON. يمكنك تعدينها داخل التطبيق، أو شراؤها من منصة STON.fi، أو إيداعها وسحبها من صفحة المحفظة." },
    { h: "كيف تعمل المكافآت؟", p: "مكافآت التعدين تعتمد على قيمة ORAI التي تحتفظ بها. كلما زادت قيمة احتفاظك زاد مستواك وعائدك اليومي تلقائيًا، دون خصم أي عملات منك." },
    { h: "الشفافية", p: "جميع المدفوعات والسحوبات تتم على سلسلة TON ويمكن التحقق منها علنًا. ربط المحفظة يتم عبر TON Connect الرسمي ولا نطلب مفاتيحك الخاصة أبدًا." },
    { h: "المخاطر", p: "أسعار العملات الرقمية متقلبة. المكافآت والسيولة غير مضمونة، والأرقام المعروضة بالدولار تقديرية. لا تستثمر أكثر مما تتحمل خسارته." },
  ] : [
    { h: "What is Orange?", p: "Orange is a Telegram Mini App built on the TON network. It lets you mine the ORAI token and manage your balance and wallet in one place, using your Telegram identity with no extra sign-up." },
    { h: "What is ORAI?", p: "ORAI is the project's token on TON. You can mine it inside the app, buy it on STON.fi, or deposit and withdraw it from the wallet page." },
    { h: "How do rewards work?", p: "Mining rewards depend on the value of ORAI you hold. The higher your holdings, the higher your level and daily yield — automatically, without any coins being deducted from you." },
    { h: "Transparency", p: "All payments and withdrawals happen on the TON blockchain and are publicly verifiable. Wallet connection uses the official TON Connect and we never ask for your private keys." },
    { h: "Risks", p: "Cryptocurrency prices are volatile. Rewards and liquidity are not guaranteed, and displayed dollar figures are estimates. Never invest more than you can afford to lose." },
  ];
  return <InfoPage title={x("about")} sections={sections} />;
}
