import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

dist_check = """
        // Subscription check for distributors
        const isTechAdmin = foundDist.role === UserRole.TECHNICAL_ADMIN || foundDist.role === UserRole.ADMIN;
        if (!isTechAdmin && foundDist.subscriptionStatus === "منتهي" && loginMode !== "subscriber") {
           setErrorMessage("تم إيقاف حسابك بسبب انتهاء الاشتراك. يمكنك تسجيل الدخول من بوابة الدفع التلقائي لتجديد اشتراكك.");
           setIsLoading(false);
           return;
        }
        if (cleanPass === expectedPass) {
          const isTechAdmin = foundDist.role === UserRole.TECHNICAL_ADMIN || foundDist.role === UserRole.ADMIN;
          onLoginSuccess({
            id: foundDist?.id,
            name: foundDist.name,
            role: foundDist.role || (isTechAdmin ? "مالك النظام" : "موزع معتمد"),
            username: foundDist.username,
            distributorId: isTechAdmin ? undefined : foundDist?.id,
            permissions: foundDist.permissions
          }, loginMode === "subscriber" || (!isTechAdmin && foundDist.subscriptionStatus === "منتهي"));
"""

content = re.sub(r'// Subscription check for distributors.*?if \(cleanPass === expectedPass\) {.*?permissions: foundDist\.permissions\n\s*}\);', dist_check, content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
