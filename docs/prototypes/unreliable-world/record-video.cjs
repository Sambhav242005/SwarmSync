const {chromium}=require('playwright');
const fs=require('fs');const path=require('path');const assert=require('node:assert/strict');
const mode=process.argv.includes('--discover')?'discover':process.argv.includes('--rehearse')?'rehearse':'record';
const out=path.resolve(__dirname,'../../visual-testing/connected-world-video');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:720},...(mode==='record'?{recordVideo:{dir:path.join(out,'raw'),size:{width:1280,height:720}}}:{})});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let passed=false;
 const wait=ms=>page.waitForTimeout(mode==='record'?ms:Math.min(ms,500));
 async function caption(text){console.log(text);await page.evaluate(text=>{const e=document.getElementById('demo-caption');e.textContent=text;e.style.opacity=text?'1':'0'},text);await wait(800);}
 async function move(selector){const e=page.locator(selector);await e.waitFor({state:'visible'});assert.equal(await e.count(),1);await e.scrollIntoViewIfNeeded();const b=await e.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:16});await wait(300);return e;}
 async function click(selector){await(await move(selector)).click();console.log('OK click',selector);await wait(900);}
 async function select(selector,value){await(await move(selector)).selectOption(value);console.log('OK select',selector,value);await wait(600);}
 async function frame(){await page.evaluate(()=>window.scrollTo({top:document.getElementById('stage').offsetTop+55,behavior:'smooth'}));await page.waitForTimeout(650);assert(await page.locator('.controls').evaluate(e=>e.getBoundingClientRect().bottom<innerHeight-48),'Caption overlaps playback controls');}
 try{
  await page.goto('file:///'+path.join(__dirname,'swarmsync-world.html').replaceAll('\\','/')+'?inspect');
  await page.waitForFunction(()=>window.__prototype?.runtime.stats().frames>0);
  if(mode==='discover'){
   const fields=await page.locator('button,input,select').evaluateAll(es=>es.map(e=>({tag:e.tagName,id:e.id,type:e.type,text:e.textContent,options:e.options?Array.from(e.options).map(o=>({value:o.value,text:o.text})):undefined})));
   fs.writeFileSync(path.join(out,'field-map.json'),JSON.stringify(fields,null,2));await page.screenshot({path:path.join(out,'discovery.png'),fullPage:true});console.log('DISCOVERY PASSED');return;
  }
  await page.evaluate(()=>{
   const c=document.createElement('div');c.innerHTML='<svg width="24" height="24"><path d="M5 3L19 12L12 13L9 20Z" fill="white" stroke="#132e31" stroke-width="1.5"/></svg>';c.style.cssText='position:fixed;left:10px;top:10px;z-index:999999;pointer-events:none';document.body.appendChild(c);document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'});
   const bar=document.createElement('div');bar.id='demo-caption';bar.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#142e32ed;color:white;padding:12px 22px;text-align:center;font:500 16px system-ui;z-index:999998;pointer-events:none';document.body.appendChild(bar);
  });
  await caption('Step 1 - Three regions share one network');await wait(2300);
  await select('#node','5');await frame();
  await caption('Step 2 - Aircraft and rover move at normal speed');await click('#play');await frame();
  const before=await page.evaluate(()=>window.__prototype.runtime.stats().time);await wait(8500);const after=await page.evaluate(()=>window.__prototype.runtime.stats().time);assert(after>before);
  await caption('Step 3 - Slow motion at 0.25×');await select('#speed','0.25');await frame();await wait(6500);
  assert.equal(await page.evaluate(()=>window.__prototype.runtime.stats().speed),.25);
  await caption('Step 4 - Fast playback at 3×');await select('#speed','3');await frame();await wait(6500);
  await click('#play');assert.equal(await page.evaluate(()=>window.__prototype.runtime.stats().paused),true);
  await caption('Step 5 - Change altitude and inspect the links');
  const altitude=await move('#altitude');await altitude.focus();await altitude.press('Home');for(let i=0;i<11;i++){await altitude.press('ArrowRight');await page.waitForTimeout(mode==='record'?85:5);}
  assert(Math.abs(await page.evaluate(()=>window.__prototype.config.altitude)-6.9)<.01);await frame();await wait(2500);
  await select('#speed','1');await click('#play');await frame();await wait(4000);await click('#play');
  await caption('Step 6 - Try a different seeded ground layout');
  const original=await page.evaluate(()=>JSON.stringify(window.__prototype.config.positions));await click('#next-seed');assert.notEqual(await page.evaluate(()=>JSON.stringify(window.__prototype.config.positions)),original);
  await frame();await wait(2000);await click('#play');await frame();await wait(6000);await click('#play');
  await caption('Synthetic link availability - not packet delivery');await frame();await wait(3000);
  await page.screenshot({path:path.join(out,mode+'-final.png')});assert.deepEqual(errors,[]);passed=true;
  fs.writeFileSync(path.join(out,mode+'-result.json'),JSON.stringify({passed,mode,viewport:'1280x720',errors,checks:['normal time advances','slow mode selected','fast mode selected','pause','altitude edited','random layout changes','play after layout']},null,2));console.log(mode.toUpperCase()+' PASSED');
 }finally{await context.close();if(mode==='record'&&passed)await page.video().saveAs(path.join(out,'swarmsync-connected-world.webm'));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
