import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { InfoPage } from "@/components/ui-kit";

export const Route = createFileRoute("/guide")({ ssr: false, head: () => ({ meta: [
  { title: "Orange — How to earn" }, { name: "description", content: "How mining, tasks, referrals and holding rewards work in Orange." },
  { property: "og:title", content: "Orange — How to earn" }, { property: "og:description", content: "How mining, tasks, referrals and holding rewards work in Orange." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
]}), component: Guide });

function Guide() {
  const { x, lang } = useStore();
  const ar = lang === "ar";
  const sections = ar ? [
    { h: "التعدين", p: "اضغط زر بدء التعدين مرة واحدة. بعدها يعمل التعدين تلقائيًا بلا توقف، وتتراكم مكافآت ORAI حتى حد الساعتين. عندما يمتلئ الشريط الدائري حول صورتك بالكامل، اضغط استلام لتحصل على المكافأة ويبدأ التراكم من جديد تلقائيًا." },
    { h: "المهام", p: "افتح صفحة المهام ونفّذ المهام المتاحة مثل الانضمام للقنوات. يتم التحقق من إتمام المهمة تلقائيًا، وتُضاف المكافأة لرصيدك فورًا. المهام المكتملة تختفي من القائمة." },
    { h: "الإحالات", p: "شارك رابط الدعوة مع أصدقائك. تحصل على 25 ORAI عن كل صديق ينضم، بالإضافة إلى 10% من مكافآت تعدين كل شخص دعوته، بشكل مستمر." },
    { h: "قوة الاحتفاظ", p: "كلما زادت قيمة ORAI التي تحتفظ بها — داخل التطبيق أو في محفظتك المرتبطة — زاد مستواك تلقائيًا وزاد عائدك اليومي. المستويات تبدأ من 0.10$ وتصل إلى 10,000$ بعائد يومي 20% من قيمة المستوى، يُدفع بعملة ORAI. لا نخصم عملاتك أبدًا؛ أنت تشتري وتحتفظ فقط." },
    { h: "السحب", p: "السحب بعملة ORAI فقط، بحد أدنى 100 ORAI ورسوم 0.15 GRAM. اربط محفظتك من صفحة المحفظة وسيصلك المبلغ عليها مباشرة." },
    { h: "تنبيه مهم", p: "الأرقام بالدولار تقديرية بناءً على سعر السوق المحدّث كل ساعة، وليست أرباحًا نقدية مضمونة. سعر العملة متغير." },
  ] : [
    { h: "Mining", p: "Press start mining once. Mining then runs automatically forever, accumulating ORAI rewards up to the two-hour cap. When the ring around your photo is full, tap claim to collect and the cycle restarts automatically." },
    { h: "Tasks", p: "Open the tasks page and complete available tasks such as joining channels. Completion is verified automatically and the reward is added to your balance instantly. Completed tasks disappear from the list." },
    { h: "Referrals", p: "Share your invitation link. You earn 25 ORAI for every friend who joins, plus an ongoing 10% of the mining rewards of everyone you invited." },
    { h: "Holding power", p: "The more ORAI value you hold — in the app or in your linked wallet — the higher your level and daily reward, automatically. Levels run from $0.10 up to $10,000 with a daily yield of 20% of the tier value, paid in ORAI. Your coins are never deducted; you only buy and hold." },
    { h: "Withdrawals", p: "Withdrawals are in ORAI only, with a 100 ORAI minimum and a 0.15 GRAM fee. Connect your wallet on the wallet page and the amount is sent straight to it." },
    { h: "Important note", p: "Dollar figures are estimates based on the hourly market price, not guaranteed cash returns. Token prices fluctuate." },
  ];
  return <InfoPage title={x("guide")} sections={sections} />;
}
