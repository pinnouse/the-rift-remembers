/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_ID: string;
  readonly VITE_COLYSEUS_URL: string;
  // add env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
