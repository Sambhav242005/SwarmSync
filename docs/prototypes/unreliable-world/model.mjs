export const PERIOD=48;
export const regions=[
 {id:'settlement',name:'Settlement',x:-12,minX:-18,maxX:-6},
 {id:'mountain',name:'Mountain pass',x:0,minX:-6,maxX:6},
 {id:'airfield',name:'Airfield',x:12,minX:6,maxX:18}
];
export const regionAt=x=>regions.find(r=>x>=r.minX&&x<r.maxX)?.id||(x===18?'airfield':'outside');
// Continuous flat ground; raised ridge solids are represented by the same boxes as the scene.
export const terrainHeight=(_x,_z)=>0;
export const obstacles=[
 {x:-14,z:-3,w:2.4,d:2,h:2.5,kind:'building'},
 {x:-10,z:-4,w:2,d:2,h:2,kind:'building'},
 {x:-14,z:3.6,w:2.2,d:2,h:1.4,kind:'rubble'},
 {x:-10,z:4,w:2.4,d:2.2,h:2.7,kind:'building'},
 {x:-2,z:-4.6,w:3.2,d:3.8,h:3.8,kind:'ridge'},
 {x:2,z:4.6,w:3.2,d:3.8,h:4.8,kind:'ridge'},
 {x:12,z:-4.3,w:3.8,d:2.5,h:2.4,kind:'building'}
];
export const MIN_AIRCRAFT_ALTITUDE=5.8;
export const defaults=()=>({seed:42,range:15,altitude:7,selected:0,environment:'settlement',outages:true,positions:[[-15,0,0],[-5,0,1],[5,0,-1],[15,0,0]],roverX:0,roverZ:0});
export function blocked(a,b,boxes=obstacles){
 return boxes.some(o=>{
  let near=0,far=1;
  const low=[o.x-o.w/2,0,o.z-o.d/2], high=[o.x+o.w/2,o.h,o.z+o.d/2];
  for(let k=0;k<3;k++){
   const delta=b[k]-a[k];
   if(Math.abs(delta)<1e-10){if(a[k]<low[k]||a[k]>high[k])return false;}
   else {let p=(low[k]-a[k])/delta,q=(high[k]-a[k])/delta;if(p>q)[p,q]=[q,p];near=Math.max(near,p);far=Math.min(far,q);if(near>far)return false;}
  }
  return far>0&&near<1;
 });
}
export function randomPositions(seed,environment='settlement'){
 let s=seed>>>0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
 const points=[];for(let i=0;i<4;i++){for(let attempt=0;attempt<1000;attempt++){
  // Stratification guarantees ground radios across all three connected regions.
  const limits=[[-17,-11],[-5,-1],[1,5],[11,17]][i];
  const p=[Math.round((limits[0]+rand()*(limits[1]-limits[0]))*10)/10,0,Math.round((rand()*12-6)*10)/10];
  const clear=environment==='open'||!obstacles.some(o=>Math.abs(p[0]-o.x)<o.w/2+.4&&Math.abs(p[2]-o.z)<o.d/2+.4);
  if(clear&&points.every(q=>Math.hypot(q[0]-p[0],q[2]-p[2])>1.5)){points.push(p);break;}
 }if(points.length!==i+1)throw Error('Unable to place devices');}return points;
}
export function stateAt(t,c){
 const phase=((t%PERIOD)+PERIOD)%PERIOD, a=phase/PERIOD*Math.PI*2;
 const nodes=c.positions.map((p,i)=>({id:`Ground ${i+1}`,p:[p[0],p[1]+.7,p[2]],offline:c.outages&&i===2&&phase>=16&&phase<25}));
 // Offsets remain editable but are clamped to the shared world; road avoids ridge solids.
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 nodes.push({id:'Rover',p:[clamp(Math.sin(a)*15+c.roverX,-17,17),.8,clamp(Math.cos(a)*.4+c.roverZ,-1.8,1.8)],offline:false});
 nodes.push({id:'Aircraft',p:[Math.cos(a)*16,Math.max(MIN_AIRCRAFT_ALTITUDE,c.altitude),Math.sin(a)*6],offline:false});
 for(const n of nodes)n.region=regionAt(n.p[0]);
 const links=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const distance=Math.hypot(...nodes[i].p.map((v,k)=>v-nodes[j].p[k]));
  const reason=nodes[i].offline||nodes[j].offline?'Device outage':distance>c.range?'Out of range':blocked(nodes[i].p,nodes[j].p,c.environment==='open'?[]:obstacles)?'Obstructed':'Available';
  links.push({i,j,distance,reason,available:reason==='Available',crossRegion:nodes[i].region!==nodes[j].region});
 }
 // Breadth-first graph paths describe present communication opportunities, never packet delivery.
 const routes=nodes.map((node,start)=>{
  const paths=nodes.map(()=>[]);if(node.offline)return paths;
  paths[start]=[start];const queue=[start];
  for(let q=0;q<queue.length;q++)for(const link of links){
   if(!link.available)continue;
   const next=link.i===queue[q]?link.j:link.j===queue[q]?link.i:-1;
   if(next>=0&&!paths[next].length){paths[next]=[...paths[queue[q]],next];queue.push(next);}
  }
  return paths;
 });
 return {time:phase,nodes,links,routes,reachable:routes.map(row=>row.map(path=>path.length>0))};
}
