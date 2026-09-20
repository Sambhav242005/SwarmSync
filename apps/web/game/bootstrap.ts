import Phaser from "phaser";
import { WorldScene } from "./WorldScene";
export function bootstrap(parent: string){
  return new Phaser.Game({
    type: Phaser.AUTO, parent, width: 1280, height: 720,
    backgroundColor: "#0b0f14", scene: [WorldScene],
  });
}
