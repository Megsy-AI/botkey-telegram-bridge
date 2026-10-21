import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { InfoPage } from "@/components/ui-kit";

export const Route = createFileRoute("/whitepaper")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — White paper" }, { name: "description", content: "Orange white paper draft: mining model, holding rewards and tokenomics." },
  { property: "og:title", content: "Orange White Paper" }, { property: "og:description", content: "Orange white paper draft: mining model, holding rewards and tokenomics." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Whitepaper });

function Whitepaper() {
  const { x, lang } = useStore();
  const ar = lang === "ar";
  const sections = ar ? [
    { h: "مسودة", p: "هذه مسودة أولية للورقة البيضاء وليست نسخة نهائية. تفاصيل التمويل والمعروض الكلي والاستدامة والتدقيق والشروط القانونية لم يعتمدها صاحب المشروع بعد." },
    { h: "الهوية والوصول", p: "يستخدم Orange هوية تليجرام للدخول — لا كلمات مرور ولا تسجيل. تُربط المحافظ عبر TON Connect الرسمي، ولا يطلب التطبيق مفاتيح خاصة إطلاقًا." },
    { h: "نموذج التعدين", p: "يعمل التعدين بشكل مستمر بعد الضغط على زر البدء، بسقف تراكم كل ساعتين. بعد الاستلام يبدأ التراكم من جديد تلقائيًا. المعدل اليومي يعتمد على مستوى الاحتفاظ." },
    { h: "مكافآت الاحتفاظ", p: "النموذج الحالي يستهدف عائدًا يوميًا 20% من قيمة مستوى الاحتفاظ المحدد، يُدفع بعملة ORAI. المستويات تمتد من 0.10$ إلى 10,000$، وتُحدّث تلقائيًا صعودًا وهبوطًا مع تغير احتفاظك وسعر السوق." },
    { h: "الإحالات والمهام", p: "مكافأة الإحالة 25 ORAI لكل صديق، بالإضافة إلى عمولة مستمرة 10% من مكافآت تعدين المدعوين. المهام تمنح مكافآت ثابتة بعد التحقق من إتمامها." },
    { h: "الرسوم والسحب", p: "السحب بعملة ORAI فقط بحد أدنى 100 ORAI ورسوم ثابتة 0.15 GRAM لكل عملية، تُستخدم لتغطية تكاليف التشغيل على الشبكة." },
    { h: "إخلاء مسؤولية", p: "هذه الوثيقة ليست عرضًا استثماريًا ولا ضمانًا للعوائد. أسعار العملات الرقمية متقلبة وقد تفقد قيمتها." },
  ] : [
    { h: "Draft", p: "This is a preliminary draft of the white paper, not a final version. Funding, total supply, sustainability, audit and legal terms have not yet been approved by the project owner." },
    { h: "Identity & access", p: "Orange uses Telegram identity for sign-in — no passwords, no registration. Wallets connect via the official TON Connect, and the app never asks for private keys." },
    { h: "Mining model", p: "Mining runs continuously after pressing start, with a two-hour accumulation cap. After claiming, accumulation restarts automatically. The daily rate depends on the holding level." },
    { h: "Holding rewards", p: "The current model targets a daily yield of 20% of the selected holding tier value, paid in ORAI. Tiers range from $0.10 to $10,000 and update automatically, up and down, as your holdings and the market price change." },
    { h: "Referrals & tasks", p: "The referral bonus is 25 ORAI per friend, plus an ongoing 10% commission on invited users' mining rewards. Tasks grant fixed rewards after verified completion." },
    { h: "Fees & withdrawals", p: "Withdrawals are in ORAI only, with a 100 ORAI minimum and a flat 0.15 GRAM fee per withdrawal, used to cover on-chain operating costs." },
    { h: "Disclaimer", p: "This document is not an investment offer or a guarantee of returns. Cryptocurrency prices are volatile and may lose value." },
  ];
  return <InfoPage title={x("whitepaper")} sections={sections} />;
}
