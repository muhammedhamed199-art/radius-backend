/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COUNTRIES = [
  "مصر", "ليبيا", "السعودية", "العراق", "سوريا", "اليمن", "الجزائر", 
  "المغرب", "السودان", "الأردن", "فلسطين", "الإمارات", "الكويت", 
  "قطر", "البحرين", "عمان", "تونس", "لبنان"
];

export enum CustomerStatus {
  ACTIVE = "نشط",
  SUSPENDED = "موقف",
  EXPIRED = "منتهي الاشتراك"
}

export enum ConnectionType {
  PPPOE = "برودباند PPPoE",
  HOTSPOT = "هوت سبوت",
  MIXED = "متعدد",
  MAC = "ماك ادريس"
}

export enum UserRole {
  ADMIN = "مدير",
  TECHNICAL_ADMIN = "مدير تقني",
  DISTRIBUTOR = "موزع"
}

export interface Currency {
  code: string; // e.g. "USD", "LYD", "SYP", "EGP", "EUR", "SAR", "IQD", "TRY"
  name: string; // e.g. "دولار أمريكي", "دينار ليبي", "ليرة سورية"
  symbol: string; // e.g. "$", "د.ل", "ل.س"
  exchangeRate: number; // Rate relative to base currency (e.g. 1 USD = 4.85 LYD)
  isBase?: boolean; // Is this the primary base currency (rate = 1.0)
}

export interface SpeedOffer {
  id: string;
  name: string; // e.g. "10 ميجا", "20 ميجا"
  speed: string; // e.g. "10 Mbps"
  downloadSpeed?: string; // Download limit
  uploadSpeed?: string; // Upload limit
  price: number; // in local currency (e.g., SYP / LYD / EGP / USD)
  currency?: string; // Assigned currency code, e.g. "LYD", "USD"
  country?: string; // e.g. "مصر", "ليبيا"
  isFree?: boolean; // Is the subscription free
  durationDays: number;
  isUnlimitedDuration?: boolean; // Is the duration unlimited / infinite
  limitGB: number; // quota
  isUnlimitedQuota?: boolean; // Is the download quota unlimited
  startTrigger?: "now" | "first_login" | "custom_duration"; // activation policy
  startTriggerDaysOffset?: number; // offset days if custom_duration (negative for past)
  distributorId?: string; // Associated distributor ID for isolation
}

export interface ArchivedReceipt {
  id: string;
  date: string;
  message: string;
  amount: number;
  status: "matched" | "unmatched" | "pending";
  offerId: string;
  systemMatched?: boolean;
  imageUrl?: string;
  rejectReason?: string;
  processedDate?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string; // Cash, Voucher, Credit, Online
  description: string;
  invoiceNumber: string;
  processedBy?: string;
}

export interface ModificationRecord {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  downloadMB: number;
  uploadMB: number;
  sessionHours: number;
  ipAssigned?: string;
  nasServer?: string;
}

export type CustomerCategory = "ذهبي" | "فضي" | "برونزي" | "تجريبي" | "عادي";

export interface Customer {
  transactions?: TransactionRecord[];
  id: string;
  name: string;
  username: string;
  password?: string;
  portalUsername?: string;
  portalPassword?: string;
  status: CustomerStatus;
  connectionType: ConnectionType;
  ipAddress: string;
  concurrentLogins: number;
  maxConcurrentLogins?: number;
  offerId: string; // SpeedOffer id
  consumptionGB: number;
  expiryDate: string; // YYYY-MM-DD
  phone?: string;
  region?: string;
  country?: string; // e.g. "مصر", "ليبيا"
  debt?: number; // amount of debt (if any)
  balance?: number; // remaining balance
  distributorId?: string; // id of the distributor who registered them
  macAddress?: string; // MAC address
  paymentLink?: string; // Electronic payment link
  macBindingType?: "manual" | "auto" | "disabled"; // MAC Binding Type
  authByMac?: boolean; // Auth by MAC Address
  startDate?: string; // Start date (YYYY-MM-DD or "عند أول اتصال")
  startDateMode?: "now" | "first_connect" | "custom"; // Start date mode
  ipAssignmentType?: "auto" | "manual"; // IP assignment type (auto or manual)
  serverId?: string; // Associated NasServer id
  realm?: string; // RADIUSDesk Realm (نطاق الريديوس e.g. @realm1, realm1.net, default)
  autoWhatsAppAlert?: boolean; // Send auto alert before expiry
  autoWhatsAppAlertLogs?: { date: string; status: "sent" | "pending" | "failed"; message: string }[];
  autoRenew?: boolean; // Automatic subscription renewal
  autoRenewDate?: string; // Auto-renewal due date
  archivedReceipts?: ArchivedReceipt[];
  payments?: PaymentRecord[];
  modifications?: ModificationRecord[];
  category?: CustomerCategory; // Customer category rating
  temporaryOfferId?: string;
  temporaryOfferExpiry?: string;
  usageLogs?: UsageRecord[];
}

