import Phaser from "phaser";
export class WorldScene extends Phaser.Scene {
  agents: {id:string;x:number;y:number;state:string;battery:number}[] = [];
  packets: {from:string;to:string;t:number}[] = [];
  constructor(){super("world");}
  create(){
    this.add.rectangle(640,360,1280,720,0x0b0f14);
    for(let x=0;x<1280;x+=64) this.add.line(0,0,x,0,x,720,0x1a2330).setOrigin(0);
  }
  spawnPacket(x1:number,y1:number,x2:number,y2:number,color:number){
    const c=this.add.circle(x1,y1,4,color);
    this.tweens.add({targets:c,x:x2,y:y2,duration:600,onComplete:()=>c.destroy()});
  }
}
