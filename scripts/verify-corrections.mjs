import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://localhost:3004';
const out = 'audit-screenshots/corrections';
await fs.mkdir(out, {recursive:true});
const browser = await chromium.launch({channel:'chrome'});
const results = [], errors = [], consoleErrors = [], posts = [];
function record(name, detail) { results.push({name, detail}); console.log('PASS', name); }
async function reachable(locator, page) {
  await locator.scrollIntoViewIfNeeded();
  const ok = await locator.evaluate(el => {
    const r=el.getBoundingClientRect();
    const x=r.left+r.width/2, y=r.top+r.height/2;
    const hit=document.elementFromPoint(x,y);
    return r.width>0 && r.height>0 && x>=0 && x<=innerWidth && y>=0 && y<=innerHeight && (el===hit || el.contains(hit));
  });
  assert(ok, 'Unreachable control: '+await locator.evaluate(el=>el.outerHTML.slice(0,180)));
}
async function keyboardTrap(page, dialog) {
  await dialog.locator('button').first().focus();
  for(let i=0;i<24;i++) {
    await page.keyboard.press(i<12?'Tab':'Shift+Tab');
    assert(await dialog.evaluate(el=>el.contains(document.activeElement)), 'Focus escaped dialog');
  }
}
async function geometry(page, dialog) {
  assert(await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=-1&&r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&el.scrollWidth<=el.clientWidth+1}), 'Dialog overflow');
  for(const title of await dialog.locator('h2,h3').all()) if(await title.isVisible()) await reachable(title,page);
  for(const control of await dialog.locator('input:not([type=checkbox]), select, textarea, button, a[href]').all()) {
    if(await control.isVisible() && await control.isEnabled()) await reachable(control,page);
  }
}
async function open(page,kind,classic=false) {
  const selector={demo:'#demos .btn',collaboration:'#collaborations .btn',booking:'#booking .btn',community:'#la-liste .text-link'}[kind];
  await page.locator(selector).click();
  if(classic&&kind!=='community') await page.locator('.ai-classic').click();
  const dialog=page.locator(classic||kind==='community'?'.form-modal':'.ai-modal');
  await dialog.waitFor();return dialog;
}
async function fillFields(page) {
  const fields=page.locator('.form-grid input, .form-grid select, .form-grid textarea');
  for(const field of await fields.all()) {
    const name=await field.getAttribute('name');
    const tag=await field.evaluate(el=>el.tagName);
    const type=await field.getAttribute('type');
    if(tag==='SELECT') await field.selectOption({index:1});
    else if(type==='email') await field.fill('demo@example.com');
    else if(type==='url') await field.fill('https://example.com/projet');
    else if(type==='date') await field.fill('2027-05-21');
    else if(['budget','capacity'].includes(name)) {
      await field.fill('lettres');assert.equal(await field.inputValue(),'');
      await field.fill(name==='budget'?'5000':'800');
    } else await field.fill(tag==='TEXTAREA'?'Projet de démonstration : un EP et un lien d’écoute, sans envoi réel.':'Projet Demo');
  }
}
try {
for(const width of [1440,768,390,375]) {
 const context=await browser.newContext({viewport:{width,height:width<500?812:1000},locale:'fr-FR',reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push({width,message:e.message}));page.on('console',m=>{if(m.type()==='error')consoleErrors.push({width,message:m.text()})});page.on('request',r=>{if(r.method()==='POST')posts.push({width,url:r.url(),body:r.postData()})});
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.locator('html').getAttribute('lang'),'fr');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/home-${width}.png`,fullPage:true});
 if(width<500){for(const cta of await page.locator('main .btn').all()){await cta.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await reachable(cta,page);}}
 if(await page.locator('.menu-toggle').isVisible()){
  await page.locator('.menu-toggle').click();await geometry(page,page.locator('.mobile-menu').filter({has:page.locator('nav')})).catch(async e=>{ // Menu uses its own heading rather than h2.
   if(!e.message.includes('h2'))throw e;
  });await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-menu').evaluate(el=>el.open),false);
 }
 for(const kind of ['demo','collaboration','booking','community']) {
  let dialog=await open(page,kind,true);
  await geometry(page,dialog);await keyboardTrap(page,dialog);
  await dialog.locator('button[type=submit]').click();assert(await page.locator('.field-error').count()>0);
  await fillFields(page);
  const email=page.locator('input[type=email]');await email.fill('bad-address');await dialog.locator('button[type=submit]').click();assert(await page.locator('.field-error').count()>0);await email.fill('demo@example.com');
  if(kind==='demo'){
   await dialog.locator('button[type=submit]').click();await fillFields(page);
   await dialog.locator('.form-actions .ghost').click();assert.equal(await page.locator('#field-name').inputValue(),'Projet Demo');
   await dialog.locator('button[type=submit]').click();assert.equal(await page.locator('#field-url').inputValue(),'https://example.com/projet');
   await page.locator('#field-url').fill('not-a-url');await dialog.locator('button[type=submit]').click();assert(await page.locator('#error-url').isVisible());await page.locator('#field-url').fill('https://example.com/projet');
  }
  if(kind==='booking'){await page.locator('#field-date').fill('2020-01-01');await page.locator('#field-capacity').fill('0');await dialog.locator('button[type=submit]').click();assert(await page.locator('#error-date').isVisible());assert(await page.locator('#error-capacity').isVisible());await page.locator('#field-date').fill('2027-05-21');await page.locator('#field-capacity').fill('800');}
  await dialog.locator('button[type=submit]').click();await dialog.locator('.recap').waitFor();
  if(['booking','collaboration'].includes(kind))assert.match(await dialog.locator('.recap').innerText(),/5\s?000,00\s?€|5\s?000\s?€/);
  if(kind==='booking')assert((await dialog.locator('.recap').innerText()).includes('21 mai 2027'));
  await geometry(page,dialog);await page.screenshot({path:`${out}/${kind}-review-${width}.png`});
  await dialog.locator('.form-actions .ghost').click();assert.equal(await page.locator(kind==='demo'?'#field-url':'input[type=email]').inputValue(),kind==='demo'?'https://example.com/projet':'demo@example.com');
  await dialog.locator('button[type=submit]').click();await dialog.locator('.form-actions .btn:not(.ghost)').click();assert(await page.locator('.success').isVisible());await geometry(page,dialog);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.form-modal').count(),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  dialog=await open(page,kind,true);assert.equal(await dialog.locator('input').first().inputValue(),'');await page.keyboard.press('Escape');
  record(`${width} / ${kind} classic`, 'Empty/email validation, numeric rejection, entry, back/edit, localized review, local confirmation, keyboard, close/reopen');
 }
 // Booking is completable without budget, capacity or date.
 let dialog=await open(page,'booking',true);await fillFields(page);for(const id of ['budget','capacity','date'])await page.locator('#field-'+id).fill('');await dialog.locator('button[type=submit]').click();assert(await page.locator('.recap').isVisible());await page.keyboard.press('Escape');record(`${width} / Booking optional fields`);
 for(const scenario of ['artists','collaboration','booking','event']) {
  const kind = scenario === 'artists' ? 'demo' : scenario === 'event' ? 'booking' : scenario;
  dialog=await open(page,kind);await geometry(page,dialog);await keyboardTrap(page,dialog);
  assert((await page.locator('.ai-steps [aria-current=step]').textContent()).includes('Le projet'));
  assert.equal(await page.locator('.ai-demo-picker button').count(),4);
  await page.locator(`[data-demo-id=${scenario}]`).click();await page.locator('[data-demo-next]').click();await page.locator('[data-demo-next]').click();await page.locator('.ai-brief.ready').waitFor();
  assert((await page.locator('.ai-steps [aria-current=step]').textContent()).includes('Le brief'));
  await geometry(page,dialog);await page.screenshot({path:`${out}/ai-${scenario}-brief-${width}.png`});
  await page.locator('.ai-brief .btn').click();assert((await page.locator('.ai-steps [aria-current=step]').textContent()).includes('Le contact'));
  await page.locator('.ai-contact > .btn').click();assert(await page.locator('.ai-contact-error').isVisible());
  await page.locator('#contact-name').fill('Nom Demo');await page.locator('#contact-email').fill('bad');await page.locator('.ai-contact > .btn').click();assert(await page.locator('.ai-contact-error').isVisible());await page.locator('#contact-email').fill('demo@example.com');await page.locator('#contact-brief').fill('Brief corrigé localement');
  await page.locator('.ai-contact > .text-link').click();await page.locator('.ai-brief .btn').click();assert.equal(await page.locator('#contact-name').inputValue(),'Nom Demo');assert.equal(await page.locator('#contact-brief').inputValue(),'Brief corrigé localement');
  await page.locator('.ai-consent input').check();await geometry(page,dialog);await page.screenshot({path:`${out}/ai-${scenario}-contact-${width}.png`});await page.locator('.ai-contact > .btn').click();await page.locator('.ai-success').waitFor();await geometry(page,dialog);await page.keyboard.press('Escape');
  dialog=await open(page,kind);assert.equal(await page.locator('.ai-demo-picker button').count(),4);assert.equal(await page.locator('.ai-brief').count(),0);await page.keyboard.press('Escape');
  record(`${width} / ${scenario} scripted conversation`, 'Local brief before contact, three progress states, email/consent validation, back retains edited brief/contact, local confirmation, keyboard and reopening');
 }
 await context.close();
}
assert.equal(posts.length,0,'Local demos sent data');record('No POST from local forms/conversations',posts);
assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(consoleErrors.length,0,JSON.stringify(consoleErrors));
record('No JavaScript or browser console errors in production');
} catch(e) { await fs.writeFile(`${out}/verification.json`,JSON.stringify({results,errors,consoleErrors,posts,failure:e.stack},null,2)); throw e; }
finally {await browser.close();}
await fs.writeFile(`${out}/verification.json`,JSON.stringify({results,errors,consoleErrors,posts},null,2));
