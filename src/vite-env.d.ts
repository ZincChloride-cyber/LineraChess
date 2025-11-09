/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHESS_CONTRACT_ADDRESS?: string;
  readonly VITE_CHESS_CONTRACT_CHAIN_ID?: string;
  readonly VITE_CHESS_CONTRACT_NETWORK_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}