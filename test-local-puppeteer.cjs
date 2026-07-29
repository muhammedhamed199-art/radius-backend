const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => {
       console.log('PAGE ERROR MESSAGE:', error.message);
       console.log('PAGE ERROR STACK:', error.stack);
    });
    page.on('response', response => {
       if (!response.ok()) {
           console.log('RESPONSE NOT OK:', response.url(), response.status());
       }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log("Done");
    await browser.close();
  } catch (err) {
    console.error("Puppeteer Error:", err);
  }
})();
