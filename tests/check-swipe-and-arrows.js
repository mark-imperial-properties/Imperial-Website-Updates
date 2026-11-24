const { chromium, devices } = require('playwright-core'); const fs = require('fs');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  const dir = require('path').join(__dirname, '..', 'articles') + '/';
  const frag = fs.readFileSync(dir + 'exposePhotoStrip.html', 'utf8');
  for (const [name, opts] of [['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/*', async r => { if (r.request().resourceType() === 'document' && r.request().url().includes('imperial-properties.com')) { const res = await r.fetch(); let body = await res.text(); return r.fulfill({ response: res, body }); } return r.continue().catch(() => {}); });
    await p.goto('https://www.imperial-properties.com/en/IP2-10887-villa-santa-ponsa-calvia-018C45', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    await p.waitForTimeout(2500);
    const swipe = async dx => p.evaluate(dx => {
      const img = document.querySelector('.rwIntro > img'); const r = img.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height * 0.3;
      const t = (cx) => new Touch({ identifier: 1, target: img, clientX: cx, clientY: y });
      img.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(x)], changedTouches: [t(x)] }));
      img.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(x + dx)] }));
    }, dx);
    if (name === 'phone') { await swipe(-120); await swipe(-120); await swipe(-120); await swipe(120); await p.waitForTimeout(1200); }
    else { await p.locator('.rwIntro .wsBrowseNext').click(); await p.locator('.rwIntro .wsBrowseNext').click(); await p.waitForTimeout(800); }
    console.log(name, JSON.stringify(await p.evaluate(() => ({ counter: document.querySelector('.wsPhotoCounter').textContent, active: [...document.querySelectorAll('#rwPropertyDetailImageGallery > a')].findIndex(a => a.classList.contains('wsActive')), visibleArrows: [...document.querySelectorAll('.wsBrowseButton')].filter(b => getComputedStyle(b).display !== 'none' && !b.hidden).length }))), errs.join(' | ') || 'no errors');
    if (name === 'phone') { await p.evaluate(() => window.scrollTo(0, 120)); await p.waitForTimeout(800); await p.screenshot({ path: require('path').join(__dirname, 'screenshots', 'phone-simple.png') }); }
    await ctx.close();
  }
  await b.close();
})();
