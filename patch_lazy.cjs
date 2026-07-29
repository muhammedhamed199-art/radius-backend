const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Suspense and lazy to React import
content = content.replace(
  'import React, { useState, useEffect, useMemo, useCallback } from "react";',
  'import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";'
);

// 2. Replace static imports with lazy imports
const viewsToLazyLoad = [
  'DashboardView',
  'PingTestView',
  'DevicesView',
  'StatsView',
  'OffersView',
  'SubscribersView',
  'NasServersView',
  'AuditLogsView',
  'HotspotCardsView',
  'DistributorsView',
  'SubDistributorManagementView',
  'SupportView',
  'SettingsView',
  'PermissionProfilesView',
  'SubscriberPortalView',
  'LoginView',
  'ReceiptsReviewView',
  'SubscriberFinancialsView',
  'DistributorSubscriptionsView'
];

viewsToLazyLoad.forEach(view => {
  const staticImport = `import ${view} from "./components/${view}";`;
  const lazyImport = `const ${view} = lazy(() => import("./components/${view}"));`;
  content = content.replace(staticImport, lazyImport);
});

// 3. Create a LoadingFallback
const loadingFallbackDef = `
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[100dvh] w-full bg-slate-950 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default function App() {`;

content = content.replace('export default function App() {', loadingFallbackDef);

fs.writeFileSync('src/App.tsx', content);
