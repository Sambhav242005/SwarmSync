import {defineWorld} from '@diorama/worlds';
import {defaults,stateAt,obstacles,PERIOD} from './model.mjs';
export const config=defaults();
export let observe=()=>{};
export function onFrame(callback){observe=callback;}

// Small decorative props are excluded from synthetic blockage.
// One connected cutout: a damaged settlement, a pass and an airfield.
// Dominant building and ridge masses use the synthetic obstruction boxes.
export default defineWorld({
 name:'unreliable-world',title:'Three places, one connected world',duration:PERIOD,still:0,
 description:'A synthetic settlement, mountain pass and airfield share a road. A rover crosses between regions and an aircraft circles overhead. Link colors come from the synthetic network model.',
 bounds:[[-18.5,-.18,-8.5],[18.5,8.3,8.5]],
 build(W){
  W.terrain(36,16,'#a5aa85',42);W.grass(36,16,620,7);
  W.surface(11.3,13.5,'#b2ad91',-12,.022,0,14,.12);
  W.surface(10.5,14,'#aaa98d',0,.024,0,31,.14);
  W.surface(11.3,13.5,'#a4ad8d',12,.026,0,19,.1);
  W.surface(35,1.6,'#bcb09a',0,.045,0,9,.08);
  for(let x=-17;x<18;x+=1.4)W.box(.55,.014,.055,'#e7dcc0',x,.067,0);
  W.surface(8.6,2.3,'#626e6c',12,.06,3,21,.07);
  for(let x=8.4;x<16.4;x+=1.05)W.box(.54,.015,.08,'#ece3cb',x,.08,3);
  for(const x of [8,16])for(let z=2.25;z<3.9;z+=.32)W.box(.8,.015,.12,'#ece3cb',x,.08,z);
  W.surface(1.1,3.6,'#8d9582',12,.04,1.1,7,.07);
  const scenery=W.group();
  for(const o of obstacles){
   const base=W.group(o.x,0,o.z,scenery);
   if(o.kind==='ridge'){
    // Full central mass preserves the model's conservative box obstruction.
    W.box(o.w,o.h,o.d,'#858876',0,o.h/2,0,base);
    const cap=W.cylinder(.7,.8,'#9a9b84',0,o.h-.4,0,base,5);cap.scale.set(o.w/1.4,1,o.d/1.4);
    for(let k=0;k<4;k++){
     const rock=W.ball(.5,'#969883',-o.w*.38+k*o.w*.25,.45,o.d*.47,base);
     rock.scale.set(.7,.65+(k%2)*.3,.55);
     W.box(o.w*.72,.05,.13,'#b6b49a',0,o.h*(.25+k*.15),o.d/2+.01,base);
    }
   }else if(o.kind==='hangar'||o.x>6){
    W.box(o.w,o.h,o.d,'#c4c0a9',0,o.h/2,0,base);
    W.box(o.w-.35,o.h-.25,.035,'#5b6a68',0,(o.h-.25)/2,o.d/2+.025,base);
    for(let k=-1;k<=1;k++)W.box(.025,o.h-.3,.04,'#9ca697',k*.7,o.h/2,o.d/2+.05,base);
    W.box(o.w,.15,o.d,'#7f8a81',0,o.h-.075,0,base);
   }else{
    W.box(o.w,o.h,o.d,o.kind==='rubble'?'#a99b84':'#cfbea0',0,o.h/2,0,base);
    if(o.kind==='rubble'){
     for(let k=0;k<5;k++){const beam=W.box(.5,.2,.5,'#887b69',-.8+k*.4,o.h-.1,(k%2)*.5-.25,base);beam.rotation.y=k*.5;}
     W.box(.16,.6,o.d,'#b8a78c',-o.w/2+.08,o.h-.3,0,base);
    }else{
     W.box(o.w,.16,o.d,'#927561',0,o.h-.08,0,base);
     for(const dx of [-.6,.6])W.box(.38,.55,.035,'#4d6869',dx,o.h*.6,o.d/2+.02,base);
     W.box(.44,.8,.05,'#776b5b',0,.4,o.d/2+.04,base);
     W.box(.18,.32,.07,'#a79980',o.w*.3,o.h*.85,o.d/2+.04,base).rotation.z=.35;
    }
   }
  }
  for(const [x,z,s] of [[-17,-5,.7],[-16,6,.8],[-8,6,.65],[-6,-6,.8],[5,-6,.65],[7,6,.6],[17,-6,.7]])W.tree(x,z,s,Math.round(x*x+z*z));
  // Roadside retaining stones, field crates and windsock establish local scale.
  for(const x of [-5,-3,-1,1,3,5])for(const z of [-1.2,1.2])W.box(.6,.23,.35,'#989781',x,.12,z);
  for(const [x,z] of [[9,-2],[10,-2],[16,-4]]){W.box(.6,.5,.6,'#ab926d',x,.25,z);W.box(.64,.06,.64,'#d1ba91',x,.48,z);}
  W.cylinder(.045,2,'#758077',16,1,-1.5);
  const sock=W.cylinder(.19,.75,'#c18759',16.35,1.9,-1.5);sock.rotation.z=Math.PI/2;
  const radios=[],offlineMarkers=[];
  for(let i=0;i<4;i++){
   const root=W.group();W.cylinder(.35,.12,'#546861',0,.06,0,root);
   W.box(.4,.55,.24,'#394e51',0,.4,0,root);W.box(.26,.23,.02,'#7bd7be',0,.48,.131,root);
   W.cylinder(.025,.55,'#34484b',.14,.93,0,root);
   for(let dot=0;dot<=i;dot++)W.ball(.035,'#f2d99a',-.12+dot*.08,.29,.14,root);
   const marker=W.group(0,1.45,0,root);
   for(const angle of [-Math.PI/4,Math.PI/4]){const stroke=W.box(.13,.65,.12,'#b75a3d',0,0,0,marker);stroke.rotation.z=angle;}
   offlineMarkers.push(marker);radios.push(root);
  }
  const rover=W.group();W.box(.85,.35,1.35,'#bd8751',0,.42,0,rover);W.box(.7,.38,.6,'#e0c899',0,.77,.16,rover);
  W.box(.59,.2,.035,'#46656d',0,.8,.48,rover);W.cylinder(.018,.5,'#384e51',.25,1.12,-.25,rover);
  for(const x of [-.45,.45])for(const z of [-.43,.43]){const wheel=W.cylinder(.23,.14,'#3f4544',x,.24,z,rover);wheel.rotation.z=Math.PI/2;}
  const plane=W.group();W.box(.27,.25,1.75,'#eee6d2',0,0,0,plane);W.box(2.2,.075,.42,'#367e85',0,.03,.15,plane);W.box(.85,.07,.25,'#367e85',0,.08,-.67,plane);W.box(.08,.4,.35,'#367e85',0,.2,-.66,plane);W.ball(.16,'#4c7180',0,.14,.38,plane);
  const rotor=W.group(0,0,.92,plane);W.box(.8,.04,.03,'#3d4b4c',0,0,0,rotor);
  const flightPath=[];for(let i=0;i<=96;i++){const p=stateAt(i/96*PERIOD,config).nodes[5].p;flightPath.push([p[0],.1,p[2]]);}W.line(flightPath,'#c9b790',.018);
  const selection=W.ring(.58,'#167567',0,.12,0,undefined,.055);
  const linkGroup=W.group(),connections=[];
  for(let k=0;k<15;k++){
   const geometry=W.own(new W.THREE.BufferGeometry());geometry.setAttribute('position',new W.THREE.BufferAttribute(new Float32Array(6),3));
   const material=W.own(new W.THREE.LineBasicMaterial({color:'#258e7a',transparent:true,opacity:.65}));
   const line=new W.THREE.Line(geometry,material);line.frustumCulled=false;linkGroup.add(line);connections.push(line);
  }
  return {radios,offlineMarkers,rover,plane,rotor,selection,scenery,connections};
 },
 tick({t,parts:p}){
  const state=stateAt(t,config),next=stateAt(t+.01,config),previous=stateAt(t-.01,config);
  p.scenery.scale.setScalar(config.environment==='open'?0:1);
  state.nodes.slice(0,4).forEach((n,i)=>{p.radios[i].position.set(n.p[0],n.p[1]-.7,n.p[2]);p.offlineMarkers[i].scale.setScalar(n.offline?1:0);});
  const r=state.nodes[4].p;p.rover.position.set(r[0],r[1]-.8,r[2]);
  const heading=i=>Math.atan2(next.nodes[i].p[0]-previous.nodes[i].p[0],next.nodes[i].p[2]-previous.nodes[i].p[2]);
  p.rover.rotation.y=heading(4);
  p.plane.position.set(...state.nodes[5].p);p.plane.rotation.set(0,heading(5),.06);p.rotor.rotation.z=t*Math.PI*16;
  const selected=state.nodes[config.selected];p.selection.position.set(selected.p[0],selected.p[1]+.02,selected.p[2]);
  state.links.forEach((link,i)=>{const line=p.connections[i],chosen=link.i===config.selected||link.j===config.selected;const shown=link.reason==='Available'||chosen;
   line.material.color.set(link.reason==='Available'?'#168b76':'#bb7346');line.material.opacity=shown?(chosen?.85:.24):0;
   const v=line.geometry.attributes.position;v.setXYZ(0,...state.nodes[link.i].p);v.setXYZ(1,...state.nodes[link.j].p);v.needsUpdate=true;
  });
  observe(state);
 }
});
