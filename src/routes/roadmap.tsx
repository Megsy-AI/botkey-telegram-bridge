import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { InfoPage } from "@/components/ui-kit";

export const Route = createFileRoute("/roadmap")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — Roadmap" }, { name: "description", content: "Orange project roadmap: what is live and what comes next." },
  { property: "og:title", content: "Orange Roadmap" }, { property: "og:description", content: "Orange project roadmap: what is live and what comes next." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Roadmap });

function Roadmap() {
  const { x, lang } = useStore();
  const ar = lang === "ar";
  const sections = ar ? [
    { h: "متاح الآن", p: "تطبيق تليجرام كامل: تعدين مستمر بسقف ساعتين، مهام بتحقق حقيقي، نظام إحالات بعمولة 10%، ربط محافظ TON مع تحقق تلقائي من الملكية، وسحوبات ORAI على الشبكة." },
    { h: "قيد التنفيذ", p: "اعتماد مجموعة NFT: العنوان والسعر والبيانات الوصفية وعقد الإنشاء، ثم اختبار الشراء والإنشاء الفوري على الشبكة قبل التفعيل للجميع." },
    { h: "التالي", p: "استكمال اختبارات السحب الكاملة بتوقيع المستخدم، وتفعيل الإيداع التلقائي الذي يضيف المدفوعات الواردة لرصيدك داخل التطبيق بعد التحقق منها على الشبكة." },
    { h: "بعد ذلك", p: "اعتماد الورقة البيضاء النهائية بتفاصيل التمويل والمعروض، وتطوير لوحة الإدارة، وإطلاق منشورات القناة اليومية بعد موافقة صاحب المشروع." },
    { h: "ملاحظة", p: "المواعيد غير معتمدة بعد؛ تُنفَّذ البنود بالترتيب حسب الجاهزية والاختبار." },
  ] : [
    { h: "Live now", p: "The full Telegram app: continuous mining with a two-hour cap, tasks with real verification, a referral system with 10% commission, TON wallet connection with automatic ownership verification, and on-chain ORAI withdrawals." },
    { h: "In progress", p: "Finalizing the NFT collection: address, price, metadata and minting contract, then testing purchase and instant minting on-chain before enabling it for everyone." },
    { h: "Next", p: "Completing full user-signed withdrawal testing, and enabling automatic deposits that credit incoming payments to your in-app balance after on-chain verification." },
    { h: "Later", p: "Approving the final white paper with funding and supply details, expanding the admin panel, and launching daily channel posts after the project owner's approval." },
    { h: "Note", p: "Dates are not committed yet; items ship in order of readiness and testing." },
  ];
  return <InfoPage title={x("roadmap")} sections={sections} />;
}
