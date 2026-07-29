/**
 * Translations and Internationalization (i18n) dictionary for Arabic & English
 */

export type Language = "ar" | "en";

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // General & App
    appName: "ريديوس ريادة المتكامل للشبكات",
    welcome: "مرحباً بك",
    admin: "مدير النظام",
    distributor: "موزع خدمات",
    customer: "مشترك",
    save: "حفظ التغييرات",
    savedSuccess: "تم حفظ التغييرات بنجاح!",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة جديد",
    search: "بحث...",
    filter: "تصفية",
    refresh: "تحديث",
    status: "الحالة",
    actions: "الإجراءات",
    active: "نشط",
    expired: "منتهي",
    suspended: "معطل",
    online: "متصل أونلاين",
    offline: "منفصل",
    all: "الكل",
    close: "إغلاق",
    confirm: "تأكيد",

    // Navigation Menu
    navDashboard: "لوحة التحكم الرئيسية",
    navSubscribers: "إدارة المشتركين واليوزرات",
    navActiveSessions: "الجلسات النشطة أونلاين (PoD)",
    navOffers: "باقات السرعة والسرعات",
    navHotspot: "طباعة وسداد كروت الهوتسبوت",
    navMikrotik: "سيرفرات الميكروتيك وRadius",
    navUbiquiti: "أجهزة الشبكة والمحطات (Ubiquiti)",
    navDebt: "إدارة ديون وسجلات المشتركين",
    navDistributors: "الموزعين والصلاحيات",
    navDistributorPortal: "واجهة الموزع (محدودة)",
    navSupport: "تذاكر الدعم الفني المتبادلة",
    navSelfPortal: "بوابة التجديد الذاتي للمشترك",
    navSettings: "الإعدادات العامة للريديوس",

    // Settings View
    settingsTitle: "إعدادات النظام والشبكة",
    settingsSubTitle: "التحكم بإعدادات الريديوس، لغة الواجهة، المهام المجدولة، وحسابات المسؤولين",
    languageSectionTitle: "لغة النظام والواجهة (System Language)",
    languageSectionDesc: "تبديل لغة الواجهة بشكل ديناميكي بين العربية والإنجلتراية مع ضبط اتجاه الصفحة (RTL / LTR) تلقائياً.",
    arabicLang: "العربية (Arabic - RTL)",
    englishLang: "الإنجليزي (English - LTR)",
    themeSectionTitle: "المظهر والنمط (Theme Mode)",
    darkMode: "الوضع الداكن (Dark Mode)",
    lightMode: "الوضع الفاتح (Light Mode)",
    scheduledTasksTitle: "المهام والعمليات المجدولة تلقائياً (Cron Jobs)",
    adminProfileTitle: "بيانات ملف المسؤول (Admin Profile)",
    whatsappTemplatesTitle: "قوالب رسائل الواتساب التلقائية",

    // Subscriber Portal
    portalTitle: "بوابة المشتركين والخدمة الذاتية ⚡",
    portalSubtitle: "استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات، وقم بتجديد باقتك مباشرة دون انتظار الدعم الفني.",
    portalSearchLabel: "🔍 البحث برقم المشترك / اسم الدخول / رقم الهاتف:",
    currentPackage: "الباقة الحالية",
    expiryDateLabel: "تاريخ انتهاء الاشتراك",
    daysRemainingLabel: "المدة المتبقية",
    connectionTypeLabel: "نوع الاتصال",
    activeSessionsLabel: "الجلسات النشطة",
    dataConsumptionTitle: "استهلاك البيانات والرصيد (Data Usage)",
    directRenewalTitle: "تجديد الباقة المباشر (Direct Renewal) ⚡",
    selectDuration: "1. اختر مدة التجديد المطلوبة:",
    selectOffer: "2. اختر الباقة أو قم بترقيتها:",
    selectPayment: "3. اختر طريقة الدفع المفضل لديك:",
    payOnline: "مدى / Visa / Apple Pay (فوري)",
    payVoucher: "كرت شحن / كود قسيمة",
    payBalance: "خصم من رصيد الموزع",
    confirmRenewalBtn: "تأكيد تجديد الاشتراك الآن ⚡",
    renewingInProgress: "جاري تنفيذ التجديد المباشر...",
    selfMaintenanceTitle: "حلول الصيانة الذاتية",
    reconnectSession: "1. إعادة تنشيط الجلسة (PPPoE Kick)",
    runPingTest: "2. اختبار سرعة وجودة الاتصال (Ping)",
    directSupportTitle: "الدعم الفني المباشر",
    openTicketBtn: "فتح تذكرة دعم فني للمشترك",
    whatsappSupportBtn: "مراسلة الدعم الفني عبر الواتساب 💬",

    // Dashboard Stats
    totalSubscribers: "إجمالي المشتركين",
    activeSubscribersCount: "المشتركين النشطين",
    expiredSubscribersCount: "المشتركين المنتهيين",
    activeOnlineSessions: "الجلسات المباشرة أونلاين",
    totalRevenue: "إجمالي الإيرادات",
    debtorsCount: "المشتركين المدينين",
    networkServersCount: "سيرفرات الميكروتيك",
    networkDevicesCount: "أجهزة الشبكة",

    // Language Toggle Tooltip
    switchLanguage: "تغيير اللغة إلى الإنجليزية / Change Language to English",
    languageUpdated: "تم تحديث لغة النظام بنجاح"
  },
  en: {
    // General & App
    appName: "Riyada Integrated Radius System",
    welcome: "Welcome",
    admin: "System Administrator",
    distributor: "Service Distributor",
    customer: "Subscriber",
    save: "Save Changes",
    savedSuccess: "Changes saved successfully!",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add New",
    search: "Search...",
    filter: "Filter",
    refresh: "Refresh",
    status: "Status",
    actions: "Actions",
    active: "Active",
    expired: "Expired",
    suspended: "Suspended",
    online: "Online",
    offline: "Offline",
    all: "All",
    close: "Close",
    confirm: "Confirm",

    // Navigation Menu
    navDashboard: "Main Dashboard",
    navSubscribers: "Subscribers & Usernames",
    navActiveSessions: "Live Active Sessions (PoD)",
    navOffers: "Speed Offers & Plans",
    navHotspot: "Hotspot Vouchers & Printing",
    navMikrotik: "MikroTik & Radius Servers",
    navUbiquiti: "Network Devices & Access Points",
    navDebt: "Subscriber Debts & Records",
    navDistributors: "Distributors & Permissions",
    navDistributorPortal: "Distributor Portal (Limited)",
    navSupport: "Support Tickets & Helpdesk",
    navSelfPortal: "Subscriber Self-Renewal Portal",
    navSettings: "General Radius Settings",

    // Settings View
    settingsTitle: "System & Network Settings",
    settingsSubTitle: "Manage Radius configs, interface language, scheduled cron tasks, and admin profile",
    languageSectionTitle: "System Language",
    languageSectionDesc: "Switch UI language dynamically between Arabic and English with automatic layout direction (RTL / LTR) adjustment.",
    arabicLang: "Arabic (العربية - RTL)",
    englishLang: "English (الإنجليزي - LTR)",
    themeSectionTitle: "Appearance & Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    scheduledTasksTitle: "Automated Scheduled Tasks (Cron Jobs)",
    adminProfileTitle: "Admin Profile Credentials",
    whatsappTemplatesTitle: "Automated WhatsApp Message Templates",

    // Subscriber Portal
    portalTitle: "Subscriber Portal & Self-Service ⚡",
    portalSubtitle: "Check your subscription status instantly, monitor data usage, and renew your plan directly without waiting for technical support.",
    portalSearchLabel: "🔍 Search by ID / Username / Phone:",
    currentPackage: "Current Package",
    expiryDateLabel: "Subscription Expiry Date",
    daysRemainingLabel: "Days Remaining",
    connectionTypeLabel: "Connection Type",
    activeSessionsLabel: "Active Sessions",
    dataConsumptionTitle: "Data Consumption & Quota",
    directRenewalTitle: "Direct Package Renewal ⚡",
    selectDuration: "1. Select Renewal Duration:",
    selectOffer: "2. Select or Upgrade Package:",
    selectPayment: "3. Choose Preferred Payment Method:",
    payOnline: "Mada / Visa / Apple Pay (Instant)",
    payVoucher: "Voucher Code / Scratch Card",
    payBalance: "Deduct from Distributor Balance",
    confirmRenewalBtn: "Confirm Direct Renewal Now ⚡",
    renewingInProgress: "Processing Direct Renewal...",
    selfMaintenanceTitle: "Self-Service Maintenance",
    reconnectSession: "1. Reset Session (PPPoE Kick)",
    runPingTest: "2. Speed & Latency Check (Ping)",
    directSupportTitle: "Direct Technical Support",
    openTicketBtn: "Create Support Ticket",
    whatsappSupportBtn: "Contact Support via WhatsApp 💬",

    // Dashboard Stats
    totalSubscribers: "Total Subscribers",
    activeSubscribersCount: "Active Subscribers",
    expiredSubscribersCount: "Expired Subscribers",
    activeOnlineSessions: "Live Online Sessions",
    totalRevenue: "Total Revenue",
    debtorsCount: "Debtors Count",
    networkServersCount: "MikroTik Servers",
    networkDevicesCount: "Network Devices",

    // Language Toggle Tooltip
    switchLanguage: "تغيير اللغة إلى العربية / Change Language to Arabic",
    languageUpdated: "System language updated successfully"
  }
};

export function getTranslation(key: string, lang: Language = "ar"): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations.ar[key]) {
    return translations.ar[key];
  }
  return key;
}
