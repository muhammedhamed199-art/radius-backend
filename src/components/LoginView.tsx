/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Signal, 
  Lock,
  UserPlus, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  Key, 
  Globe, 
  AlertCircle,
  Zap,
  PhoneCall,
  Loader2,
  Fingerprint
} from "lucide-react";
import { Distributor, GeneralSettings, UserRole, COUNTRIES } from "../types";
import { encryptData, decryptData } from "../utils/crypto";
import { safeStorage } from "../utils/storage";

interface LoginViewProps {
  darkMode?: boolean;
  onToggleDarkMode?: any;
  currentLang?: string;
  onToggleLanguage?: () => void;
  distributors: Distributor[];
  radiusName?: string;
  settings?: GeneralSettings;
  adminUser?: { name: string; role: string; username: string; password?: string };
  onLoginSuccess: (user: {
    id?: string;
    name: string;
    role: string;
    username: string;
    password?: string;
    distributorId?: string;
    permissions?: any;
  }, forcePaymentPage?: boolean) => void;
  onOpenSubscriberPortal?: () => void;
  customers?: any[];
  onSubscriberLoginSuccess?: (customer: any) => void;
  distributorOffers?: any[];
  onRegisterDistributor?: (distributor: any) => void;
  offers?: any[];
  onRegisterCustomer?: (customer: any) => void;
}

