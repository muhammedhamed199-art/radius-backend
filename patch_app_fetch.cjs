const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the useEffect where interval polling happens (approx line 188)
// and inject fetches for real customers/nas
const fetchCode = `
    const fetchRealData = async () => {
      try {
        const custRes = await fetch('/api/customers');
        if (custRes.ok) {
          const liveCustomers = await custRes.json();
          setCustomers(liveCustomers);
        }
        const nasRes = await fetch('/api/nas');
        if (nasRes.ok) {
          const liveNas = await nasRes.json();
          setServers(liveNas);
        }
      } catch (err) {
        console.error("Failed to fetch live API data:", err);
      }
    };
    fetchRealData();
`;

// Replace `fetchRemoteState(false);` with the new fetch logic + fetchRemoteState
content = content.replace(
  /fetchRemoteState\(false\);/g,
  `fetchRemoteState(false);\n${fetchCode}`
);

// Also add to the initial mount in that useEffect
content = content.replace(
  /fetchRemoteState\(true\)\.then/g,
  `${fetchCode}\n    fetchRemoteState(true).then`
);

fs.writeFileSync('src/App.tsx', content);
