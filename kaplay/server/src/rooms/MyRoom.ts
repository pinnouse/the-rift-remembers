import { type Client, Room } from "@colyseus/core";
import { getSummonerIconByNameTag } from "../services/riotService";
import { MyRoomState, Player } from "./schema/MyRoomState";

const ADJECTIVES = [
  "silly",
  "tanky",
  "fed",
  "big",
  "tiny",
  "angry",
  "fast",
  "rich",
  "brave",
  "clever",
];

const NOUNS = [
  "raptor",
  "krug",
  "golem",
  "crab",
  "poro",
  "tower",
  "wolf",
  "dragon",
  "baron",
  "nexus",
];

function randomPickOne(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class MyRoom extends Room<MyRoomState> {
  LOBBY_CHANNEL = "$mylobby";

  maxClients = 8;
  state = new MyRoomState();

  generateRoomIdSingle(): string {
    return (
      randomPickOne(ADJECTIVES) +
      randomPickOne(NOUNS) +
      Math.round(Math.random() * 100)
    );
  }

  async generateRoomId(): Promise<string> {
    const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
    let id: string;
    do {
      id = this.generateRoomIdSingle();
    } while (currentIds.includes(id));

    await this.presence.sadd(this.LOBBY_CHANNEL, id);
    return id;
  }

  async onCreate(options: any) {
    this.onMessage("move", (client, message) => {
    //   const player = this.state.players.get(client.sessionId);
    //   player.x = message.x;
    //   player.y = message.y;
    });

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.roomId = await this.generateRoomId();
    console.log("assigned room", this.roomId);
  }

  async onJoin(client: Client, options: any) {
    // console.log(client.sessionId, "joined!", options);
    if (
      typeof this.state.owner === "undefined" ||
      this.state.owner.length === 0
    ) {
      this.state.owner === client.sessionId;
	  console.log("assigned owner:", client.sessionId, options.nameTag);
    }
    // client.view = new StateView();

    const player = new Player();
    player.sessionId = client.sessionId;
    // get a random avatar for the player
    // player.avatar = avatars[Math.floor(Math.random() * avatars.length)];
    player.summonerIconUrl = (
      await getSummonerIconByNameTag(options.nameTag)
    ).iconUrl;
    player.name = options.name || "Anonymous";

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  async onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
  }
}
