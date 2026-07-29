import re

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific return line with the rest of the logic + the return line.
pattern = r'return \(\s*<div className="min-h-\[100dvh\] w-full bg-\[\#0a0a0f\] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">'

missing_code = """          return (
            (pUser !== "" && pUser === cleanUser) ||
            (uUser !== "" && uUser === cleanUser) ||
            (phoneUser !== "" && phoneUser === cleanUser) ||
            (cleanUserDigits.length > 3 && phoneDigits !== "" && phoneDigits === cleanUserDigits)
          );
        });
      };

      // Helper to attempt subscriber authentication
      const attemptCustomerLogin = (foundCustomers: any[]): boolean => {
        for (const foundCustomer of foundCustomers) {
          const portalPass = (foundCustomer.portalPassword || "").trim();
          const mainPass = (foundCustomer.password || "").trim();
          const cleanPassLower = cleanPass.toLowerCase();
          const isPortalPassMatch = portalPass !== "" && (cleanPass === portalPass || cleanPassLower === portalPass.toLowerCase());
          const isMainPassMatch = mainPass !== "" && (cleanPass === mainPass || cleanPassLower === mainPass.toLowerCase());
          const isDefaultPassMatch = (portalPass === "" && mainPass === "") && (cleanPass === "123456" || cleanPass === "123");
          
          if (isPortalPassMatch || isMainPassMatch || isDefaultPassMatch) {
            if (onSubscriberLoginSuccess) {
              handleRememberMeSave();
              onSubscriberLoginSuccess(foundCustomer);
            }
            setIsLoading(false);
            return true;
          }
        }
        return false;
      };

      if (loginMode === "subscriber") {
        const found = findCustomers();
        if (found.length > 0) {
          const loggedIn = attemptCustomerLogin(found);
          if (loggedIn) return;
        }
        setError("بيانات المشترك غير صحيحة. يرجى التحقق من اسم المستخدم أو رقم الهاتف وكلمة المرور.");
        setIsLoading(false);
        return;
      } else {
        if (cleanUser === expectedAdminUsername && cleanPass === expectedAdminPassword) {
          handleRememberMeSave();
          onLoginSuccess(UserRole.ADMIN, "مدير النظام", null);
          return;
        }

        if (distributors && distributors.length > 0) {
          const distributorMatch = distributors.find(d => 
            (d.username || "").toLowerCase() === cleanUser && 
            d.password === cleanPass
          );
          if (distributorMatch) {
            if (distributorMatch.status === "موقوف") {
              setError("حساب الموزع هذا موقوف حالياً. يرجى مراجعة إدارة الشبكة.");
              setIsLoading(false);
              return;
            }
            handleRememberMeSave();
            onLoginSuccess(UserRole.DISTRIBUTOR, distributorMatch.name, distributorMatch.id);
            return;
          }
        }
        setError("بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">"""

new_content = re.sub(pattern, missing_code, content)

with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done")
