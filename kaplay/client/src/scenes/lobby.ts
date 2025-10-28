import { k } from "../App";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "server:rooms/schema/MyRoomState";
import Button from "../shared/components/button";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    const $ = getStateCallbacks(room);

    Button(k, {
      text: "Leave room",
      x: 70,
      y: 40,
      size: 14,
      textColor: "#ffffff",
      background: "#e61a1a",
      outlineColor: "#9e1414",
    }, () => {
      console.log("Leaving room");
      room.leave(true);
      location.replace(`${location.protocol}//${location.hostname}:${location.port}/`);
    });

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd((player, sessionId) => {
      spritesBySessionId[sessionId] = createPlayer(player);
    });

    // listen when a player is removed from server state
    $(room.state).players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    k.onClick(() => {
      room.send("move", k.mousePos());
    });

  });
}

function createPlayer(player: Player) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar),
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.scale(0.5)
  ]);

  sprite.onUpdate(() => {
    sprite.pos.x = k.lerp(sprite.pos.x, player.x, 12 * k.dt());
    sprite.pos.y = k.lerp(sprite.pos.y, player.y, 12 * k.dt());
  });

  return sprite;
}
