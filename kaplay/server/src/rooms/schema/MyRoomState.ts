import { MapSchema, Schema, type, view } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") public sessionId: string;
  @type("string") public summonerIconUrl: string;
  @type("string") public name: string;

  // following properties will not be sent to the client
  @view() @type("string") protected puuid: string;

  constructor(
    sessionId: string = "",
    userId: string = "",
    summonerIconId: number = 0,
    name: string = ""
  ) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
    this.summonerIconId = summonerIconId;
    this.name = name;
  }
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") public owner: string;
}
