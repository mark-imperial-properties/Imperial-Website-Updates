const { chromium } = require('playwright-core'); const fs = require('fs');
require('fs').mkdirSync(require('path').join(__dirname, 'screenshots'), { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
  const css = fs.readFileSync(require('path').join(__dirname, '..', 'articles', 'styleSheet-exposePhotoStrip-block.css'), 'utf8');
  for (const [name, w, h, touch] of [['desktop', 1904, 1072, false], ['phone', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const p = await ctx.newPage();
    await p.goto('https://www.imperial-properties.com/en/IP2-10488-villa-port-d-andratx-andratx-00D079', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.evaluate(() => { document.querySelectorAll('#rwConsentModal').forEach(m => { try { m.close(); } catch {} m.remove(); }); });
    
    await p.waitForTimeout(1500);
    await p.locator('#rwPropertyDetailImageGallery a').nth(2).click();
    await p.waitForTimeout(2500);
    // stand in for a smaller 1440px file, like the one the user's browser received
    const r = await p.evaluate(async () => {
      const img = document.querySelector('.rwSlideshow .rwCarouselActive img');
      const c = document.createElement('canvas'); c.width = 1440; c.height = 960; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 1440, 960); gr.addColorStop(0, '#3a7bd5'); gr.addColorStop(1, '#00d2a0'); g.fillStyle = gr; g.fillRect(0, 0, 1440, 960); g.fillStyle = '#fff'; g.font = '80px sans-serif'; g.fillText('1440 x 960 test photo', 300, 500);
      img.src = c.toDataURL('image/jpeg', .8); await img.decode();
      const b = img.getBoundingClientRect();
      const ratio = img.naturalWidth / img.naturalHeight, shownH = Math.min(b.height, b.width / ratio), shownW = shownH * ratio;
      return { natural: img.naturalWidth + 'x' + img.naturalHeight, screen: innerWidth + 'x' + innerHeight, photoShown: Math.round(shownW) + 'x' + Math.round(shownH) };
    });
    console.log(name, JSON.stringify(r));
    await p.screenshot({ path: require('path').join(__dirname, 'screenshots', name + '-viewer-full.png') });
    await ctx.close();
  }
  await b.close();
})();