export interface DeletedCustomer extends Customer {
  deletedAt: string; // ISO date string when deleted
  deletedBy?: string; // Username who deleted it
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: string; // e.g. "LiteBeam 5AC Gen2", "PowerBeam M5", "UniFi AP"
  connectionType: string; // e.g. "Bridge", "Router"
  ipAddress: string;
  vpnIpAddress?: string; // VPN IP address for remote access
  macAddress: string;
  connectedServer: string; // NAS server or interface
  status: "متصل" | "منفصل";
  lastSeen?: string;
  lastPingTime?: string;
  lastPingLatencyMs?: number;
  signalDbm?: number; // e.g. -54, -78 (dBm)
  noiseFloorDbm?: number; // e.g. -96 (dBm)
  ccqPercent?: number; // e.g. 98.5, 62.0 (%)
  txRxRateMbps?: string; // e.g. "300 / 300 Mbps"
  frequencyMhz?: number; // e.g. 5800 MHz
  distanceKm?: number; // e.g. 2.4 km
  channelWidthMhz?: number; // e.g. 40 MHz
  distributorId?: string; // Associated distributor ID for isolation
}

export interface PermissionProfile {
  id: string;
  name: string;
  description?: string;
  permissions: DistributorPermissions;
}

export interface DistributorPermissions {
  // --- General System Permissions (الصلاحيات العامة للنظام) ---
  canManageNasServers?: boolean; // إضافة وتعديل وحذف سيرفرات ميكروتيك NAS
  canManageSubscribers?: boolean; // إضافة وتجديد وتعديل وطرد المشتركين
  canManageOffers?: boolean; // عرض وإنشاء باقات السرعة
  canManageCards?: boolean; // توليد وطباعة كروت الهوت سبوت
  canManageDevices?: boolean; // إدارة الأجهزة
  canViewStats?: boolean; // عرض الإحصائيات والرسوم البيانية
  canViewAuditLogs?: boolean; // عرض سجل العمليات الخاصة به
  canUsePingTool?: boolean; // استخدام أداة فحص البينج
  canViewSupport?: boolean; // الدعم الفني والتذاكر
  canManageDebt?: boolean; // تسديد وتسجيل الذمم والديون
  canManageRadiusSettings?: boolean; // تعديل وإدارة إعدادات سيرفر الريديوس
  canManageTechnicalAdmins?: boolean; // تعيين وإدارة المدراء التقنيين
  canManageCentralMikrotikScript?: boolean;

  canResetRadiusData?: boolean; // تصفير بيانات الريديوس بالكامل
  canExportRadiusData?: boolean; // تصدير بيانات النظام كنسخة احتياطية
  canManageRadiusScheduledTasks?: boolean; // إدارة مهام الجدولة
  canManageRadiusCurrencies?: boolean; // إدارة العملات
  canToggleReadOnlyMode?: boolean; // قفل التعديل للموزعين الفرعيين (رؤية فقط)
  
  // --- Sidebar Pages Access (صلاحيات الوصول والصفحات الجانبية) ---
  canViewDashboard?: boolean; // صفحة الرئيسية (Dashboard)
  canViewOffersPage?: boolean; // صفحة باقات السرعة
  canManageDistributors?: boolean; // صفحة قائمة الموزعين
  canReviewReceipts?: boolean; // صفحة مراجعة الإيصالات
  canManageServerSubscriptions?: boolean; // صفحة تجديد اشتراك السيرفر
  canViewSelfPortal?: boolean; // بوابة الخدمة الذاتية
  canViewSettings?: boolean; // صفحة الإعدادات العامة
 // واجهة التحكم بقالب كود التركيب المركزي للميكروتيك

