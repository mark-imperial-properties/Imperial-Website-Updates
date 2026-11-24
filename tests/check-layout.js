const { chromium } = require('playwright-core'); const fs = require('fs');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  const dir = require('path').join(__dirname, '..', 'articles') + '/', LIVE = process.argv[2] === 'live';
  const frag = fs.readFileSync(dir + 'exposePhotoStrip.html', 'utf8'), css = fs.readFileSync(dir + 'styleSheet-exposePhotoStrip-block.css', 'utf8');
  for (const [name, w, h, mob] of [['desktop', 1920, 1000, false], ['laptop', 1366, 768, false], ['tablet', 820, 1180, true], ['landscape', 800, 360, true], ['phone', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    if (!LIVE) await p.route('**/*', async r => { if (r.request().resourceType() === 'document' && r.request().url().includes('imperial-properties.com')) { const res = await r.fetch(); let body = await res.text(); body = body.replace(/<script>\s*\/\/ Expose pages:[\s\S]*?<\/script>/, () => frag); return r.fulfill({ response: res, body }); } return r.continue().catch(() => {}); });
    await p.goto('https://www.imperial-properties.com/en/IP2-10488-villa-port-d-andratx-andratx-00D079', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    if (!LIVE) await p.addStyleTag({ content: css });
    await p.waitForTimeout(2000);
    const r = await p.evaluate(() => {
      const B = e => e.getBoundingClientRect(), i = document.querySelector('.rwIntro'), img = i.querySelector('img'), qa = i.querySelector('.rwQuickActions'), label = i.querySelector('.rwLabel'), arrow = i.querySelector('.wsBrowseNext');
      const ib = B(img), qb = B(qa), lb = label ? B(label) : null;
      return { photo: Math.round(ib.width) + 'x' + Math.round(ib.height), icons: qb.top >= ib.bottom - 1 ? 'row under' : (qb.left >= ib.left && qb.top >= ib.top && qb.bottom <= ib.bottom ? 'panel on photo ' + Math.round(qb.width) + 'x' + Math.round(qb.height) : 'OUTSIDE PHOTO'), iconsFit: qb.height <= ib.height + 1 || qb.top >= ib.bottom - 1, arrowClearOfPanel: (() => { const a = i.querySelector('.wsBrowsePrev'); return !a || getComputedStyle(a).display === 'none' || B(a).left > qb.right; })(), bannerOnPhoto: lb ? label.closest('.wsHeroPhoto') !== null : 'no banner', bannerClear: (() => { if (!lb || qb.top >= ib.bottom - 1) return 'n/a'; const x = qb.left + 4, y = qb.top + 4; const hit = document.elementFromPoint(x, y); const x2 = qb.right - 4; const hit2 = document.elementFromPoint(x2, y); return !(hit && hit.closest('.rwLabel')) && !(hit2 && hit2.closest('.rwLabel')); })(), arrowOnPhoto: arrow && getComputedStyle(arrow).display !== 'none' ? B(arrow).left > ib.left && Math.abs(B(arrow).top + B(arrow).height / 2 - (ib.top + ib.height / 2)) < 6 : 'n/a', counter: document.querySelector('.wsPhotoCounter')?.textContent };
    });
    if (mob) { await p.locator('.rwIntro .wsHeroPhoto img').evaluate(img => { const r = img.getBoundingClientRect(); const t = x => new Touch({ identifier: 1, target: img, clientX: x, clientY: r.top + 40 }); img.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(300)], changedTouches: [t(300)] })); img.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(150)] })); }); await p.waitForTimeout(300); r.afterSwipe = await p.evaluate(() => document.querySelector('.wsPhotoCounter').textContent); }
    console.log(name.padEnd(9), JSON.stringify(r), errs.join(' | ') || 'no errors');
    await p.screenshot({ path: require('path').join(__dirname, 'screenshots', 'col-' + name + '.png') });
    await ctx.close();
  }
  await b.close();
})();
