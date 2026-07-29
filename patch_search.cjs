const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

const importStr = 'import React, { useState, useMemo, useEffect } from "react";';
if (!content.includes(importStr)) {
  content = content.replace('import React, { useState, useMemo } from "react";', importStr);
}

const effectStr = `  const [statusFilter, setStatusFilter] = useState<string>("all");`;
const newEffectStr = `  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const searchInput = document.getElementById('subscribers-search-input');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);`;

content = content.replace(effectStr, newEffectStr);

const oldInputStr = `            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}`;

const newInputStr = `            <input
              id="subscribers-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}`;

content = content.replace(oldInputStr, newInputStr);

const oldPlaceholder = 'placeholder="ابحث بالاسم، اسم الدخول، الهاتف، الـ IP، الماك، المنطقة، الباقة أو السيرفر..."';
const newPlaceholder = 'placeholder="ابحث بالاسم، اسم الدخول، الهاتف... (اختصار: Ctrl+F)"';
content = content.replace(oldPlaceholder, newPlaceholder);

fs.writeFileSync('src/components/SubscribersView.tsx', content);
