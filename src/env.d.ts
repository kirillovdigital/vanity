/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_REOWN_PROJECT_ID?: string;
  readonly PUBLIC_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