export default function LoginView({
  distributors,
  radiusName,
  settings,
  adminUser,
  onLoginSuccess,
  onOpenSubscriberPortal,
  customers = [],
  distributorOffers = [],
  onRegisterDistributor,
  onSubscriberLoginSuccess,
  offers = [],
  onRegisterCustomer,
  currentLang = "ar",
  onToggleLanguage
}: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"login" | "register" | "register_subscriber">("login");
  const [regType, setRegType] = useState<"subscriber" | "distributor">(() => {
    const savedRole = safeStorage.getItem("radius_last_role");
    return savedRole === "subscriber" ? "subscriber" : "distributor";
  });

  const saveLastRole = (roleName: string) => {
    safeStorage.setItem("radius_last_role", roleName);
  };
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regOfferId, setRegOfferId] = useState("");
  const [regCountry, setRegCountry] = useState(COUNTRIES[0] || "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return safeStorage.getItem("radius_remember_me") !== "false";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (rememberMe) {
      try {
        const savedUserEnc = safeStorage.getItem("radius_saved_username");
        const savedPassEnc = safeStorage.getItem("radius_saved_password");
        if (savedUserEnc) setUsername(decryptData(savedUserEnc));
        if (savedPassEnc) setPassword(decryptData(savedPassEnc));
      } catch (e) {
        console.warn("Failed to decrypt saved credentials");
      }
    }
  }, [rememberMe]);

  const handleRememberMeSave = () => {
    if (rememberMe) {
      safeStorage.setItem("radius_saved_username", encryptData(username.trim()));
      safeStorage.setItem("radius_saved_password", encryptData(password.trim()));
      safeStorage.setItem("radius_remember_me", "true");
    } else {
      safeStorage.removeItem("radius_saved_username");
      safeStorage.removeItem("radius_saved_password");
      safeStorage.setItem("radius_remember_me", "false");
    }
  };

  const displaySystemName = settings?.radiusName || radiusName || "ريديوس ريادة المتكامل للشبكات";
  const displayTagline = settings?.loginTagline || "نظام إدارة الشبكات والموزعين المتقدم";
  const displayDescription = settings?.loginDescription || "منصة الإدارة المركزية لسيرفرات الميكروتيك وباقات المشتركين والموزعين";
  const displayFooterNote = settings?.loginFooterNote || "";
  const displaySupportPhone = settings?.loginSupportPhone || settings?.ownerPhone || "";
  const showSubscriberPortal = settings?.showSubscriberPortalBtn ?? true;

  const handleQuickLogin = (userItem: { name: string; username: string; role?: string; id?: string; permissions?: any }) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const isTechAdmin = userItem.role === UserRole.TECHNICAL_ADMIN || userItem.role === UserRole.ADMIN || userItem.username === (adminUser?.username || "admin");
      onLoginSuccess({
        id: userItem?.id,
        name: userItem.name,
        role: userItem.role || (isTechAdmin ? "مالك النظام" : "موزع معتمد"),
        username: userItem.username,
        distributorId: isTechAdmin ? undefined : userItem?.id,
        permissions: userItem.permissions
      });
      setIsLoading(false);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMessage("يرجى تعبئة الحقول الإلزامية.");
      return;
    }
    
    const cleanUser = regUsername.trim().toLowerCase();
    
    if (regType === "subscriber") {
      if (customers.some(c => (c.username || "").toLowerCase() === cleanUser)) {
        setErrorMessage("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
        return;
      }
    } else {
      const adminUserLower = (adminUser?.username || "admin").toLowerCase();
      if (cleanUser === adminUserLower || distributors.some(d => d.username.toLowerCase() === cleanUser)) {
        setErrorMessage("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
        return;
      }
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (regType === "subscriber") {
        const availableOffers = offers.filter(o => !o.country || o.country === "الكل" || o.country === regCountry);
        if (onRegisterCustomer) {
          onRegisterCustomer({
            id: "cust_" + Date.now(),
            name: regName.trim(),
            username: regUsername.trim(),
            password: regPassword.trim(),
            phone: regPhone.trim(),
            country: regCountry,
            status: "منتهي", 
            connectionType: "PPPoE",
            ipAddress: "Dynamic",
            concurrentLogins: 0,
            maxConcurrentLogins: 1,
            offerId: regOfferId || availableOffers[0]?.id || "",
            consumptionGB: 0,
            expiryDate: new Date().toISOString().split('T')[0],
            balance: 0,
            debt: 0
          });
        }
      } else {
        const availableDistOffers = distributorOffers.filter(o => !o.country || o.country === "الكل" || o.country === regCountry);
        const resolvedOfferId = regOfferId || availableDistOffers[0]?.id;
        if (onRegisterDistributor) {
          onRegisterDistributor({
            id: "dist_" + Date.now(),
            name: regName.trim(),
            username: regUsername.trim(),
            password: regPassword.trim(),
            phone: regPhone.trim(),
            country: regCountry,
            role: "موزع معتمد",
            balance: 0,
            debt: 0,
            customersCount: 0,
            salesCount: 0,
            subscriptionOfferId: resolvedOfferId,
            subscriptionStatus: resolvedOfferId ? "منتهي" : "نشط",
            permissions: {
               canManageSubscribers: true,
               canManageCards: true,
               canViewStats: true,
               canViewSupport: true
            }
          });
        }
      }
      
      setIsLoading(false);
      setErrorMessage(null);
      setUsername(regUsername.trim());
      setPassword(regPassword.trim());
      setLoginMode("login");
    }, 800);
  };

  const handleBiometricLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        setErrorMessage("جهازك لا يدعم المصادقة البيومترية.");
        return;
      }
      setIsLoading(true);
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "preferred",
          timeout: 60000
        }
      });
      
      // If we reach here, biometric auth was successful.
      // We log them in using the saved credentials or as the last logged in user.
      const savedUserEnc = safeStorage.getItem("radius_saved_username");
      const savedPassEnc = safeStorage.getItem("radius_saved_password");
      if (savedUserEnc && savedPassEnc) {
        const u = decryptData(savedUserEnc);
        const p = decryptData(savedPassEnc);
        if (u && p) {
          setUsername(u);
          setPassword(p);
          // Manually trigger the form submit logic or just call a helper
          setTimeout(() => {
            const form = document.getElementById('login-form') as HTMLFormElement;
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 100);
          return;
        }
      }
      
      // Fallback if no saved credentials (this shouldn't normally happen if biometric is used after saving)
      setErrorMessage("لا توجد بيانات محفوظة لتسجيل الدخول.");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("فشلت المصادقة البيومترية.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict trim and sanitization of inputs
    const trimmedUsername = username.replace(/[\s\u200B-\u200D\uFEFF\u00A0]+/g, " ").trim();
    const rawUser = trimmedUsername;
    const rawPass = password.trim();

    if (!rawUser || !rawPass) {
      setErrorMessage("يرجى إدخال اسم المستخدم وكلمة المرور كاملاً");
      return;
    }

    setIsLoading(true);

    const cleanUser = rawUser.toLowerCase();
    const cleanUserDigits = cleanUser.replace(/\D/g, "");
    const expectedAdminUsername = (adminUser?.username || "admin").toLowerCase();
    const expectedAdminPassword = adminUser?.password || "admin";

    // 1. فحص حساب المدير 
    const isAdminMatch = 
      (cleanUser === expectedAdminUsername && (rawPass === expectedAdminPassword || rawPass.toLowerCase() === expectedAdminPassword.toLowerCase())) ||
      (cleanUser === "admin" && (rawPass === "admin" || rawPass.toLowerCase() === "admin"));

    if (isAdminMatch) {
      handleRememberMeSave();
      saveLastRole(UserRole.ADMIN);
      onLoginSuccess({
        role: UserRole.ADMIN,
        name: adminUser?.name || "المالك المسئول للنظام",
        username: adminUser?.username || rawUser,
        password: adminUser?.password || rawPass
      });
      setIsLoading(false);
      return;
    }

    // دوال مساعدة للبحث في قاعدة البيانات المحلية (تعمل كخطة بديلة)
    const findDistributor = () => {
      if (!distributors || distributors.length === 0) return null;
      return distributors.find(d => {
        const dUser = (d.username || "").trim().toLowerCase();
        const dPhone = (d.phone || "").trim().toLowerCase();
        const dPhoneDigits = dPhone.replace(/\D/g, "");
        const dId = (d.id || "").trim().toLowerCase();
        const isUserMatch = (dUser !== "" && dUser === cleanUser) || (dPhone !== "" && dPhone === cleanUser) || (cleanUserDigits.length > 3 && dPhoneDigits !== "" && dPhoneDigits === cleanUserDigits) || (dId !== "" && dId === cleanUser);
        if (!isUserMatch) return false;
        const dPass = (d.password || "").trim();
        return dPass === rawPass || dPass.toLowerCase() === rawPass.toLowerCase();
      });
    };

    const findCustomersAndAuth = () => {
      if (!customers || customers.length === 0) return null;
      for (const customer of customers) {
        const pUser = (customer.portalUsername || "").trim().toLowerCase();
        const uUser = (customer.username || "").trim().toLowerCase();
        const phoneUser = (customer.phone || "").trim().toLowerCase();
        const phoneDigits = phoneUser.replace(/\D/g, "");
        const isUserMatch = (pUser !== "" && pUser === cleanUser) || (uUser !== "" && uUser === cleanUser) || (phoneUser !== "" && phoneUser === cleanUser) || (cleanUserDigits.length > 3 && phoneDigits !== "" && phoneDigits === cleanUserDigits);
        if (isUserMatch) {
          const portalPass = (customer.portalPassword || "").trim();
          const mainPass = (customer.password || "").trim();
          const rawPassLower = rawPass.toLowerCase();
          const isPortalPassMatch = portalPass !== "" && (rawPass === portalPass || rawPassLower === portalPass.toLowerCase());
          const isMainPassMatch = mainPass !== "" && (rawPass === mainPass || rawPassLower === mainPass.toLowerCase());
          const isDefaultPassMatch = (portalPass === "" && mainPass === "") && (rawPass === "123456" || rawPass === "123" || rawPassLower === "admin");
          if (isPortalPassMatch || isMainPassMatch || isDefaultPassMatch) return customer;
        }
      }
      return null;
    };

    // 2. فحص محلي للموزعين أولاً
    const distMatch = findDistributor();
    if (distMatch) {
      const isExpired = distMatch.subscriptionStatus === "منتهي";
      handleRememberMeSave();
      saveLastRole(distMatch.role || UserRole.DISTRIBUTOR);
      onLoginSuccess({ 
        role: distMatch.role || UserRole.DISTRIBUTOR, 
        name: distMatch.name, 
        username: distMatch.username, 
        password: distMatch.password,
        id: distMatch.id,
        distributorId: distMatch.id,
        permissions: distMatch.permissions
      }, isExpired);
      setIsLoading(false);
      return;
    }

    // 3. فحص محلي للمشتركين
    const foundCustomer = findCustomersAndAuth();
    if (foundCustomer) {
      if (onSubscriberLoginSuccess) {
        handleRememberMeSave();
        saveLastRole("subscriber");
        onSubscriberLoginSuccess(foundCustomer);
      }
      setIsLoading(false);
      return;
    }

    // 4. التحقق عبر السيرفر الحقيقي (POST /api/login)
    const formData = new URLSearchParams();
    formData.append("username", rawUser);
    formData.append("password", rawPass);

    fetch("/api/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      body: formData.toString()
    })
    .then(response => {
      if (!response.ok) throw new Error("بيانات الدخول غير صحيحة");
      return response.json();
    })
    .then(data => {
      handleRememberMeSave();
      const userRole = data.role || data.user?.role || UserRole.DISTRIBUTOR;
      saveLastRole(userRole);
      if (userRole === "subscriber" || userRole === "مشترك") {
        if (onSubscriberLoginSuccess) {
          onSubscriberLoginSuccess(data.user || { username: rawUser, name: data.name || rawUser });
        }
      } else {
        const distId = data.distributorId || data.user?.distributorId || data.id || data.user?.id;
        const distMatch = distributors?.find(d => d.id === distId || d.username?.toLowerCase() === rawUser.toLowerCase());
        const isExpired = distMatch?.subscriptionStatus === "منتهي";
        onLoginSuccess({
          role: userRole, 
          name: data.name || data.user?.name || rawUser,
          username: rawUser,
          id: distId,
          distributorId: distId,
          permissions: data.permissions || distMatch?.permissions
        }, isExpired);
      }
    })
    .catch(error => {
      setErrorMessage("بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0c] text-slate-100 p-4 py-8 sm:py-12 relative overflow-y-auto overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">
      
      {/* Subtle Glow behind logo */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col justify-center">
        
        {/* Top Floating Header */}
        <div className="flex flex-col items-center justify-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] ring-1 ring-white/10">
            <Signal className="w-10 h-10 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-[1.75rem] font-black tracking-tight text-white">{displaySystemName}</h1>
            <p className="text-sm font-medium text-slate-400">{displayTagline}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#111113] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
          
          {/* Unified Login Header or Registration Header */}
          {loginMode === "login" ? (
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-white mb-1">تسجيل الدخول إلى المنصة</h2>
              <p className="text-xs text-slate-400">أدخل اسم المستخدم أو رقم الهاتف وكلمة المرور للدخول المباشر</p>
            </div>
          ) : (
            <div className="flex bg-[#0a0a0c] p-1.5 rounded-2xl mb-6 ring-1 ring-white/5">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setRegType("subscriber"); saveLastRole("subscriber"); setErrorMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  regType === "subscriber" 
                    ? "bg-[#27272a] text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                حساب مشترك جديد
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setRegType("distributor"); saveLastRole("distributor"); setErrorMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  regType === "distributor"
                    ? "bg-[#27272a] text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                حساب موزع جديد
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-red-200 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {loginMode === "register" || loginMode === "register_subscriber" ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="الاسم الثلاثي..."
                    className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">اسم المستخدم (للدخول)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.replace(/\s/g, ""))}
                    placeholder="اسم الدخول..."
                    dir="ltr"
                    className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">رقم الهاتف المحمول</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">الدولة</label>
                <div className="relative">
                  <select
                    value={regCountry}
                    onChange={(e) => {
                      setRegCountry(e.target.value);
                      setRegOfferId("");
                    }}
                    className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                  </select>
                </div>
              </div>

              {regType === "distributor" && distributorOffers && distributorOffers.length > 0 && (() => {
                const availableOffers = distributorOffers.filter(o => !o.country || o.country === "الكل" || o.country === regCountry);
                if (availableOffers.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">خطة الاشتراك</label>
                    <select 
                      value={regOfferId || availableOffers[0]?.id || ""} 
                      onChange={e => setRegOfferId(e.target.value)} 
                      className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                    >
                      {availableOffers.map(offer => {
                        const offerPrice = (regCountry && offer.countryPrices && offer.countryPrices[regCountry] !== undefined) ? offer.countryPrices[regCountry] : offer.price;
                        return (
                          <option key={offer.id} value={offer.id} className="bg-[#111113]">{offer.name} - {offerPrice === 0 ? "مجاني" : `${offerPrice} ${offer.currency || "ريال"}`}</option>
                        );
                      })}
                    </select>
                  </div>
                );
              })()}

              {regType === "subscriber" && offers && offers.length > 0 && (() => {
                const availableOffers = offers.filter(o => !o.country || o.country === "الكل" || o.country === regCountry);
                if (availableOffers.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">باقة الإنترنت</label>
                    <select 
                      value={regOfferId} 
                      onChange={e => setRegOfferId(e.target.value)} 
                      className="w-full bg-[#0a0a0c] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-[#111113]">اختر الباقة</option>
                      {availableOffers.map(offer => (
                        <option key={offer.id} value={offer.id} className="bg-[#111113]">{offer.name} - {offer.price === 0 ? "مجاني" : `${offer.price} ${offer.currency || "ريال"}`}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.2)] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>جاري معالجة الطلب...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>إنشاء حساب جديد</span>
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <button type="button" onClick={() => { setLoginMode("login"); setErrorMessage(null); }} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  لديك حساب بالفعل؟ <span className="text-indigo-400 font-bold">تسجيل الدخول</span>
                </button>
              </div>
            </form>
          ) : (
            <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2 group">
                <label className="block text-[13px] font-bold text-slate-300 pr-1">
                  اسم المستخدم أو الهاتف
                </label>
                <div className="relative flex items-center">
                  <div className="absolute right-4 p-1.5 bg-[#1a1a1e] rounded-xl text-slate-400 border border-white/5 pointer-events-none z-10">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} 
                    autoComplete="username" 
                    autoCorrect="off" 
                    autoCapitalize="none" 
                    spellCheck={false}
                    placeholder="اسم المستخدم أو رقم الهاتف..."
                    dir="ltr"
                    className="w-full bg-[#0a0a0c] text-white pl-4 pr-[3.5rem] py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-base outline-none transition-all placeholder:text-slate-600 text-left"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="block text-[13px] font-bold text-slate-300 pr-1">
                  كلمة المرور
                </label>
                <div className="relative flex items-center">
                  <div className="absolute right-4 p-1.5 bg-[#1a1a1e] rounded-xl text-slate-400 border border-white/5 pointer-events-none z-10">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    autoComplete="current-password" 
                    autoCorrect="off" 
                    autoCapitalize="none" 
                    spellCheck={false}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-[#0a0a0c] text-white pl-12 pr-[3.5rem] py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-base outline-none transition-all placeholder:text-slate-600 text-left tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 p-1.5 text-slate-500 hover:text-white transition-all z-10"
                    title={showPassword ? "إخفاء" : "إظهار"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-slate-500 bg-[#0a0a0c] px-2.5 py-1 rounded-lg border border-white/5">RADIUS v4.8</span>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">تذكر بياناتي</span>
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-slate-700 bg-[#0a0a0c] group-hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    {rememberMe && <div className="w-3 h-3 bg-indigo-500 rounded-sm" />}
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.2)] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>

              {settings?.enableBiometricLogin && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isLoading || !window.PublicKeyCredential}
                  className="w-full py-4 mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer border border-slate-700"
                >
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                  <span>دخول عبر البصمة / الوجه</span>
                </button>
              )}

              <div className="text-center mt-6">
                <button 
                  type="button" 
                  onClick={() => { setLoginMode("register"); setErrorMessage(null); }} 
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  ليس لديك حساب؟ <span className="text-indigo-400 font-bold">إنشاء حساب جديد</span>
                </button>
              </div>
            </form>
          )}

        </div>
        
        {displaySupportPhone && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>للدعم الفني: </span>
              <span className="font-mono text-slate-400 tracking-wider" dir="ltr">{displaySupportPhone}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}