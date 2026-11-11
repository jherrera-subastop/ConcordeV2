/* eslint-disable @typescript-eslint/no-require-imports -- Local screenshot capture and code-native device frame. */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
// Optional capture dependency: set PLAYWRIGHT_PATH to a local Playwright package.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const out = path.resolve(__dirname, '../public/correos/borradores/publicacion-revision');
fs.mkdirSync(out, { recursive: true });
// Only use the local demo, never a signed-in production account.
const url = process.env.MI_GARAJE_DEMO_URL || 'http://127.0.0.1:3226/m/vmc?propuesta=0&llegada=publicacion&pag=glass';
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname), 'Capture requires a local Mi Garaje demo');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#sec-publicaciones .fr').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  // Explicitly illustrative composition requested by Julio: retain the native
  // header and sections, but show only one example publication. These DOM-only
  // changes never alter the source application, an account or production data.
  await page.addStyleTag({ content: '#lab-dock, .lab-dock, nextjs-portal { display:none!important }' });
  await page.waitForTimeout(7000);
  // Capture the actual PUBLICADA component from a native demo row. It is only
  // used outside the phone as a conditional next-state reference, never as the
  // current state of the one publication shown inside the phone.
  const publishedBadge = page.locator('#sec-publicaciones .badgestatus').filter({ hasText: 'PUBLICADA' }).first();
  const nextState = await publishedBadge.evaluate(el => ({ label:el.textContent, classes:el.className }));
  assert.equal(nextState.label, 'PUBLICADA');
  assert(nextState.classes.includes('badgestatus--live'));
  await publishedBadge.evaluate(el => {
    const wrap = document.createElement('span');
    wrap.dataset.publishedBadgeCapture = 'true';
    wrap.style.cssText = 'display:inline-flex;padding:12px;background:#fff;width:max-content;';
    el.replaceWith(wrap); wrap.appendChild(el);
  });
  await page.locator('[data-published-badge-capture]').screenshot({ path:path.join(out, 'badge-publicada-real.png'), animations:'disabled' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  const bellLabel = await page.locator('.kit-shell__mobile-header .nt-bell').getAttribute('aria-label');
  const sourceHeader = await page.locator('.kit-shell__mobile-header').innerHTML();
  await page.evaluate(() => {
    // Keep the complete real VMC header and the Mi Garaje title. The account
    // details and promotional rail are outside this focused example.
    document.querySelector('.f-acct')?.remove();
    document.querySelector('.f-src__rail')?.remove();
    document.querySelector('.f-only')?.remove();
    for (const section of document.querySelectorAll('.fa .fs')) {
      if (section.id === 'sec-publicaciones') continue;
      section.classList.remove('is-open');
      section.querySelector('.fs__toggle')?.setAttribute('aria-expanded', 'false');
      section.querySelector('.fs__wrap')?.remove();
      section.querySelector('.fs__badge')?.remove();
    }
    const list = document.querySelector('#sec-publicaciones .fs__list');
    for (const child of Array.from(list.children).slice(1)) child.remove();
    document.querySelector('#sec-publicaciones .fs__more')?.remove();
    document.querySelector('#sec-publicaciones .pg')?.remove();
    document.querySelectorAll('#sec-publicaciones nav').forEach(el => el.remove());
    window.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: `
    .f-head > :not(:first-child), .f-src__rail, .nt-float, .nt-band { display:none!important }
    .f-src { display:block!important }
    .g-page.g--vmc { padding-top:22px!important; padding-bottom:32px!important }
    .g-activity { margin-top:22px!important }
    .g-activity__head { margin-bottom:14px!important }
    .fa .fs:not(#sec-publicaciones) .fs__wrap { display:none!important }
    #sec-publicaciones .fs__more, #sec-publicaciones .pg, #sec-publicaciones [aria-label*="agina"] { display:none!important }
    #sec-publicaciones .fr--publication {
      display:grid!important; grid-template-columns:48px minmax(0,1fr) auto!important;
      grid-template-areas:"img name side" "meta meta meta"!important;
      align-items:center!important; gap:12px 10px!important; padding:14px 10px!important;
    }
    #sec-publicaciones .fr__main { display:contents!important }
    #sec-publicaciones .fr__img { grid-area:img!important; width:48px!important; height:44px!important }
    #sec-publicaciones .fr__img img { width:48px!important; height:44px!important; object-fit:cover!important }
    #sec-publicaciones .fr__name { grid-area:name!important; font-size:14px!important; line-height:20px!important; white-space:normal!important }
    #sec-publicaciones .fr__meta { grid-area:meta!important; white-space:normal!important; overflow:visible!important; font-size:13px!important; line-height:19px!important; font-weight:400!important }
    #sec-publicaciones .fr__side { grid-area:side!important; display:flex!important; justify-content:flex-end!important; align-items:center!important; align-self:center!important; margin:0!important }
    #sec-publicaciones .badgestatus { font-size:10px!important; line-height:14px!important; padding:5px 9px!important; min-width:100px!important; transform:none!important }
    #sec-publicaciones .fs__list { margin-bottom:6px!important }
  ` });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, 'mi-garaje-mobile-example.png'), animations: 'disabled' });
  const proof = await page.locator('#sec-publicaciones').innerText();
  const qa = await page.evaluate(() => {
    const box = selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom };
    };
    return {
      visibleVehicleCount: Array.from(document.querySelectorAll('.fr')).filter(el => el.getBoundingClientRect().height > 0).length,
      header:box('.kit-shell__mobile-header'), logo:box('.kit-shell__brand img'),
      row:box('#sec-publicaciones .fr'), name:box('#sec-publicaciones .fr__name'),
      badge:box('#sec-publicaciones .badgestatus'), bell:box('.kit-shell__mobile-header .nt-bell'),
      overflow:document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(qa.visibleVehicleCount, 1, 'The example must show exactly one vehicle');
  assert.equal(qa.header.y, 0, 'The full VMC header must remain visible');
  assert(qa.badge.x >= qa.name.right - 1, 'Review badge must sit to the right of the title without overlap');
  assert(qa.badge.right <= qa.row.right, 'Badge must remain inside the publication row');
  assert(!qa.overflow, 'The mobile example must not overflow');
  assert.equal(await page.locator('.kit-shell__mobile-header').innerHTML(), sourceHeader, 'Native header markup must be intact');
  const screenshot = 'data:image/png;base64,' + fs.readFileSync(path.join(out, 'mi-garaje-mobile-example.png')).toString('base64');
  const publishedImage = 'data:image/png;base64,' + fs.readFileSync(path.join(out, 'badge-publicada-real.png')).toString('base64');
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Ejemplo móvil de Mi Garaje dentro de iPhone</title><style>
    *{box-sizing:border-box}body{margin:0;background:white;font-family:Arial,sans-serif;color:#3b1782}#art{position:relative;width:500px;padding:18px 24px 20px;background:radial-gradient(ellipse at 50% 52%,#eee7ff 0%,#fff 68%)}.device{position:relative;margin:0 auto;width:354px;padding:9px;border-radius:50px;background:linear-gradient(100deg,#98959f,#e9e7ee 14%,#34323b 30%,#282630 70%,#aaa7b1);box-shadow:0 18px 32px #24005224,0 0 0 1px #76737e,inset 0 0 0 2px #d8d5dc}.bezel{padding:5px;border-radius:42px;background:#111116}.screen{position:relative;overflow:hidden;border-radius:36px;background:#f8f7fc}.statusbar{position:relative;height:42px;background:#f8f7fc;color:#17171c;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font-size:12px;font-weight:700}.island{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:92px;height:25px;border-radius:20px;background:#09090b}.status-icons{display:flex;align-items:center;gap:5px}.screen-image{display:block;width:100%;height:auto}.homebar{height:21px;background:#f8f7fc;display:flex;justify-content:center;align-items:center}.homebar:before{content:"";display:block;width:110px;height:4px;background:#101014;border-radius:4px}.power{position:absolute;right:-3px;top:162px;width:3px;height:64px;border-radius:0 3px 3px 0;background:#65616e}.volume{position:absolute;left:-3px;top:130px;width:3px;height:42px;border-radius:3px 0 0 3px;background:#65616e}.volume.two{top:181px}.next-state{position:absolute;right:4px;bottom:84px;z-index:2;display:flex;align-items:center;justify-content:center;flex-direction:column;width:225px;padding:13px 15px 2px;background:#fff;border:1px solid #d9c8f5;border-radius:30px;box-shadow:0 7px 22px #24005220}.next-state p{margin:0;font-size:14px;line-height:20px;font-weight:600;color:#3b1782;text-align:center}.next-state img{display:block;width:140px;height:auto;flex:none}.caption{text-align:center;font-size:11px;line-height:17px;color:#6b6878;margin:17px 10px 0}
    </style><div id="art"><div class="device"><i class="power"></i><i class="volume"></i><i class="volume two"></i><div class="bezel"><div class="screen"><div class="statusbar"><span>9:41</span><i class="island"></i><span class="status-icons"><svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><rect x="0" y="7" width="2" height="4" rx=".5"/><rect x="4" y="5" width="2" height="6" rx=".5"/><rect x="8" y="2" width="2" height="9" rx=".5"/><rect x="12" width="2" height="11" rx=".5"/></svg><svg width="21" height="11" viewBox="0 0 21 11"><rect x=".5" y=".5" width="18" height="10" rx="2.5" fill="none" stroke="currentColor"/><rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/><path d="M20 4v3" stroke="currentColor" stroke-width="2"/></svg></span></div><img class="screen-image" src="${screenshot}" alt="Ejemplo móvil de Mi Garaje con header VMC, campana y una publicación"><div class="homebar"></div></div></div></div><div class="next-state"><p>Siguiente estado,<br>si se aprueba:</p><img src="${publishedImage}" alt="PUBLICADA, badge original de Mi Garaje"></div><p class="caption">Ejemplo basado en la interfaz de VMC</p></div></html>`;
  fs.writeFileSync(path.join(out, 'mi-garaje-iphone.html'), html);
  const frame = await browser.newPage({ viewport: { width: 500, height: 1100 }, deviceScaleFactor: 2 });
  await frame.goto(pathToFileURL(path.join(out, 'mi-garaje-iphone.html')).href);
  const pointerQa = await frame.evaluate(({ badge }) => {
    const image = document.querySelector('.screen-image').getBoundingClientRect();
    const bubble = document.querySelector('.next-state').getBoundingClientRect();
    const device = document.querySelector('.device').getBoundingClientRect();
    const scale = image.width / 390;
    const badgeRight = image.x + badge.right * scale;
    const badgeCenterY = image.y + (badge.y + badge.height / 2) * scale;
    const targetX = badgeRight + 7, targetY = badgeCenterY;
    const laneX = Math.max(device.right + 20, targetX + 42);
    const startY = bubble.top + 1;
    const d = `M ${laneX} ${startY} L ${laneX} ${targetY + 24} Q ${laneX} ${targetY} ${laneX - 24} ${targetY} L ${targetX} ${targetY}`;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('review-pointer');
    svg.setAttribute('width', '500'); svg.setAttribute('height', String(document.querySelector('#art').offsetHeight));
    svg.setAttribute('aria-label', 'La nubecita señala el badge EN REVISIÓN');
    svg.style.cssText = 'position:absolute;left:0;top:0;z-index:1;pointer-events:none;overflow:visible';
    svg.innerHTML = `<path d="${d}" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#8460e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${targetX + 7} ${targetY - 5} L ${targetX} ${targetY} L ${targetX + 7} ${targetY + 5}" fill="none" stroke="#8460e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    document.querySelector('.next-state').before(svg);
    return { target:'EN REVISIÓN', targetX, targetY, badgeRight, badgeCenterY, gap:targetX-badgeRight, laneX };
  }, qa);
  assert.equal(pointerQa.gap, 7, 'Pointer must stop beside the review badge, without covering it');
  assert.equal(pointerQa.targetY, pointerQa.badgeCenterY, 'Pointer must align exactly with the review badge');
  fs.writeFileSync(path.join(out, 'mi-garaje-iphone.html'), await frame.content());
  const annotationQa = await frame.evaluate(({ header, row }) => {
    const image = document.querySelector('.screen-image').getBoundingClientRect();
    const bubble = document.querySelector('.next-state').getBoundingClientRect();
    const scale = image.width / 390;
    const overlaps = rect => {
      const x = image.x + rect.x * scale, y = image.y + rect.y * scale;
      return bubble.left < x + rect.width * scale && bubble.right > x && bubble.top < y + rect.height * scale && bubble.bottom > y;
    };
    return {
      overlapsHeader:overlaps(header), overlapsPublication:overlaps(row),
      upperLabelPresent:!!document.querySelector('.label'),
      caption:document.querySelector('.caption').textContent,
      bubbleText:document.querySelector('.next-state').innerText,
      bubble:{ x:bubble.x, y:bubble.y, width:bubble.width, height:bubble.height },
    };
  }, qa);
  assert(!annotationQa.overlapsHeader && !annotationQa.overlapsPublication, 'The illustrative bubble must not cover the header or the publication');
  assert(!annotationQa.upperLabelPresent, 'The upper example label was removed at user request');
  assert.equal(annotationQa.caption, 'Ejemplo basado en la interfaz de VMC');
  await frame.locator('#art').screenshot({ path: path.join(out, 'mi-garaje-iphone.png'), animations: 'disabled' });
  const files = ['mi-garaje-mobile-example.png','badge-publicada-real.png','mi-garaje-iphone.png'];
  fs.writeFileSync(path.join(out, 'mobile-capture.json'), JSON.stringify({ sourceUrl: url, sourceCommit: 'c880184333ba7bf6731cca006d0a06df8e8d0928', viewport: {width:390,height:760,deviceScaleFactor:2}, source: 'Illustrative composition adapted from the existing Mi Garaje demo, as requested by Julio. One native example publication. Not a literal production screenshot or real account.', hidden: ['Development controls #lab-dock/.lab-dock','Next.js development indicator'], modificationsToProductUi: 'DOM-only illustrative composition. Full native header intact. Account details and promotional rail hidden. Other activity sections collapsed, unrelated counters hidden, publication list limited to its native first example row, pagination removed. Row grid places original review badge at right and wraps the complete review sentence. Source repository unchanged.', bellLabel, sectionText: proof, nextState: { ...nextState, placement:'Floating illustrative speech bubble over the lower empty area, conditional label: Siguiente estado, si se aprueba. Captured original Mi Garaje badge; no overlap with header or current publication.' }, qa, annotationQa, pointerQa, limitations: 'The source has no publication-approval notification message. No such message has been manufactured. One publication remains under review; no approval is simulated.', files: files.map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex')})) },null,2));
  console.log(JSON.stringify({ output: path.join(out,'mi-garaje-iphone.png'), size: await frame.locator('#art').boundingBox(), bellLabel, sectionText: proof, annotationQa }));
  await browser.close();
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
