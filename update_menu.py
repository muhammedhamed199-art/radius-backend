import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

menu_filter = """
    const allMenuItems = [
      { id: 0, name: t("navDashboard"), icon: LayoutDashboard, perm: hasPerm("canViewDashboard") },
      { id: 1, name: currentLang === "en" ? "Ping Checker Tool" : "أداة فحص العميل (Ping)", icon: Wifi, count: displayCustomers.filter(c => c.concurrentLogins > 0).length, perm: hasPerm("canUsePingTool") },
      { id: 2, name: currentLang === "en" ? "Ubiquiti Devices (Neighbors)" : "أجهزة يوبيكيتي (Neighbors)", icon: Radio, count: displayDevices.filter(d => d.status === "منفصل").length, perm: hasPerm("canManageDevices") },
      { id: 3, name: currentLang === "en" ? "Analytics & Charts" : "الإحصائيات والرسوم البيانية", icon: BarChart3, perm: hasPerm("canViewStats") },
      { id: 4, name: t("navOffers"), icon: Percent, count: displayOffers.length, perm: hasPerm("canManageOffers") },
      { id: 5, name: t("navSubscribers"), icon: Users, perm: hasPerm("canManageSubscribers") },
      { id: 6, name: t("navMikrotik"), icon: Server, count: displayServers.filter(s => s.vpnStatus === "منفصل").length, perm: hasPerm("canManageNasServers") },
      { id: 7, name: currentLang === "en" ? "Audit Log Trail" : "سجل العمليات والتعديلات", icon: History, perm: hasPerm("canViewAuditLogs") },
      { id: 8, name: t("navHotspot"), icon: CreditCard, perm: hasPerm("canManageCards") },
      { id: 9, name: t("navDistributors"), icon: UserCheck, perm: !isDistributorSession || hasPerm("canManageDistributors") },
      { id: 10, name: t("navSupport"), icon: MessageSquare, count: displayTickets.filter(t => t.status === "مفتوح").length, perm: hasPerm("canViewSupport") },
      { id: 13, name: "مراجعة الإيصالات", icon: FileText, count: displayCustomers.flatMap(c => c.archivedReceipts || []).filter(r => r.status === "pending").length, perm: hasPerm("canReviewReceipts") },
      { id: 14, name: isDistributorSession ? "الحسابات المالية للمشتركين" : "الحسابات المالية والتقارير", icon: DollarSign, perm: hasPerm("canManageDebt") },
      { id: 15, name: isDistributorSession ? "تجديد اشتراك السيرفر" : "إدارة اشتراكات السيرفرات", icon: CreditCard, perm: hasPerm("canManageServerSubscriptions") },
      { id: 11, name: t("navSelfPortal"), icon: Zap, perm: hasPerm("canViewSelfPortal") },
      { id: 16, name: isDistributorSession ? "" : "قوالب الصلاحيات", icon: Shield, perm: isRootAdmin },
      { id: 12, name: t("navSettings"), icon: Settings, perm: hasPerm("canViewSettings") },
    ];
    
    // If distributor is expired, only allow payment page and settings/logout
    if (isDistributorSession && activeDistributorObj?.subscriptionStatus === "منتهي") {
      return allMenuItems.filter(item => item.id === 15 || item.id === 12);
    }

    return allMenuItems.filter(item => item.perm);
"""

content = re.sub(r'const allMenuItems = \[.*?\];\n\n    return allMenuItems\.filter\(item => item\.perm\);', menu_filter.strip(), content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
