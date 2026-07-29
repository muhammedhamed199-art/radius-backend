import { ShieldCheck, Server, Key, Radio, Terminal, LayoutList } from "lucide-react";
import { DistributorPermissions } from "../types";

export const PERMISSION_GROUPS = [
  {
    id: "general",
    title: "1. الصلاحيات العامة وإدارة النظام والشبكة",
    description: "إدارة المشتركين، السيرفرات، كروت الهوتسبوت، الذمم، والخدمات المساندة.",
    icon: ShieldCheck,
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    headerBg: "bg-indigo-50/70 border-indigo-100",
    permissions: [
      { key: "canManageNasServers", label: "إضافة وإدارة سيرفرات ميكروتيك NAS", desc: "إضافة سيرفرات ميكروتك، ربط VPN ومتابعة الحالة اللحظية" },
      { key: "canManageSubscribers", label: "إضافة وتجديد وطرد المشتركين", desc: "إنشاء حسابات جديدة، تجديد الاشتراكات، وفصل الخدمة" },
      { key: "canManageOffers", label: "إنشاء وتعديل باقات السرعة", desc: "إنشاء وتحديد أسعار باقات السرعة المخصصة لعملائه (تتطلب تفعيل صفحة باقات السرعة أولاً)" },
      { key: "canManageCards", label: "توليد وطباعة كروت الهوتسبوت", desc: "إنشاء وتوليد كروت المسبقة الدفع وتصديرها للطباعة" },
      { key: "canManageDevices", label: "إدارة الأجهزة", desc: "عرض وفحص أجهزة الجسر والقطاع والشبكة" },
      { key: "canManageDebt", label: "تسديد وإدارة ديون المشتركين", desc: "تحصيل المبالغ وسداد مستحقات المشتركين والذمم" },
      { key: "canViewStats", label: "الرسوم البيانية والتحليلات", desc: "اطلاع على تقارير الأرباح والمبيعات واستهلاك البيانات" },
      { key: "canViewAuditLogs", label: "سجل العمليات واللوج (Audit Logs)", desc: "عرض سجل جميع الأنشطة والتغييرات التي نفذها" },
      { key: "canUsePingTool", label: "استخدام أداة فحص البينج والاتصال", desc: "تشخيص الأعطال واختبار زمن استجابة السيرفرات" },
      { key: "canViewSupport", label: "تذاكر الدعم الفني والشواغل", desc: "فتح ومتابعة تذاكر المساعدة مع الإدارة الرئيسية" },
      { key: "canManageRadiusSettings", label: "إدارة إعدادات خادم الريديوس العامة", desc: "تعديل إعدادات اسم الخادم وـ VPN والمنافذ" },
      { key: "canManageTechnicalAdmins", label: "تعيين وإدارة المدراء التقنيين", desc: "صلاحية ترقية وإضافة موظفين برتبة مدير تقني" },
      { key: "canManageCentralMikrotikScript", label: "واجهة التحكم بقالب كود التركيب المركزي للميكروتيك (Unified RouterOS Template)", desc: "إظهار أو إخفاء واجهة التحكم والتعديل على قالب كود التركيب الموحد لسيرفرات ميكروتيك" },
      { key: "canResetRadiusData", label: "تصفير بيانات الريديوس", desc: "تفريغ وحذف كامل قاعدة بيانات الريديوس والمشتركين" },
      { key: "canExportRadiusData", label: "تصدير نسخة احتياطية", desc: "أخذ نسخة احتياطية من بيانات النظام كملف JSON" },
      { key: "canManageRadiusScheduledTasks", label: "إدارة المهام المجدولة", desc: "تفعيل وتعطيل ومتابعة المهام التلقائية للنظام" },
      { key: "canManageRadiusCurrencies", label: "إدارة عملات النظام", desc: "إضافة وتعديل وحذف العملات وأسعار الصرف" },
      { key: "canToggleReadOnlyMode", label: "قفل التعديل للموزعين الفرعيين", desc: "تفعيل وضع المشاهدة فقط للموزعين الفرعيين ومنعهم من التعديل" }
    ]
  },
  {
    id: "radius_core",
    title: "2. صلاحيات إدارة جلسات ومستخدمي خادم الريديوس (RADIUS Core)",
    description: "التحكم ببروتوكولات التفويض والمصادقة وجلسات FreeRADIUS الحية.",
    icon: Radio,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    headerBg: "bg-emerald-50/70 border-emerald-100",
    permissions: [
      { key: "canRadiusDisconnectSession", label: "قطع وطرد الجلسة النشطة (CoA Kick)", desc: "إرسال أمر طرد وفصل الجلسة الحالية للمشترك فوراً" },
      { key: "canRadiusChangeSubnetIp", label: "تعيين وتغيير Framed-IP-Address", desc: "ربط وتخصيص عنوان IP ثوابت للمشتركين في شجرة الريديوس" },
      { key: "canRadiusReauthorizeUser", label: "إجبار إعادة المصادقة (Re-authorization)", desc: "إعادة تفويض الجلسة الحالية ومطابقة قواعد السرعة" },
      { key: "canRadiusBindMacAddress", label: "تقييد الماك أدرس (Calling-Station-Id)", desc: "ربط الحساب بـ MAC أدرس محدد وحظر الدخول من أجهزة غريبة" },
      { key: "canRadiusOverrideBandwidthCoA", label: "تعديل وخنق السرعة اللحظية عبر CoA", desc: "حقن قواعد تحديد السرعة الديناميكية على السيرفر" },
      { key: "canRadiusViewLiveSessions", label: "رصد وتتبع الجلسات وسجلات Accounting", desc: "مراقبة الاتصالات الحية وسجلات الدخول والخروج والأنشطة" },
      { key: "canRadiusResetUserOctets", label: "تصفير عداد الاستهلاك ورصيد الجيجات", desc: "إعادة تعيين قيم Acct-Input-Octets / Output-Octets" },
      { key: "canRadiusManageFramedRoutes", label: "إدارة التوجيه الثابت Framed-Route", desc: "إضافة مسارات شبكة خاصة وتحديد مجالات العناوين IP Pools" }
    ]
  },
  {
    id: "radius_commands",
    title: "3. أوامر وإجراءات خادم الريديوس المباشرة (RADIUS Direct Commands)",
    description: "منح صلاحيات تنفيذ أوامر تشغيلية متقدمة مباشرة على خادم FreeRADIUS وسيرفرات NAS.",
    icon: Terminal,
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    headerBg: "bg-purple-50/70 border-purple-100",
    permissions: [
      { key: "canCmdSendCoA", label: "أمر إرسال CoA-Request المباشر", desc: "إرسال طلبات Change of Authorization مباشرة إلى بورت 3799" },
      { key: "canCmdSendDisconnectRequest", label: "أمر Disconnect-Request / PoD", desc: "إرسال طلبات Packet of Disconnect لطرد المشتركين على السيرفر" },
      { key: "canCmdRadtestAuth", label: "أداة فحص المصادقة (radtest verification)", desc: "اختبار صحة كلمة السر واستجابة خادم الريديوس برمجياً" },
      { key: "canCmdInjectAttributes", label: "حقن سمات وحقول الريديوس المخصصة", desc: "تمرير RADIUS Reply / Check Attributes وسرعات الميكروتك" },
      { key: "canCmdManageVSA", label: "إدارة سمات المصنعين (Vendor-Specific VSA)", desc: "تكوين سمات Mikrotik, Cisco, Huawei الخاصة في خادم الريديوس" },
      { key: "canCmdSyncNasSecrets", label: "مزامنة وتجديد المفاتيح السرية (Sync Secrets)", desc: "إعادة القراءة والمزامنة التلقائية للكلمات السرية لسيرفرات NAS" },
      { key: "canCmdFlushRadiusCache", label: "تفريغ الذاكرة المؤقتة (Flush RADIUS Cache)", desc: "مسح الكاش وإجبار خادم الريديوس على إعادة جلب الحسابات" },
      { key: "canCmdRestartRadiusService", label: "إعادة تشغيل خدمة FreeRADIUS", desc: "تنفيذ أمر `systemctl restart freeradius` في الحالات الطارئة" },
      { key: "canCmdClearArpTable", label: "سحب وتنظيف جدول ARP", desc: "تصفير كاش ARP ورصد الأجهزة المزدوجة بالشبكة" },
      { key: "canCmdPushBillingPolicy", label: "دفق وتحديث سياسة الفوترة الجماعية", desc: "إرسال تحديثات الفوترة وقواعد الحجب التلقائي على الخادم" }
    ]
  },
  {
    id: "sidebar_access",
    title: "4. صلاحيات الوصول والصفحات الجانبية (Sidebar & Access Permissions)",
    description: "تحديد الصفحات والأقسام الجانبية التي يمكن للموزع الوصول إليها ورؤيتها.",
    icon: LayoutList,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    headerBg: "bg-blue-50/70 border-blue-100",
    permissions: [
      { key: "canViewDashboard", label: "صفحة لوحة التحكم (الرئيسية)", desc: "عرض الصفحة الرئيسية التي تحتوي على ملخص سريع للنظام" },
      { key: "canViewOffersPage", label: "صفحة باقات السرعة", desc: "عرض وإدارة قسم باقات وخطط السرعة" },
      { key: "canManageDistributors", label: "صفحة إدارة الموزعين", desc: "القدرة على عرض وإدارة الموزعين الآخرين وصلاحياتهم" },
      { key: "canReviewReceipts", label: "صفحة مراجعة الإيصالات", desc: "عرض قسم مراجعة إيصالات عمليات الدفع والشحن" },
      { key: "canManageServerSubscriptions", label: "صفحة تجديد اشتراك السيرفر", desc: "عرض وإدارة قسم دفع وتجديد اشتراكات السيرفرات" },
      { key: "canViewSelfPortal", label: "بوابة الخدمة الذاتية للموزع", desc: "عرض لوحة الخدمة الذاتية الخاصة بالموزع" },
      { key: "canViewSettings", label: "صفحة الإعدادات العامة للنظام", desc: "الدخول إلى قسم الإعدادات العامة وضبط خيارات النظام الأساسية" }
    ]
  }
];

