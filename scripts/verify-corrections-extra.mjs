import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3004';
const out='audit-screenshots/corrections';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[],consoleErrors=[],posts=[];
function pass(name,detail){results.push({name,detail});console.log('PASS',name)}
async function scenario(page,id='event'){
 await page.locator(`[data-demo-id=${id}]`).click();await page.locator('[data-demo-next]').click();await page.locator('[data-demo-next]').click();
}
try{
 const context=await browser.newContext({viewport:{width:375,height:667},locale:'fr-FR',reducedMotion:'no-preference'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});
 await page.addInitScript(()=>{window.__audioPlays=0;window.__audioPauses=0;HTMLMediaElement.prototype.play=function(){window.__audioPlays++;window.__audioElement=this;return Promise.resolve()};HTMLMediaElement.prototype.pause=function(){window.__audioPauses++}});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#booking').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__audioPlays>0);
 const stop=page.locator('.voice-card .voice-stop');await stop.waitFor();assert.equal(await stop.locator('svg.lucide-square').count(),1);await page.evaluate(()=>window.__audioElement.currentTime=3.25);const pausedAt=await page.evaluate(()=>window.__audioElement.currentTime);await stop.click();assert.equal(await stop.locator('svg.lucide-play').count(),1);
 const plays=await page.evaluate(()=>window.__audioPlays);assert((await page.evaluate(()=>window.__audioPauses))>0);
 await page.locator('#accueil').scrollIntoViewIfNeeded();await page.locator('#booking').scrollIntoViewIfNeeded();await page.locator('.booking-visual').hover();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__audioPlays),plays);
 assert.equal(await page.evaluate(()=>window.__audioElement.currentTime),pausedAt);await stop.click();assert.equal(await stop.locator('svg.lucide-square').count(),1);assert.equal(await page.evaluate(()=>window.__audioElement.currentTime),pausedAt);await stop.click();
 pass('Automatic audio, Stop/Play inside the card, resume from the paused time','Instrumented play/pause: playback attempted on entry with no audio-button click; no acoustic listening claim.');
 for(const width of [1440,768,390,375]){
  await page.setViewportSize({width,height:600});
  const trigger=page.locator('#booking .btn');await trigger.click();await page.locator('.ai-modal').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  assert.equal(await page.locator('.ai-demo-picker button').count(),4);assert.equal(await page.locator('#ai-input').count(),0);await scenario(page);
  assert((await page.locator('.ai-brief').innerText()).includes('soirée privée'));await page.locator('.ai-brief .btn').click();
  for(const sel of ['.ai-contact-heading h3','#contact-name','#contact-email','#contact-brief','.ai-contact > .btn','.ai-topbar .icon-button:last-child']){
   const el=page.locator(sel);await el.scrollIntoViewIfNeeded();assert(await el.evaluate(e=>{const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e===hit||e.contains(hit)}),sel+' unreachable at '+width);
  }
  await page.locator('#contact-name').fill('À effacer');await page.locator('.ai-reset').click();assert.equal(await page.locator('.ai-demo-picker button').count(),4);assert.equal(await page.locator('.ai-brief').count(),0);
  await scenario(page,'collaboration');await page.locator('.ai-brief .btn').click();assert.equal(await page.locator('#contact-name').inputValue(),'');await page.locator('.ai-reset').click();
  await page.screenshot({path:`${out}/demo-picker-${width}.png`});await page.keyboard.press('Escape');await page.waitForFunction(()=>document.body.style.overflow==='');assert(await trigger.evaluate(e=>e===document.activeElement));
 }
 pass('Four demos and Clean at all widths, 600px height, reachable contact controls, cleared data and restored focus');
 await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.body.style.overflow==='');
 await page.locator('.menu-toggle').click();await page.locator('.mobile-menu > .btn').click();assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.body.style.overflow==='');pass('Mobile menu -> assistant -> close restores page scroll');
 await page.locator('.ai-launcher').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.classList.contains('ai-launcher'));pass('Launcher restores focus');
 for(const button of await page.locator('.path-card button, .footer-columns button').all()){await button.click();assert(await page.locator('.ai-modal[open],.form-modal[open]').isVisible());await page.keyboard.press('Escape');}
 await page.locator('.path-card a').click();assert.equal(new URL(page.url()).hash,'#musique');
 for(const link of await page.locator('.hero .button-row a').all()){await link.click();assert(['#musique','#parcours'].includes(new URL(page.url()).hash));}
 pass('Four entry cards, footer entrances, hero music/project anchors');
 await page.evaluate(()=>localStorage.setItem('tracto-lang','it'));await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.lang==='it');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('lang'),'it');pass('Italian preference survives reload');
 for(const reducedMotion of ['reduce','no-preference']){await page.emulateMedia({reducedMotion});await page.reload({waitUntil:'networkidle'});await page.locator('#demos .btn').click();assert.equal(await page.locator('.ai-demo-picker button').count(),4);await page.keyboard.press('Escape');}
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(posts,[]);pass('No JavaScript/console errors or POST, with both motion preferences');
 const removed=await context.request.get(base+'/api/assistant');assert.equal(removed.status(),404);pass('Former AI endpoint removed (404)');
 assert(await page.evaluate(()=>sessionStorage.length===0&&Object.keys(localStorage).every(k=>k==='tracto-lang')));pass('No chat/contact browser persistence');
}catch(e){await fs.writeFile(`${out}/extra-verification.json`,JSON.stringify({results,errors,consoleErrors,posts,failure:e.stack},null,2));throw e}
finally{await browser.close()}
await fs.writeFile(`${out}/extra-verification.json`,JSON.stringify({results,errors,consoleErrors,posts},null,2));
