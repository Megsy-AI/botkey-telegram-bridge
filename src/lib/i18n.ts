const keys = [
  "home", "tasks", "power", "wallet", "swap",
  "level", "balance", "startMining", "mining", "claim", "remaining",
  "tasksTab", "referralsTab", "start", "done", "inviteFriends", "inviteText", "copyLink", "copied", "friends",
  "miningPower", "perDay", "current", "unlock", "buyOnSton", "verifyHoldings", "needWallet", "insufficient",
  "connectWallet", "deposit", "withdraw", "amount", "send", "address", "pending", "price", "minWithdraw",
  "subscription", "subscribe", "subscribed", "openInTelegram", "demo",
] as const;
export type TKey = (typeof keys)[number];
type Dict = Record<TKey, string>;

const en: Dict = {
  home: "Home", tasks: "Tasks", power: "Power", wallet: "Wallet", swap: "Swap",
  level: "Level", balance: "Balance", startMining: "Start mining", mining: "Mining", claim: "Claim", remaining: "remaining",
  tasksTab: "Tasks", referralsTab: "Referrals", start: "Start", done: "Done", inviteFriends: "Invite friends",
  inviteText: "Earn a bonus for every friend who joins", copyLink: "Copy link", copied: "Copied", friends: "Friends",
  miningPower: "Mining power", perDay: "per day", current: "Current", unlock: "Unlock", buyOnSton: "Buy ORAI on STON.fi",
  verifyHoldings: "Verify my holdings", needWallet: "Connect your wallet first", insufficient: "Not enough ORAI",
  connectWallet: "Connect wallet", deposit: "Deposit", withdraw: "Withdraw", amount: "Amount", send: "Send",
  address: "Address", pending: "Pending", price: "Price", minWithdraw: "Minimum withdrawal",
  subscription: "Monthly Pro", subscribe: "Subscribe", subscribed: "Active until",
  openInTelegram: "Open this app inside Telegram to save progress", demo: "Preview mode",
};
const ar: Dict = {
  home: "الرئيسية", tasks: "المهام", power: "القوة", wallet: "المحفظة", swap: "تبديل",
  level: "المستوى", balance: "الرصيد", startMining: "بدء التعدين", mining: "جاري التعدين", claim: "استلام", remaining: "متبقي",
  tasksTab: "المهام", referralsTab: "الإحالة", start: "ابدأ", done: "تم", inviteFriends: "ادعُ أصدقاءك",
  inviteText: "احصل على مكافأة عن كل صديق ينضم", copyLink: "نسخ الرابط", copied: "تم النسخ", friends: "الأصدقاء",
  miningPower: "قوة التعدين", perDay: "في اليوم", current: "الحالي", unlock: "فتح", buyOnSton: "اشترِ ORAI من STON.fi",
  verifyHoldings: "تحقق من رصيدي", needWallet: "اربط محفظتك أولاً", insufficient: "رصيد ORAI غير كافٍ",
  connectWallet: "ربط المحفظة", deposit: "إيداع", withdraw: "سحب", amount: "المبلغ", send: "إرسال",
  address: "العنوان", pending: "قيد المعالجة", price: "السعر", minWithdraw: "الحد الأدنى للسحب",
  subscription: "الاشتراك الشهري", subscribe: "اشترك", subscribed: "فعال حتى",
  openInTelegram: "افتح التطبيق داخل تليجرام لحفظ تقدمك", demo: "وضع المعاينة",
};
const ru: Dict = {
  home: "Главная", tasks: "Задания", power: "Мощность", wallet: "Кошелёк", swap: "Обмен",
  level: "Уровень", balance: "Баланс", startMining: "Начать майнинг", mining: "Майнинг", claim: "Забрать", remaining: "осталось",
  tasksTab: "Задания", referralsTab: "Рефералы", start: "Начать", done: "Готово", inviteFriends: "Пригласить друзей",
  inviteText: "Бонус за каждого приглашённого друга", copyLink: "Копировать", copied: "Скопировано", friends: "Друзья",
  miningPower: "Мощность майнинга", perDay: "в день", current: "Текущий", unlock: "Открыть", buyOnSton: "Купить ORAI на STON.fi",
  verifyHoldings: "Проверить баланс", needWallet: "Сначала подключите кошелёк", insufficient: "Недостаточно ORAI",
  connectWallet: "Подключить кошелёк", deposit: "Пополнить", withdraw: "Вывести", amount: "Сумма", send: "Отправить",
  address: "Адрес", pending: "В обработке", price: "Цена", minWithdraw: "Минимальный вывод",
  subscription: "Подписка Pro", subscribe: "Подписаться", subscribed: "Активна до",
  openInTelegram: "Откройте приложение в Telegram", demo: "Демо",
};
const es: Dict = {
  home: "Inicio", tasks: "Tareas", power: "Poder", wallet: "Billetera", swap: "Cambiar",
  level: "Nivel", balance: "Saldo", startMining: "Empezar a minar", mining: "Minando", claim: "Reclamar", remaining: "restante",
  tasksTab: "Tareas", referralsTab: "Referidos", start: "Empezar", done: "Hecho", inviteFriends: "Invitar amigos",
  inviteText: "Gana un bono por cada amigo", copyLink: "Copiar enlace", copied: "Copiado", friends: "Amigos",
  miningPower: "Poder de minería", perDay: "por día", current: "Actual", unlock: "Desbloquear", buyOnSton: "Comprar ORAI en STON.fi",
  verifyHoldings: "Verificar mis fondos", needWallet: "Conecta tu billetera", insufficient: "ORAI insuficiente",
  connectWallet: "Conectar billetera", deposit: "Depositar", withdraw: "Retirar", amount: "Cantidad", send: "Enviar",
  address: "Dirección", pending: "Pendiente", price: "Precio", minWithdraw: "Retiro mínimo",
  subscription: "Pro mensual", subscribe: "Suscribirse", subscribed: "Activo hasta",
  openInTelegram: "Abre la app en Telegram", demo: "Vista previa",
};
const fr: Dict = { ...en,
  home: "Accueil", tasks: "Tâches", power: "Puissance", wallet: "Portefeuille", swap: "Échange",
  level: "Niveau", balance: "Solde", startMining: "Commencer le minage", mining: "Minage", claim: "Récupérer", remaining: "restant",
  tasksTab: "Tâches", referralsTab: "Parrainage", start: "Démarrer", done: "Fait", inviteFriends: "Inviter des amis",
  copyLink: "Copier le lien", copied: "Copié", friends: "Amis", miningPower: "Puissance de minage", perDay: "par jour",
  connectWallet: "Connecter le portefeuille", deposit: "Dépôt", withdraw: "Retrait", amount: "Montant", send: "Envoyer",
  subscribe: "S'abonner", openInTelegram: "Ouvrez l'app dans Telegram",
};
const tr: Dict = { ...en,
  home: "Ana sayfa", tasks: "Görevler", power: "Güç", wallet: "Cüzdan", swap: "Takas",
  level: "Seviye", balance: "Bakiye", startMining: "Madenciliğe başla", mining: "Madencilik", claim: "Topla", remaining: "kaldı",
  tasksTab: "Görevler", referralsTab: "Davetler", start: "Başla", done: "Tamam", inviteFriends: "Arkadaş davet et",
  copyLink: "Bağlantıyı kopyala", copied: "Kopyalandı", friends: "Arkadaşlar", miningPower: "Madencilik gücü", perDay: "günlük",
  connectWallet: "Cüzdan bağla", deposit: "Yatır", withdraw: "Çek", amount: "Miktar", send: "Gönder",
  subscribe: "Abone ol", openInTelegram: "Uygulamayı Telegram'da aç",
};
const fa: Dict = { ...ar,
  home: "خانه", tasks: "وظایف", power: "قدرت", wallet: "کیف پول", swap: "تبادل",
  level: "سطح", balance: "موجودی", startMining: "شروع استخراج", mining: "در حال استخراج", claim: "دریافت",
  connectWallet: "اتصال کیف پول", deposit: "واریز", withdraw: "برداشت", inviteFriends: "دعوت دوستان",
};
const id: Dict = { ...en,
  home: "Beranda", tasks: "Tugas", power: "Daya", wallet: "Dompet", swap: "Tukar",
  balance: "Saldo", startMining: "Mulai menambang", mining: "Menambang", claim: "Klaim",
  connectWallet: "Hubungkan dompet", deposit: "Setor", withdraw: "Tarik", inviteFriends: "Undang teman",
};
const pt: Dict = { ...es,
  home: "Início", tasks: "Tarefas", wallet: "Carteira", balance: "Saldo", startMining: "Começar a minerar",
  mining: "Minerando", claim: "Resgatar", connectWallet: "Conectar carteira", withdraw: "Sacar", inviteFriends: "Convidar amigos",
};
const de: Dict = { ...en,
  home: "Start", tasks: "Aufgaben", power: "Leistung", wallet: "Wallet", swap: "Tauschen",
  balance: "Guthaben", startMining: "Mining starten", mining: "Mining läuft", claim: "Abholen",
  connectWallet: "Wallet verbinden", deposit: "Einzahlen", withdraw: "Auszahlen", inviteFriends: "Freunde einladen",
};
const zh: Dict = { ...en,
  home: "首页", tasks: "任务", power: "算力", wallet: "钱包", swap: "兑换",
  level: "等级", balance: "余额", startMining: "开始挖矿", mining: "挖矿中", claim: "领取",
  connectWallet: "连接钱包", deposit: "充值", withdraw: "提现", inviteFriends: "邀请好友",
};
const hi: Dict = { ...en,
  home: "होम", tasks: "कार्य", power: "पावर", wallet: "वॉलेट", swap: "स्वैप",
  balance: "बैलेंस", startMining: "माइनिंग शुरू करें", mining: "माइनिंग जारी", claim: "क्लेम",
  connectWallet: "वॉलेट जोड़ें", deposit: "जमा", withdraw: "निकासी", inviteFriends: "दोस्तों को बुलाएं",
};
const uk: Dict = { ...ru,
  home: "Головна", tasks: "Завдання", wallet: "Гаманець", startMining: "Почати майнінг",
  connectWallet: "Підключити гаманець", withdraw: "Вивести", inviteFriends: "Запросити друзів",
};

export const dictionaries: Record<string, Dict> = { en, ar, ru, es, fr, tr, fa, id, pt, de, zh, hi, uk };
export const RTL = new Set(["ar", "fa", "he", "ur"]);

export function pickLang(code?: string | null) {
  const c = (code || "en").toLowerCase().split("-")[0];
  return dictionaries[c] ? c : "en";
}
export function translator(lang: string) {
  const d = dictionaries[lang] ?? en;
  return (k: TKey) => d[k] ?? en[k];
}
