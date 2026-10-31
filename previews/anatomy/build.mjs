import {writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as k from 'file:///C:/Users/NPC/.agents/skills/anatomy/kit/iso-kit.mjs';
import * as A from 'file:///C:/Users/NPC/.agents/skills/anatomy/kit/audit.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const base={x:-145,y:-95,w:290,d:190,r:9};
const P=k.fitProjection(k.boxCorners(base,-14,58),900,610,{pad:45,azimuth:42,elevation:38});
const R=A.recorder(P); let count=0;
function slab(name,x,y,w,d,z,h,tone='mid',extra=''){
 const plan={x,y,w,d,r:Math.min(2,w/5,d/5)};
 const paths=k.slabOf(plan,z,h,P,8,.5);
 R.put({name,piece:'device',at:[x+w/2,y+d/2,z+h/2],svg:k.solidSvg(paths,{tone})+extra,shapes:[R.solid(A.slab(plan,z,h,{name,ground:name.startsWith('foot')}))]});count++;
}
function cyl(name,x,y,r,z,h,tone='mid',extra=''){
 R.put({name,piece:'device',at:[x,y,z+h/2],svg:k.solidSvg(k.cylinder(x,y,r,z,h,P,64,.4),{tone})+extra,shapes:[R.solid(A.cylinder(x,y,r,z,h,{name}))]});count++;
}
const line=(d,tone='lo',free=false)=>k.lineSvg(d,{tone,free});
for(const [x,y] of [[-133,-83],[119,-83],[-133,69],[119,69]])slab('foot'+count,x,y,14,14,-14,8,'lo');
slab('chassis',-145,-95,290,190,-6,6,'lo');
slab('rear-rail',-140,-90,280,5,0,12);
slab('left-rail',-140,-84,5,170,0,8);
slab('right-rail',135,-84,5,170,0,8);
for(const [x,y] of [[-130,-80],[124,-80],[-130,77],[124,77]])slab('fastener'+count,x,y,5,5,0,2,'hi');
slab('circuit-board',-124,-72,248,143,0,2,'lo');
// Rear sensor: supported rectangular shield with a slotted face.
slab('sensor-pedestal',-114,-61,55,48,2,5);
slab('sensor-housing',-111,-58,49,42,7,19,'hi');
for(let i=0;i<6;i++)slab('sensor-grille'+i,-106+i*7,-52,3,30,26,2,'lo');
// Processor and open heatsink fins.
slab('processor-socket',-43,-62,62,54,2,3);
slab('processor',-39,-58,54,46,5,7,'hi');
for(let i=0;i<9;i++)slab('heatsink-fin'+i,-36+i*5.5,-55,2,40,12,15,'mid');
// Memory bank and exposed contacts.
slab('memory-socket',35,-62,76,54,2,3,'mid');
for(let i=0;i<4;i++){
 slab('memory-bank'+i,39+i*18,-52,12,29,5,5,'hi');
 for(const y of [-58,-21])slab('memory-contact'+i+y,41+i*18,y,8,4,5,1,'lo');
}
// Receiver strip and bridge; indicator inlays share their host surface.
slab('receiver-tray',-115,3,126,38,2,4,'mid');
for(let i=0;i<8;i++){
 const plan={x:-110+i*15,y:9,w:10,d:25,r:1};
 slab('indicator'+i,plan.x,plan.y,plan.w,plan.d,6,1,'lo',`<path id="cell-${i}" d="${k.planOutline(k.insetPlan(plan,1),7,P)}" fill="none" stroke="currentColor" stroke-width="1.7" opacity="0.1"/>`);
}
slab('gate-back',-17,1,5,6,6,24);
slab('gate-front',-17,35,5,6,6,24);
slab('gate-bridge',-17,1,5,40,30,4,'hi');
slab('output-tray',25,8,34,33,2,5);
for(let i=0;i<4;i++)slab('output-cell'+i,29+i*7,13,4,23,7,3,'hi');
// Deadline gauge.
slab('gauge-mount',78,9,37,37,2,5);
cyl('gauge-bezel',96.5,27.5,18,7,5,'hi');
const ticks=k.radialTicks(96.5,27.5,14,30,5,12.5,[1.2,2.5],P);
cyl('gauge-face',96.5,27.5,15.5,12,.5,'lo',line(k.ring(96.5,27.5,14,12.5,P))+line(ticks.minor)+line(ticks.major,'hi')+`<path id="needle" class="iso-line" data-tone="lit" data-free="end" d="${k.lineOnTop([96.5,27.5],[96.5,15.5],12.6,P)}"/>`);
cyl('gauge-hub',96.5,27.5,1.3,12.5,.6,'hi');
for(let i=0;i<3;i++){
 slab('port'+i,-104+i*49,55,33,13,2,7,'mid');
 for(let j=0;j<2;j++)slab('port-contact'+i+j,-98+i*49+j*12,58,7,7,9,1,'lo');
}
A.settle(R,P); R.items.sort((a,b)=>a.key-b.key); A.auditOrExit(R,P);
const svg=k.figureSvg({width:900,height:610,label:'Opened field device. Sensor, processor fins and local memory sit behind a receiver strip, validation gate and deadline gauge.',body:[`<path class="iso-halo" d="${k.haloOf(base,-14,8,P)}"/>`,...R.items.map(i=>i.svg)]});
const css=`
.figure.iso-plate{padding:0;box-shadow:none}.art .iso-svg{max-width:none}.shell{width:100%}
*{box-sizing:border-box}body{margin:0;background:#111513;color:#e8e9df;font-family:Arial,sans-serif}body[data-theme=light]{background:#efeee7;color:#252b28}button,input{font:inherit}button{cursor:pointer;color:inherit;background:transparent;border:1px solid #636c6155;border-radius:6px;padding:11px 14px;min-height:42px}button:hover,button[aria-pressed=true]{background:#818d7028;border-color:#a9b69b}button:focus-visible,input:focus-visible{outline:2px solid #a9b69b;outline-offset:4px}.shell{max-width:1420px;margin:auto;padding:34px 45px}.top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #818d7033;padding-bottom:22px}.brand{font-size:18px;font-weight:700;letter-spacing:-.6px}.brand span{font-weight:400;color:#a5ad9e;margin-left:10px;font-size:12px;letter-spacing:1px}.badge,.eyebrow{font:10px monospace;letter-spacing:1.8px;text-transform:uppercase;color:#a5ad9e}.intro{display:flex;justify-content:space-between;align-items:end;margin:32px 0 25px;gap:20px}h1{font-size:36px;letter-spacing:-1.5px;margin:10px 0 0;font-weight:500}.intro p{max-width:340px;font-size:13px;line-height:1.7;color:#a5ad9e;margin:0}.workspace{display:grid;grid-template-columns:minmax(0,1fr) 300px;border:1px solid #818d7044;border-radius:12px;overflow:hidden}.figure{min-width:0;background:#171c18}body[data-theme=light] .figure{background:#e7e8dd}.cardhead,.cardfoot{display:flex;justify-content:space-between;gap:15px;padding:20px 24px;font:11px monospace;color:#b7bfae}.cardhead{border-bottom:1px solid #818d7022}.cardhead strong{font-weight:400;color:inherit}.art{padding:0 12px}.art svg{display:block;width:100%;height:auto}.cardfoot{border-top:1px solid #818d7022;line-height:1.6}.panel{border-left:1px solid #818d7044;padding:26px 24px}.panel h2{font-size:22px;font-weight:400;margin:10px 0 8px}.muted{font-size:12px;color:#a5ad9e;line-height:1.7}.divider{border-top:1px solid #818d7033;margin:23px 0}.phase{display:flex;gap:12px;margin:19px 0;align-items:center;opacity:.4}.phase.active{opacity:1}.number{font:11px monospace;width:25px;height:25px;display:grid;place-items:center;border:1px solid #818d7066;border-radius:50%}.phase b{font-size:12px;font-weight:500}.phase small{display:block;font-size:10px;color:#a5ad9e;margin-top:4px}.outcome{border-left:2px solid #a5b895;padding-left:13px}.outcome b{font-size:13px;font-weight:500}.outcome p{font-size:12px;line-height:1.6;color:#a5ad9e}.controls{padding:22px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.controls .spacer{flex:1}.timeline{display:flex;gap:15px;align-items:center;font:11px monospace}input[type=range]{flex:1;accent-color:#a5b895;min-width:0}.legend{display:grid;grid-template-columns:repeat(3,1fr);gap:25px;margin:30px 0}.legend h3{font-size:12px;font-weight:500}.legend p{font-size:12px;line-height:1.6;color:#a5ad9e}.footer{border-top:1px solid #818d7033;padding-top:18px;font:10px monospace;color:#a5ad9e;line-height:1.7}.iso{--anatomy-bg:#171c18;--anatomy-ink:#e4e9dc}body[data-theme=light] .muted,body[data-theme=light] .intro p,body[data-theme=light] .legend p,body[data-theme=light] .outcome p,body[data-theme=light] .phase small,body[data-theme=light] .eyebrow,body[data-theme=light] .badge,body[data-theme=light] .footer,body[data-theme=light] .cardhead,body[data-theme=light] .cardfoot{color:#52604e}@media(max-width:800px){.shell{padding:20px}.workspace{grid-template-columns:1fr}.panel{border-left:0;border-top:1px solid #818d7044}.intro{display:block}.intro p{margin-top:16px}h1{font-size:29px}.legend{grid-template-columns:1fr;gap:5px}.brand span{display:none}.cardhead,.cardfoot{padding:15px}.controls .spacer{display:none}.badge{font-size:9px}.art{padding:0}}
`;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SwarmSync — Device anatomy preview</title><style>${k.ISO_CSS}\n${css}</style></head><body class="iso" data-theme="dark"><main class="shell"><header class="top"><div class="brand">SwarmSync <span>RESEARCH INSTRUMENTS</span></div><button id="theme" aria-label="Switch light and dark theme">Light mode</button></header><section class="intro"><div><div class="eyebrow">Concept preview / Device inspector</div><h1>Inside a field device.</h1></div><p>Follow one report from arrival to local retention. Every boundary has a purpose. Every claim keeps its provenance.</p></section><div class="workspace"><section class="figure iso-plate"><div class="cardhead"><span>FIG. 01 / CUTAWAY</span><strong>NODE 03 · RECEIVER ASSEMBLY</strong></div><div class="art">${svg}</div><div class="cardfoot"><span>Sensor · processor · private memory<br>Receiver strip · validation gate · deadline dial</span><span data-readout>0.00 s / 3.00 s deadline</span></div></section><aside class="panel"><div class="eyebrow">Illustrative fixture</div><h2>A report arrives.</h2><p class="muted">Observation obs-017<br>Origin node-02 · zone A<br>Claim: possible presence</p><div class="divider"></div><div class="phase" data-phase="0"><span class="number">01</span><div><b>Receive</b><small>Keep the original source</small></div></div><div class="phase" data-phase="1"><span class="number">02</span><div><b>Check format</b><small>Accept bounded fields only</small></div></div><div class="phase" data-phase="2"><span class="number">03</span><div><b>Check duplication</b><small>One origin is one source</small></div></div><div class="phase" data-phase="3"><span class="number">04</span><div><b>Retain observation</b><small>Await independent evidence</small></div></div><div class="divider"></div><div class="outcome" role="status" aria-live="polite"><b id="result">Awaiting checks</b><p id="explanation">An arriving report is not yet validated.</p></div></aside></div><div class="controls" role="group" aria-label="Choose illustrative report"><button data-mode="normal" aria-pressed="true">Normal report</button><button data-mode="duplicate" aria-pressed="false">Duplicate</button><button data-mode="invalid" aria-pressed="false">Invalid message</button><span class="spacer"></span><button id="play">Pause</button><button id="replay">Replay</button></div><div class="timeline"><span id="time">0.00 s</span><input id="scrub" type="range" min="0" max="3" step="0.01" value="0" aria-label="Fixture time in seconds"><span>3.00 s</span></div><section class="legend"><div><h3>01 / Local knowledge</h3><p>Each device keeps its own observations. A remote report becomes available only after receipt.</p></div><div><h3>02 / Bounded reception</h3><p>The gate illustrates format and duplicate checks. A well-formed report can still be false.</p></div><div><h3>03 / Separate evaluation</h3><p>Research ground truth belongs to the evaluator. Agents do not get a hidden answer key.</p></div></section><footer class="footer">DESIGN PREVIEW · Synthetic timing fixture, not connected to the simulation engine.<br>Compartments illustrate logical boundaries; they do not demonstrate malware containment or real Wi-Fi sensing.</footer></main><script>
const P=${JSON.stringify(P)}; const needlePoints=${JSON.stringify(Array.from({length:301},(_,i)=>{const a=i/300*Math.PI*1.7;return k.lineOnTop([96.5,27.5],[96.5+Math.sin(a)*12,27.5-Math.cos(a)*12],12.6,P)}))};
const q=s=>document.querySelector(s), motion=matchMedia('(prefers-reduced-motion: reduce)');let time=0,mode='normal',playing=!motion.matches,last=0,visible=true,frame=0,hold=0;
function model(t,m){const end=m==='invalid'?.8:m==='duplicate'?1.6:2.4;const stage=Math.min(3,Math.floor((t+.00001)/.8));if(t<end)return {stage,title:'Checking report',text:'The message remains provisional while receiver checks run.'};if(m==='invalid')return {stage:1,title:'Rejected · invalid format',text:'No observation retained. This fixture violates the allowed message structure.'};if(m==='duplicate')return {stage:2,title:'Duplicate · not counted again',text:'The same origin and observation ID already exist. Repetition is not corroboration.'};return {stage:3,title:'Retained · truth unverified',text:'Format and duplicate checks passed at 2.40 s. Independent evidence is still required.'};}
function draw(){const s=model(time,mode);document.querySelectorAll('[data-phase]').forEach(e=>e.classList.toggle('active',Number(e.dataset.phase)<=s.stage));for(let i=0;i<8;i++)q('#cell-'+i).setAttribute('opacity',i<=s.stage*2?1:.12);q('#needle').setAttribute('d',needlePoints[Math.round(time*100)]);q('[data-readout]').textContent=time.toFixed(2)+' s / 3.00 s deadline';q('#time').textContent=time.toFixed(2)+' s';q('#scrub').value=time;if(q('#result').textContent!==s.title){q('#result').textContent=s.title;q('#explanation').textContent=s.text;}q('#play').textContent=playing?'Pause':'Play';document.body.dataset.fixture=mode;document.body.dataset.phase=s.stage;}
function tick(now){frame=0;if(!visible||document.hidden||!playing)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(time<3)time=Math.min(3,time+dt*.6);else{hold+=dt;if(hold>2){time=0;hold=0;}}draw();frame=requestAnimationFrame(tick);}
function run(){if(!frame&&playing&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
q('#play').onclick=()=>{playing=!playing;if(motion.matches&&playing){time=Math.min(3,time+.8);playing=false;}draw();run();};q('#replay').onclick=()=>{time=0;hold=0;playing=!motion.matches;draw();run();};q('#scrub').oninput=e=>{playing=false;time=Number(e.target.value);draw();};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;time=motion.matches?3:0;hold=0;playing=!motion.matches;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();run();});q('#theme').onclick=()=>{const light=document.body.dataset.theme!=='light';document.body.dataset.theme=light?'light':'dark';q('#theme').textContent=light?'Dark mode':'Light mode';};new IntersectionObserver(es=>{visible=es.at(-1).isIntersecting;run();}).observe(q('.workspace'));document.addEventListener('visibilitychange',run);motion.addEventListener('change',()=>{playing=false;draw();});draw();run();
</script></body></html>`;
writeFileSync(join(dir,'index.html'),html);
writeFileSync(join(dir,'light.html'),html.replace('data-theme="dark"','data-theme="light"').replace('>Light mode</button>','>Dark mode</button>'));
console.log('Built',count,'parts');
