const { chromium } = require('playwright-core');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  for (const [w, h] of [[1366, 768], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('https://www.imperial-properties.com/en/IP2-10488-villa-port-d-andratx-andratx-00D079', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    await p.waitForTimeout(1500);
    await p.locator('#rwPropertyDetailQuickActionImages').click(); await p.waitForTimeout(1200);
    const viewer = await p.evaluate(() => !!document.querySelector('#rwPropertyDetail .rwSlideshow.rwShow'));
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('#rwPropertyDetail .rwSlideshow .rwTimes')?.click()); await p.waitForTimeout(800);
    await p.locator('#rwPropertyDetailQuickActionEnquire').click(); await p.waitForTimeout(1200);
    const contact = await p.evaluate(() => { const m = document.getElementById('rwContactModal'); return !!m && (m.open || m.classList.contains('rwShow') || getComputedStyle(m).display !== 'none'); });
    console.log(w + 'px', 'Photos opens viewer:', viewer, '| Enquire opens contact form:', contact);
    await p.close();
  }
  await b.close();
})();
