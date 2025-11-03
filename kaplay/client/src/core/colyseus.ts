import { Client } from "colyseus.js";

export const colyseusSDK = new Client(
  import.meta.env.VITE_COLYSEUS_URL ||
    `${location.protocol}//${location.host}/colyseus`
);
