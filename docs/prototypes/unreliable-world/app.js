import world,{config,onFrame} from './world.js';
import {mountWorld} from '@diorama/worlds';
import {defaults,randomPositions,regions,obstacles,MIN_AIRCRAFT_ALTITUDE} from './model.mjs';
const $=id=>document.getElementById(id);
let runtime,paused=true,lastReadout=-1,latest;
function renderReadout(state,force=false){
 latest=state;if(!force&&Math.floor(state.time*4)===lastReadout)return;lastReadout=Math.floor(state.time*4);
 $('clock').textContent=state.time.toFixed(1)+' s';
 const node=state.nodes[config.selected];$('node-state').textContent=node.offline?'Offline · scheduled outage':'Online';
 const inside=config.selected<4&&config.environment!=='open'&&obstacles.some(o=>Math.abs(node.p[0]-o.x)<=o.w/2&&Math.abs(node.p[2]-o.z)<=o.d/2&&node.p[1]>=0&&node.p[1]<=o.h);
 $('placement-warning').hidden=!inside;
 $('node-region').textContent='Region: '+(regions.find(r=>r.id===node.region)?.name||node.region);
 $('coordinates').textContent=`x ${node.p[0].toFixed(1)} · elevation ${node.p[1].toFixed(1)} · z ${node.p[2].toFixed(1)} world units`;
 $('link-list').replaceChildren(...state.links.filter(l=>l.i===config.selected||l.j===config.selected).map(l=>{
  const row=document.createElement('li'),name=document.createElement('span'),status=document.createElement('strong');
  name.textContent=state.nodes[l.i===config.selected?l.j:l.i].id+(l.crossRegion?' · cross-region':'');status.textContent=l.reason;status.className=l.available?'good':'limited';row.append(name,status);return row;
 }));
 $('summary').textContent=`${state.links.filter(l=>l.available).length} available links / 15 possible`;
 const crossing=state.links.filter(l=>l.crossRegion);$('cross-region').textContent=`${crossing.filter(l=>l.available).length} / ${crossing.length} cross-region links available`;
 $('region-list').replaceChildren(...regions.map(region=>{const el=document.createElement('span');el.textContent=region.name+' · '+state.nodes.filter(n=>n.region===region.id).length+' devices';return el;}));
 const target=Number($('route-target').value),route=state.routes[config.selected][target];
 $('route-status').textContent=target===config.selected?'Choose another device to inspect a path.':route.length?'Available path: '+route.map(i=>state.nodes[i].id).join(' → '):'No available path to '+state.nodes[target].id+'.';
}
onFrame(renderReadout);
function announce(text){$('status').textContent=text;}
function refresh(){if(runtime){lastReadout=-1;runtime.seek(runtime.stats().time);}}
function pause(){paused=true;runtime?.setPaused(true);$('play').textContent='Play';}
function syncInputs(){
 const i=config.selected;$('ground-edit').hidden=i>=4;$('rover-edit').hidden=i!==4;$('air-edit').hidden=i!==5;
 if(i<4)for(const [id,k]of[['x',0],['height',1],['z',2]])$(id).value=config.positions[i][k];
 $('range').value=config.range;$('altitude').value=config.altitude;$('rover-x').value=config.roverX;$('rover-z').value=config.roverZ;
 for(const id of ['x','height','z','altitude','rover-x','rover-z','range']){const el=$(id);$(id+'-value').textContent=el.value;el.setAttribute('aria-valuetext',el.value+' world units');}
 if(latest)renderReadout(latest,true);
}
$('altitude').min=MIN_AIRCRAFT_ALTITUDE;
runtime=mountWorld(world,{el:$('stage'),paused:true});
if(runtime){
 announce('Paused. Select a device to edit its position, or press Play.');
 $('play').onclick=()=>{if(runtime.stats().reduced){announce('Reduced motion is enabled. Use Step to inspect movement.');return;}paused=!paused;runtime.setPaused(paused);$('play').textContent=paused?'Play':'Pause';announce(paused?'Paused. Positions can be edited.':'Playing the synthetic 48-second scenario.');};
 $('step').onclick=()=>{pause();runtime.seek(runtime.stats().time+.5);announce('Advanced 0.5 simulation seconds.');};
 $('restart').onclick=()=>{pause();runtime.seek(0);announce('Returned to time zero; your placement is preserved.');};
 $('speed').onchange=e=>{runtime.setSpeed(Number(e.target.value));announce('Playback speed '+e.target.selectedOptions[0].textContent);};
 $('route-target').onchange=()=>{if(latest)renderReadout(latest,true);};
 $('node').onchange=e=>{config.selected=Number(e.target.value);syncInputs();refresh();};
 for(const [id,k]of[['x',0],['height',1],['z',2]])$(id).oninput=e=>{pause();config.positions[config.selected][k]=Number(e.target.value);syncInputs();refresh();announce('Placement updated. Press Play to compare connections.');};
 for(const [id,key]of[['altitude','altitude'],['rover-x','roverX'],['rover-z','roverZ'],['range','range']])$(id).oninput=e=>{pause();config[key]=Number(e.target.value);syncInputs();refresh();announce('Scenario updated; playback paused.');};
 $('outages').onchange=e=>{config.outages=e.target.checked;refresh();};
 $('environment').onchange=e=>{pause();config.environment=e.target.value;refresh();announce('Environment updated. Device positions are preserved.');};
 $('finish').onchange=e=>runtime.setFinish(e.target.value);
 $('shuffle').onclick=()=>{if(!$('seed').reportValidity())return;pause();config.seed=Number($('seed').value);config.positions=randomPositions(config.seed,config.environment);runtime.seek(0);syncInputs();announce('Applied layout seed '+config.seed+'. Apply the same seed to reproduce it.');};
 $('next-seed').onclick=()=>{const current=Number($('seed').value);$('seed').value=Number.isFinite(current)?(Math.trunc(current)+1)%1000000:42;$('shuffle').click();};
 $('restore').onclick=()=>{pause();Object.assign(config,defaults());$('seed').value=config.seed;$('node').value=0;$('route-target').value=3;$('environment').value=config.environment;$('outages').checked=config.outages;$('speed').value=1;$('finish').value='miniature';runtime.setFinish('miniature');runtime.setSpeed(1);runtime.seek(0);syncInputs();announce('Restored the initial world, placement and playback speed.');};
 addEventListener('pagehide',e=>{if(!e.persisted)runtime.dispose();});
 if(new URLSearchParams(location.search).has('inspect'))window.__prototype={runtime,config,get state(){return latest}};
 syncInputs();
}else{document.querySelectorAll('button,input,select').forEach(e=>e.disabled=true);announce('WebGL 2 is unavailable. Open this file in a browser with hardware acceleration to use the world.');}