  // --- RADIUS Core & Session Permissions (صلاحيات خادم وإدارة جلسات الريديوس) ---
  canRadiusDisconnectSession?: boolean; // قطع وطرد الجلسة النشطة (CoA / Disconnect Session)
  canRadiusChangeSubnetIp?: boolean; // تعيين وتغيير IP/Subnet الثابت (Framed-IP-Address)
  canRadiusReauthorizeUser?: boolean; // إجبار إعادة المصادقة للتفويض (Re-authorization)
  canRadiusBindMacAddress?: boolean; // تقييد الماك أدرس وحظر الجلسة (Calling-Station-Id / MAC Binding)
  canRadiusOverrideBandwidthCoA?: boolean; // تعديل وخنق السرعة اللحظية عبر أوامر CoA
  canRadiusViewLiveSessions?: boolean; // عرض الجلسات اللحظية وسجلات الـ Accounting
  canRadiusResetUserOctets?: boolean; // تصفير عداد الاستهلاك ورصيد الجيجات (Reset Acct Octets)
  canRadiusManageFramedRoutes?: boolean; // توجيه الثابت والـ Framed-Route / IP Pools

  // --- RADIUS Direct Commands & Action Privileges (أوامر وإجراءات خادم الريديوس المباشرة) ---
  canCmdSendCoA?: boolean; // إرسال أمر Change of Authorization (CoA-Request)
  canCmdSendDisconnectRequest?: boolean; // إرسال أمر Disconnect-Request المباشر (PoD)
  canCmdRadtestAuth?: boolean; // أداة radtest لاختبار المصادقة بالسيرفر
  canCmdInjectAttributes?: boolean; // حقن وتمرير سمات الريديوس المخصصة (Custom RADIUS Attributes)
  canCmdManageVSA?: boolean; // التحكم بالسمات الخاصة بالمصنعين (Vendor-Specific Attributes VSA)
  canCmdSyncNasSecrets?: boolean; // مزامنة وتحديث المفاتيح السرية بين RADIUS والـ NAS
  canCmdFlushRadiusCache?: boolean; // تفريغ الذاكرة المؤقتة للريديوس وإعادة جلب الحسابات
  canCmdRestartRadiusService?: boolean; // أمر إعادة تشغيل خدمة خادم FreeRADIUS المباشر
  canCmdClearArpTable?: boolean; // تنظيف وسحب جدول ARP بالسيرفرات
  canCmdPushBillingPolicy?: boolean; // دفق وتحديث سياسة الفوترة الجماعية على خادم الريديوس
}


export interface NasInterface {
  name: string;
  type: "ether" | "wlan" | "vlan" | "pppoe" | "unknown";
  rxSpeed: number; // in Mbps
  txSpeed: number; // in Mbps
  status?: "up" | "down";
}

export interface NasServer {
  id: string;
  name: string;
  ipAddress: string;
  vpnIp: string;
  vpnStatus: "متصل" | "منفصل";
  realm?: string; // RADIUSDesk Realm (نطاق الريديوس e.g. @realm1, realm1.net, default)
  realms?: string[]; // Associated Realms list for multi-realm routing
  type?: string; // NAS type e.g. mikrotik, coova, chillispot, cisco, other
  port?: number;
  apiUsername?: string;
  apiPassword?: string;
  location: string;
  distributorId?: string;
  createdAt?: string;
  lastPing?: string;
  activeUsers?: number;
  connectedSince?: string;
  secret?: string;
  autoReconnect?: boolean;
  radiusActiveUsers?: number;
  mikrotikActiveUsers?: number;
  enableSnmpMonitoring?: boolean;
  snmpCommunity?: string;
  cpuUsagePercent?: number;


  ramUsagePercent?: number;
  autoActivateOnStart?: boolean;
  enableNotifications?: boolean;
  ramTotalMb?: number;
  ramFreeMb?: number;

  customScript?: string;

  status?: "up" | "down";
  interfaces?: NasInterface[];
}

export interface HotspotCard {
  id: string;
  code: string;
  price: number;
  currency?: string;
  isUsed: boolean;
  status: "متاح" | "مستخدم" | "غير مستخدم";

  usedBy?: string; // username of customer
  usedDate?: string;
  consumptionGB: number;
  limitGB: number;
  durationDays: number;
  distributorId?: string; // Associated distributor ID for isolation
  offerId?: string;

}

