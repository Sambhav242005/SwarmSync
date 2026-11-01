import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {Script} from 'node:vm';
import {defaults,stateAt,randomPositions,blocked,obstacles} from './model.mjs';
test('offline built script parses without replacement-string corruption',()=>{const html=readFileSync(new URL('./swarmsync-world.html',import.meta.url),'utf8');const match=html.match(/<script>([\s\S]*)<\/script>/);assert(match);assert.doesNotThrow(()=>new Script(match[1]));});
test('random layouts repeat by seed and avoid solid obstacles',()=>{assert.deepEqual(randomPositions(42),randomPositions(42));assert.notDeepEqual(randomPositions(42),randomPositions(43));for(let seed=0;seed<50;seed++)for(const p of randomPositions(seed))assert(!obstacles.some(o=>Math.abs(p[0]-o.x)<o.w/2&&Math.abs(p[2]-o.z)<o.d/2));});
test('a segment through a building is obstructed, an elevated segment clears it',()=>{const box=[{x:0,z:0,w:2,d:2,h:2}];assert(blocked([-3,1,0],[3,1,0],box));assert(!blocked([-3,3,0],[3,3,0],box));assert(!blocked([-3,1,3],[3,1,3],box));});
test('outage boundaries and disabling outages change availability',()=>{const c=defaults();assert(!stateAt(15.99,c).nodes[2].offline);assert(stateAt(16,c).nodes[2].offline);assert(!stateAt(25,c).nodes[2].offline);c.outages=false;assert(!stateAt(18,c).nodes[2].offline);});
test('equal time gives equal state regardless of intermediate seeks',()=>{const c=defaults(),first=stateAt(9,c);for(let t=0;t<20;t+=.25)stateAt(t,c);assert.deepEqual(stateAt(9,c),first);assert.deepEqual(stateAt(48,c),stateAt(0,c));});
test('altitude and placement change geometry; open ground has no obstruction',()=>{const c=defaults(),before=stateAt(6,c);c.altitude=6;c.positions[0][0]=7;const after=stateAt(6,c);assert.notDeepEqual(before.nodes,after.nodes);c.environment='open';assert(!stateAt(6,c).links.some(l=>l.reason==='Obstructed'));});

test('three regions share one graph with a real multihop cross-region route',()=>{
 const c=defaults();c.environment='open';c.outages=false;c.range=11;
 const s=stateAt(0,c),route=s.routes[0][3];
 assert(s.reachable[0][3]);assert(route.length>=4);
 assert(!s.links.find(l=>l.i===0&&l.j===3).available);
 for(let k=1;k<route.length;k++)assert(s.links.some(l=>l.available&&((l.i===route[k-1]&&l.j===route[k])||(l.j===route[k-1]&&l.i===route[k]))));
 assert(new Set(route.map(i=>s.nodes[i].region)).size===3);
 assert(s.links.some(l=>l.available&&l.crossRegion));
 c.range=.1;assert(!stateAt(0,c).reachable[0][3]);
});
test('outage removes a required relay from graph reachability',()=>{
 const c=defaults();c.environment='open';c.range=11;c.altitude=100;
 const offline=stateAt(18,c);assert(!offline.reachable[0][3]);assert(offline.routes[0][3].length===0);
 c.outages=false;assert(stateAt(18,c).reachable[0][3]);
});
test('both moving devices traverse every region on the shared clock',()=>{
 const c=defaults(),seen=[new Set(),new Set()];
 for(let t=0;t<48;t+=.25){const s=stateAt(t,c);seen[0].add(s.nodes[4].region);seen[1].add(s.nodes[5].region);}
 for(const regions of seen)assert.deepEqual([...regions].sort(),['airfield','mountain','settlement']);
});
test('aircraft stays above every modeled solid even with a low requested altitude',()=>{
 const c=defaults();c.altitude=0;
 for(let t=0;t<48;t+=.25){const p=stateAt(t,c).nodes[5].p;assert(p[1]>Math.max(...obstacles.map(o=>o.h)));}
});
test('world obstacle blocks its actual ground-level crossing and elevation clears it',()=>{
 const c=defaults();c.outages=false;c.range=32;c.positions[0]=[-16,0,-3];c.positions[1]=[-12,0,-3];
 assert.equal(stateAt(0,c).links.find(l=>l.i===0&&l.j===1).reason,'Obstructed');
 c.positions[0][1]=3;c.positions[1][1]=3;
 assert.equal(stateAt(0,c).links.find(l=>l.i===0&&l.j===1).reason,'Available');
});
