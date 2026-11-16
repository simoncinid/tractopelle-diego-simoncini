import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3004';
const out='audit-screenshots/corrections';
// Explicitly allow autoplay so the actual media element, not a stub, can be tested.
const browser=await chromium.launch({channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const NativeAudio=window.Audio;window.Audio=function(...args){const audio=new NativeAudio(...args);window.__realAudio=audio;return audio};window.Audio.prototype=NativeAudio.prototype});
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('#booking').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>window.__realAudio&&!window.__realAudio.paused&&window.__realAudio.currentTime>.4);
 const src=await page.evaluate(()=>window.__realAudio.src);
 await page.locator('.voice-stop').click();
 const pausedAt=await page.evaluate(()=>window.__realAudio.currentTime);assert(pausedAt>0);
 assert(await page.evaluate(()=>window.__realAudio.paused));assert.equal(await page.locator('.voice-stop svg.lucide-play').count(),1);
 await page.waitForTimeout(650);assert(Math.abs((await page.evaluate(()=>window.__realAudio.currentTime))-pausedAt)<.1);
 await page.screenshot({path:`${out}/audio-paused-mobile.png`});await page.locator('.voice-stop').click();
 await page.waitForFunction(at=>!window.__realAudio.paused&&window.__realAudio.currentTime>at+.2,pausedAt);
 assert.equal(await page.evaluate(()=>window.__realAudio.src),src);assert.equal(await page.locator('.voice-stop svg.lucide-square').count(),1);
 await page.screenshot({path:`${out}/audio-playing-mobile.png`});await page.locator('.voice-stop').click();
 const saved=await page.evaluate(()=>window.__realAudio.currentTime);await page.locator('#accueil').scrollIntoViewIfNeeded();await page.locator('#booking').scrollIntoViewIfNeeded();await page.waitForTimeout(300);assert(await page.evaluate(()=>window.__realAudio.paused));assert.equal(await page.evaluate(()=>window.__realAudio.currentTime),saved);
 assert.deepEqual(errors,[]);const report={actualMediaPlayback:true,autoplayPolicy:'explicitly permitted by browser launch flag',pausedAt,resumedSameTrack:true,noAutomaticRestartAfterStop:true,errors};await fs.writeFile(`${out}/audio-verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}