export interface Distributor {
  transactions?: TransactionRecord[];
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionStatus?: "نشط" | "منتهي" | "موقوف";
  expiryDate?: string;
  logo?: string;
  subscriptionOfferId?: string;
  autoRenewSubscription?: boolean;
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
  portalUsername?: string;
  portalPassword?: string; // Account password for distributor login
  phone: string;
  country?: string; // e.g. "مصر", "ليبيا"
  region?: string;
  balance: number; // Credit available to create accounts/cards
  debt?: number; // Outstanding debt to Admin
  archivedReceipts?: ArchivedReceipt[]; // Receipts sent by Distributor to Admin
  currency?: string; // Assigned default currency code, e.g. "LYD", "USD"
  customersCount: number;
  salesCount: number;
  permissions?: DistributorPermissions; // Custom granular permissions configured by Admin
  permissionProfileId?: string; // Assigned permission profile ID for automatic profile synchronization
  parentDistributorId?: string; // If this is a sub-distributor created by another distributor
  paymentGatewayProvider?: string; // "stripe", "paypal", etc for this distributor
  paymentGatewayApiKey?: string; // API key for the distributor's own payment gateway
  strictIsolation?: boolean;
  isReadOnly?: boolean; // وضع المشاهدة فقط (يمنع التعديل)
  isLocked?: boolean; // قفل الموزع لمنع التعديلات العشوائية على الاشتراكات وحدود الرصيد
  isArchived?: boolean;
  status?: "نشط" | "منتهي" | "موقوف" | "أرشيف" | string;
  maxNasServers?: number;

  archivedAt?: string;
}

export interface SupportTicket {
  id: string;
  senderName: string;
  senderRole: UserRole;
  title: string;
  message: string;
  date: string;
  distributorId?: string; // Associated distributor ID for isolation
  replies: Array<{
    id: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    date: string;
  }>;
  status: "مفتوح" | "تم الرد" | "مغلق";
}

export interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: string; // who made the change
  target: string; // what was changed
  action: string; // action details
  distributorId?: string; // Associated distributor ID for isolation
}

export interface GeneralSettings {
  strictIsolation?: boolean;
  showAccountSwitcher?: boolean;
  permissionProfiles?: PermissionProfile[];
  radiusName: string;
  radiusIp: string;
  ownerName: string;
  ownerPhone: string;
  vpnServerIp: string;
  defaultWhatsAppDelayMessage: string;
  defaultWhatsAppAlertMessage: string;
  language?: "ar" | "en";
  currencies?: Currency[];
  defaultCurrency?: string;
  loginTagline?: string;
  loginDescription?: string;
  loginFooterNote?: string;
  loginSupportPhone?: string;
  showSubscriberPortalBtn?: boolean;
  maintenanceModeEnabled?: boolean;
  maintenanceModeMessage?: string;
  autoDeleteOldLogs?: boolean;
  enableDailyReports?: boolean;
  lastDailyReportDate?: string;
  autoDeleteLogsMonths?: number;
  bankAccountNumber?: string;
  autoVerifyReceipts?: boolean;
  enablePaymentGateway?: boolean;
  paymentGatewayProvider?: string;
  paymentGatewayApiKey?: string;
  backendBaseUrl?: string;
  backendApiToken?: string;
  // Auto-Cleanup Settings
  autoCleanupEnabled?: boolean;
  autoDeleteCardsDays?: number;
  autoDeleteAuditLogsDays?: number;
  autoCleanupFrequency?: "daily" | "weekly" | "monthly";
  lastAutoCleanupDate?: string;

  // Network Devices Auto Ping Settings (الفحص الدوري التلقائي للأجهزة)
  autoPingDevicesEnabled?: boolean;
  autoPingIntervalMinutes?: number; // default 10 minutes
  lastAutoPingDevicesDate?: string;

  // Security and Backup (Auto Restart / Purge)
  autoRestartEnabled?: boolean;
  autoRestartDays?: number;
  autoPurgeIdleSessions?: boolean;
  enableBiometricLogin?: boolean;
}

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  actionType: "RESET_CONSUMPTION" | "AUTO_SUSPEND_EXPIRED" | "EXPIRY_ALERTS" | "BACKUP_DATA" | "FLUSH_SESSIONS" | "CUSTOM";
  frequency: "daily" | "weekly" | "monthly" | "every_6h" | "every_12h" | "hourly";
  executionTime: string; // e.g. "00:00", "09:00", "1st_of_month"
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export interface User {
  id?: string;
  name: string;
  role: string;
  username: string;
  distributorId?: string;
  permissions?: DistributorPermissions;
}

export interface DistributorOffer {
  id: string;
  name: string;
  price: number; // base price
  countryPrices?: Record<string, number>; // flexible data structure for country prices
  durationMonths: number;
  maxCustomers?: number;
  maxNasServers?: number;
  pricePerNasServer?: number;
  description?: string;
  currency?: string;
  country?: string; // e.g. "مصر", "ليبيا"
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: "payment" | "deduction"; // payment (دفع/إيداع), deduction (خصم)
  amount: number;
  description: string;
  referenceId?: string; // invoice number or related ID
  processedBy?: string;
}
