import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

customer_check = """
      // 3. Check registered customers (Subscribers)
      if (customers && customers.length > 0) {
        const foundCustomer = customers.find(c => (c.username || c.phone || "").toLowerCase() === cleanUser);
        if (foundCustomer) {
          const expectedCustPass = foundCustomer.password || "123456";
          if (cleanPass === expectedCustPass) {
            if (onSubscriberLoginSuccess) {
              onSubscriberLoginSuccess(foundCustomer);
            }
            setIsLoading(false);
            return;
          }
        }
      }

      // 4. Credentials not found
      setErrorMessage("اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.");
"""

content = content.replace(
"""      // 3. Credentials not found
      setErrorMessage("اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.");""", customer_check)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
