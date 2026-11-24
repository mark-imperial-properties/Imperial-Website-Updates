const { chromium } = require('playwright-core'); const fs = require('fs');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  const dir = require('path').join(__dirname, '..', 'articles') + '/', LIVE = process.argv[2] === 'live';
  const frag = fs.readFileSync(dir + 'exposePhotoStrip.html', 'utf8'), css = fs.readFileSync(dir + 'styleSheet-exposePhotoStrip-block.css', 'utf8');
  for (const [name, w, h] of [['landscape', 800, 360], ['portrait', 390, 844], ['desktop', 1440, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: name !== 'desktop', isMobile: name !== 'desktop' });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    if (!LIVE) await p.route('**/*', async r => { if (r.request().resourceType() === 'document' && r.request().url().includes('imperial-properties.com')) { const res = await r.fetch(); let body = await res.text(); body = body.replace(/<script>\s*\/\/ Expose pages:[\s\S]*?<\/script>/, () => frag); return r.fulfill({ response: res, body }); } return r.continue().catch(() => {}); });
    await p.goto('https://www.imperial-properties.com/en/IP2-10488-villa-port-d-andratx-andratx-00D079', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    if (!LIVE) await p.addStyleTag({ content: css });
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    await p.waitForTimeout(2000);
    const vis = () => p.evaluate(() => getComputedStyle(document.getElementById('aimee-launcher')).visibility);
    const res = {};
    res.top = await vis();
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.rwIntro').getBoundingClientRect().top + scrollY + 60)); await p.waitForTimeout(600);
    res.overPhoto = await vis();
    if (name === 'landscape') await p.screenshot({ path: require('path').join(__dirname, 'screenshots', 'landscape-fixed.png') });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.wsPhotoStripWrap').getBoundingClientRect().bottom + scrollY + 300)); await p.waitForTimeout(600);
    res.pastPhotos = await vis();
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
    await p.locator('#rwPropertyDetailImageGallery a').nth(1).click({ force: true }); await p.waitForTimeout(1500);
    res.viewerOpen = await vis();
    console.log(name, JSON.stringify(res), errs.join(' | ') || 'no errors');
    await ctx.close();
  }
  await b.close();
})();