export const getFullPermissionsObject = (): DistributorPermissions => {
  const full: DistributorPermissions = {};
  PERMISSION_GROUPS.forEach(group => {
    group.permissions.forEach(p => {
      (full as any)[p.key] = true;
    });
  });
  return full;
};

export const getDefaultDistributorPermissions = (): DistributorPermissions => {
  return {
    canManageNasServers: true,
    canManageSubscribers: true,
    canManageOffers: true,
    canManageCards: true,
    canManageDevices: true,
    canViewStats: true,
    canViewAuditLogs: true,
    canUsePingTool: true,
    canViewSupport: true,
    canManageDebt: true,
    canManageCentralMikrotikScript: false,
    canResetRadiusData: false,
    canExportRadiusData: true,
    canManageRadiusScheduledTasks: false,
    canManageRadiusCurrencies: false,
    canToggleReadOnlyMode: false,
    canRadiusDisconnectSession: true,
    canRadiusChangeSubnetIp: true,
    canRadiusReauthorizeUser: true,
    canRadiusBindMacAddress: true,
    canRadiusOverrideBandwidthCoA: true,
    canRadiusViewLiveSessions: true,
    canCmdSendCoA: true,
    canCmdSendDisconnectRequest: true,
    canCmdRadtestAuth: true,
    canViewDashboard: true,
    canViewOffersPage: true,
    canManageDistributors: false,
    canReviewReceipts: false,
    canManageServerSubscriptions: true,
    canViewSelfPortal: true,
    canViewSettings: false
  };
};

export const getEnabledCount = (permissions?: DistributorPermissions): number => {
  if (!permissions) return 0;
  return Object.values(permissions).filter(Boolean).length;
};

export const getTotalPermissionsCount = (allowedPermissions?: DistributorPermissions): number => {
  if (allowedPermissions) {
    let count = 0;
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(p => {
        if (allowedPermissions[p.key as keyof DistributorPermissions]) {
          count++;
        }
      });
    });
    return count;
  }
  return PERMISSION_GROUPS.reduce((acc, g) => acc + g.permissions.length, 0);
};
