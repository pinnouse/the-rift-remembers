import type { MyRoomState, Player } from "server:rooms/schema/MyRoomState";

import { getStateCallbacks, type Room } from "colyseus.js";
import { k } from "../App";
import Button from "../shared/components/button";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    const $ = getStateCallbacks(room);

    Button(
      k,
      {
        text: "Leave room",
        x: 70,
        y: 40,
        size: 14,
        textColor: "#ffffff",
        background: "#e61a1a",
        outlineColor: "#9e1414",
      },
      () => {
        console.log("Leaving room");
        room.leave(true);
        location.replace(
          `${location.protocol}//${location.hostname}:${location.port}/`
        );
      }
    );

    $(room.state).players.onChange(() => {
      renderPlates(Array.from(room.state.players.values()));
      renderMiddle();
    });

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd((player, sessionId) => {
      console.log("player added:", sessionId, player.name);
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

function renderPlates(players: Player[]) {
  k.setBackground(new k.Color(26, 26, 26));
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const centerX = k.width() / 2;
    const centerY = k.height() / 2;
    const radius = Math.min(k.width(), k.height()) / 3 + 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    k.add([
      k.rect(140, 100),
      k.pos(x, y),
      k.anchor("center"),
      k.color(i === 0 ? "#3768c4" : "#0b2d6b"),
      k.outline(4, new k.Color(99, 149, 237)),
      k.opacity(0.8),
      k.z(0),
    ]);
    if (i <= players.length - 1) {
      renderPlayer(players[i], x, y);
    }
  }
}

function renderPlayer(player: Player, x: number, y: number) {
  const spriteName = `${player.name}icon`;
  k.loadSprite(spriteName, player.summonerIconUrl);
  k.add([
    k.sprite(spriteName, { width: 40, height: 40 }),
    k.pos(x, y - 10),
    k.anchor("center"),
    k.z(1),
  ]);
  k.add([
    k.text(player.name, { size: 12 }),
    k.pos(x, y + 25),
    k.anchor("center"),
    k.z(1),
  ]);
}

function renderMiddle(playerCount: number = 0) {
  const centerX = k.width() / 2;
  const centerY = k.height() / 2;
  k.add([
    k.color(k.WHITE),
    k.text(`Lobby ${playerCount}/8`, { size: 32 }),
    k.pos(centerX, centerY - 30),
    k.anchor("center"),
    k.z(1),
  ]);

  Button(
    k,
    {
      text: "Ready Up",
      x: centerX,
      y: centerY + 20,
      size: 24,
      textColor: "#ffffff",
      background: "#4caf50",
      outlineColor: "#388e3c",
    },
    () => {
      console.log("Ready up clicked");
    }
  );
}
