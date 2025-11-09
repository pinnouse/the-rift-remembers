import './index.css';
import kaplay from 'kaplay'
import { colyseusSDK } from "./core/colyseus";
import { createLobbyScene } from './scenes/lobby';
import { createVelkozQuizScene } from './scenes/velkoz-quiz';
import type { MyRoomState } from '../../server/src/rooms/schema/MyRoomState';

// Initialize kaplay
export const k = kaplay({ background: "20252e" });

// Create all scenes
createLobbyScene();
createVelkozQuizScene();

async function main() {
  // Toggle this to demo the Velkoz quiz visual novel
  const DEMO_VELKOZ = true;

  if (DEMO_VELKOZ) {
    k.go("velkoz-quiz");
    return;
  }

  const text = k.add([
    k.text("Joining room ..."),
    k.pos(k.center()),
    k.anchor("center")
  ]);

  const room = await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
    name: "Ka"
  });

  text.text = "Success! sessionId: " + room.sessionId;

  k.go("lobby", room);
}

main();
