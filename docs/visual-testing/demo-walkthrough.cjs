'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const mode = process.argv.includes('--rehearse') ? 'rehearse' : 'record';
const dir = __dirname;
async function overlays(page) {
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    cursor.style.cssText = 'position:fixed;left:10px;top:10px;z-index:999999;pointer-events:none;filter:drop-shadow(1px 1px 2px #0008)';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', e => { cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'; });
    const bar=document.createElement('div');bar.id='demo-subtitle';
    bar.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:999998;text-align:center;padding:12px 24px;background:#000d;color:white;font:500 16px system-ui;pointer-events:none;opacity:0';
    document.body.appendChild(bar);
  });
}
(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1280,height:720},...(mode==='record'?{recordVideo:{dir:path.join(dir,'raw-video'),size:{width:1280,height:720}}}:{})});
  const page=await context.newPage();
  const problems=[];
  page.on('pageerror',e=>problems.push(e.message));
  page.on('response',r=>{if(r.status()>=400)problems.push(`${r.status()} ${r.url()}`)});
  const pause=ms=>page.waitForTimeout(mode==='record'?ms:100);
  const button=name=>page.getByRole('button',{name,exact:true});
  async function check(locator,label) {await locator.waitFor({state:'visible'});if(await locator.count()!==1)throw Error(`Ambiguous: ${label}`);console.log(`OK: ${label}`);}
  async function click(locator,label) {
    await check(locator,label);await locator.scrollIntoViewIfNeeded();
    const box=await locator.boundingBox();if(!box)throw Error(`No bounds: ${label}`);
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:15});await pause(400);
    await locator.click();
    await page.waitForFunction(()=>['Paused','Playing'].includes(document.querySelector('.status')?.textContent));
    await pause(2000);
  }
  async function caption(text) {console.log(text);await page.evaluate(t=>{const b=document.getElementById('demo-subtitle');b.textContent=t;b.style.opacity=t?'1':'0'},text);await pause(800);}
  async function scroll(y) {await page.evaluate(y=>window.scrollTo({top:y,behavior:'smooth'}),y);await page.waitForTimeout(1500);}
  async function time() {return parseFloat(await page.getByLabel('Simulation time').textContent());}
  try {
    await page.goto(process.env.QA_BASE_URL||'http://localhost:3100');
    await page.waitForFunction(()=>document.querySelector('.status')?.textContent==='Paused');
    await overlays(page);
    await caption('Step 1 - Explore the legacy synthetic demo');await pause(3000);
    for(const name of ['android_01','android_02','android_03']) {const box=await button(name).boundingBox();await page.mouse.move(box.x+40,box.y+15,{steps:15});await pause(600);}
    await caption('Step 2 - Play the scripted scenario');await click(button('Play'),'Play');
    await page.waitForFunction(()=>parseFloat(document.querySelector('.clock').textContent)>0);
    await pause(4500);await click(button('Pause'),'Pause');
    const before=await time();await page.waitForTimeout(1000);if(await time()!==before)throw Error('Pause did not freeze time');
    await caption('Step 3 - Advance one step, then change speed');
    await click(button('Step · 0.5 base s'),'Step');if(await time()<=before)throw Error('Step did not advance');
    await click(button('2×'),'2× speed');if(await button('2×').getAttribute('aria-pressed')!=='true')throw Error('Speed not selected');
    await click(button('Play'),'Play at 2×');await pause(3500);await click(button('Pause'),'Pause at 2×');
    await caption('Step 4 - Inspect an agent and its recorded events');
    const agent=page.locator('.device button').filter({hasText:/^agent_a ·/});await click(agent,'Agent A');
    await check(page.locator('aside'),'Inspector');
    fs.writeFileSync(path.join(dir,`demo-inspector-map-${mode}.json`),JSON.stringify(await page.locator('aside button').allTextContents(),null,2));
    await page.screenshot({path:path.join(dir,`demo-inspector-${mode}-1280x720.png`)});await pause(2500);
    await click(button('Close'),'Close inspector');
    await caption('Step 5 - Read the live event log');
    await scroll(await page.locator('.timeline').evaluate(e=>e.offsetTop));
    const event=page.locator('.timeline li button').first();await check(event,'Recorded event');await pause(3000);
    await click(event,'Select recorded event');await check(page.locator('aside'),'Event inspector');
    await scroll(await page.locator('aside').evaluate(e=>e.offsetTop));await pause(2000);await click(button('Close'),'Close event inspector');
    await scroll(0);await caption('Step 6 - Reset to the initial demo state');
    await click(button('Reset demo'),'Reset demo');if(await time()!==0)throw Error('Reset time not zero');
    await check(page.getByText('No events yet. Step or play to advance the demo.'),'Reset empty events');
    await caption('Legacy demo only - research engine is not connected');await pause(3000);await caption('');await pause(1500);
    await page.screenshot({path:path.join(dir,`demo-final-${mode}-1280x720.png`)});
    if(problems.length)throw Error(problems.join('\n'));
    fs.writeFileSync(path.join(dir,`demo-${mode}-result.json`),JSON.stringify({mode,passed:true,viewport:'1280x720',checks:['play advances','pause freezes','step advances','speed selected','agent inspector','event selection','reset time and events'],browserProblems:problems},null,2));
    console.log(`${mode.toUpperCase()} PASSED`);
  } finally {
    await context.close();
    if(mode==='record')await page.video().saveAs(path.join(dir,'swarmsync-walkthrough.webm'));
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
