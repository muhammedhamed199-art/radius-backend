const { JSDOM } = require("jsdom");
const jsdom = new JSDOM(``, {
  url: "http://localhost:3000/",
  resources: "usable",
  runScripts: "dangerously",
  pretendToBeVisual: true
});

jsdom.window.addEventListener("error", (e) => {
  console.log("Global Error from JS:", e.error ? e.error.stack : e.message);
});

jsdom.window.console.error = function() {
  console.log("Console error:", ...arguments);
};

// Wait for a few seconds to let scripts run
setTimeout(() => {
  console.log("Done waiting");
}, 5000);

fetch("http://localhost:3000/")
  .then(res => res.text())
  .then(html => {
    jsdom.window.document.documentElement.innerHTML = html;
  });
