import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

# Update Add Username label
content = content.replace(
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المستخدم للدخول (Username):</label>',
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المستخدم للدخول (يمكن إضافة أكثر من اسم بفاصلة ,):</label>'
)

# Update Add IP label
content = content.replace(
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الآي بي المخصص له (IP):</label>',
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الآي بي (يمكن إضافة أكثر من IP بفاصلة ,):</label>'
)

# Add Max Concurrent Logins in Add form
add_max_logins = """                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عدد الأجهزة المسموح بها في نفس الوقت:</label>
                  <input
                    type="number"
                    min="1"
                    value={addMaxConcurrentLogins}
                    onChange={(e) => setAddMaxConcurrentLogins(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                    required
                  />
                </div>
"""
content = content.replace(
    '                <div>\n                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>\n                  <select\n                    value={addOfferId}',
    add_max_logins + '                <div>\n                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>\n                  <select\n                    value={addOfferId}'
)

# Update Edit Username label
content = content.replace(
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المستخدم (الريديوس):</label>',
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المستخدم للدخول (يمكن إضافة أكثر من اسم بفاصلة ,):</label>'
)

# Update Edit IP label
content = content.replace(
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الـ IP المخصص له:</label>',
    '<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الآي بي (يمكن إضافة أكثر من IP بفاصلة ,):</label>'
)

# Add Max Concurrent Logins in Edit form
edit_max_logins = """                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عدد الأجهزة المسموح بها في نفس الوقت:</label>
                  <input
                    type="number"
                    min="1"
                    value={editMaxConcurrentLogins}
                    onChange={(e) => setEditMaxConcurrentLogins(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                    required
                  />
                </div>
"""
content = content.replace(
    '                <div>\n                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>\n                  <select\n                    value={editOfferId}',
    edit_max_logins + '                <div>\n                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>\n                  <select\n                    value={editOfferId}'
)

# Update display in table
content = content.replace(
    '{customer.concurrentLogins} / 1',
    '{customer.concurrentLogins} / {customer.maxConcurrentLogins || 1}'
)

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
