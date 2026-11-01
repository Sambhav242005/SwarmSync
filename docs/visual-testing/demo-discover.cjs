const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:720}});
  await page.goto('http://localhost:3100');
  await page.getByRole('button',{name:'Play',exact:true}).waitFor();
  await page.waitForFunction(() => document.querySelector('.status')?.textContent === 'Paused');
  const map = await page.locator('input,select,textarea,button,[contenteditable]').evaluateAll(els => els.filter(e=>e.offsetParent!==null).map(e=>({tag:e.tagName,type:e.type,text:e.textContent,options:e.options?Array.from(e.options).map(o=>({value:o.value,text:o.text})):undefined})));
  fs.writeFileSync(__dirname+'/demo-field-map.json',JSON.stringify(map,null,2));
  console.log(JSON.stringify(map));
  await page.screenshot({path:__dirname+'/demo-discovery-1280x720.png'});
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
