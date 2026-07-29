// src/server/authController.ts

export const login = (req: any, res: any) => {
  console.log("\n==================================================");
  console.log("[LOGIN CONTROLLER DEBUG - MOBILE / BACKEND]");
  
  // Log the entire req.body
  console.log("1. req.body:", req.body);
  
  const rawUsername = req.body?.username || "";
  const rawPassword = req.body?.password || "";
  const role = req.body?.role || "unknown";

  // Log username length to catch whitespace issues
  console.log(`2. username.length (Raw): ${rawUsername.length}`);
  console.log(`3. Character Unicode Codes: ${rawUsername.split("").map((c: string) => c.charCodeAt(0))}`);
  console.log(`4. password.length (Raw): ${rawPassword.length}`);
  
  // Log the explicit role property being processed
  console.log(`5. Role requested: ${role}`);
  console.log("==================================================\n");

  // Simulated authentication logic
  const cleanUsername = rawUsername.replace(/[\s\u200b\u200c\u200d\ufeff\xa0]+/g, '').toLowerCase();
  const cleanPassword = rawPassword.trim();

  if (!cleanUsername || !cleanPassword) {
    console.log("[DEBUG LOG FAIL] Missing username or password -> 401 Unauthorized");
    return res.status(401).json({ detail: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }

  // Mock success for admin or specific test
  if (cleanUsername === "admin" && cleanPassword === "admin") {
    console.log("[DEBUG LOG SUCCESS] Login approved for Admin");
    return res.status(200).json({
      access_token: "mock-token-123",
      token_type: "bearer",
      user: {
        id: 1,
        username: "admin",
        name: "مدير النظام",
        role: "admin"
      }
    });
  }

  // Default simulated response to help identify where 401 Unauthorized is triggered
  console.log(`[DEBUG LOG FAIL] Authentication failed for username='${cleanUsername}' -> 401 Unauthorized`);
  return res.status(401).json({ detail: "اسم المستخدم أو كلمة المرور غير صحيحة" });
};

export const logout = (req: any, res: any) => {
  console.log("\n==================================================");
  console.log("[LOGOUT CONTROLLER DEBUG]");
  console.log("Destroying session and invalidating token");
  console.log("==================================================\n");
  
  // Return success without modifying any database records
  return res.status(200).json({ success: true, message: "تم تسجيل الخروج بنجاح" });
};
