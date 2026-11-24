const { chromium } = require('playwright-core'); const fs = require('fs');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  const css = fs.readFileSync(require('path').join(__dirname, '..', 'articles', 'styleSheet-exposePhotoStrip-block.css'), 'utf8');
  for (const [u, shot] of [['IP2-10887-villa-santa-ponsa-calvia-018C45', 'p5a'], ['IP2-10881-apartment-santa-ponsa-calvia-01874A', 'p5b']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('https://www.imperial-properties.com/en/' + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    
    await p.waitForTimeout(2000);
    console.log(u.slice(0, 9), JSON.stringify(await p.evaluate(() => { const i = document.querySelector('.rwIntro'), img = i.querySelector('img'), qa = i.querySelector('.rwQuickActions'); const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.top + scrollY), Math.round(b.height)]; }; return { intro: r(i), img: r(img), actions: r(qa), actionsOverlapPhoto: qa.getBoundingClientRect().top < img.getBoundingClientRect().bottom - 1, wrapped: new Set([...qa.children].map(c => Math.round(c.getBoundingClientRect().top))).size > 1 }; })), errs.join(' | ') || 'no errors');
    await p.screenshot({ path: require('path').join(__dirname, 'screenshots', shot + '.png') });
    await ctx.close();
  }
  await b.close();
})();
