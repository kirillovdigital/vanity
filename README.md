# Vanity

![Vanity preview](./public/images/vanity.png)

Vanity is a browser-based multichain vanity address generator. It searches locally with dedicated Web Workers, keeps fresh results in session memory by default, and saves wallets to an encrypted IndexedDB vault only when you explicitly ask it to.

## Introduction

Vanity helps you generate recognizable prefixes and suffixes without sending keys to a backend. The current app supports:

- EVM
- Solana
- Bitcoin (`Taproot` and `Native SegWit`)
- TON
- Polkadot

## How to Use

### Accessing Vanity

To start using Vanity, visit [vanity.ac](https://vanity.ac).

## Features

- **Local generation**: Wallet search runs in the browser through dedicated workers.
- **Multichain runtime**: EVM shares one engine, while Solana, Bitcoin, TON, and Polkadot each use their own family-specific worker.
- **Explicit vault**: Session results are ephemeral until you save them into the IndexedDB vault encrypted with PBKDF2 + AES-GCM.
- **Lazy wallet center**: Reown AppKit is kept out of the critical route path and loads only when wallet context is needed.
- **Cloudflare-ready headers**: `_headers` enables cross-origin isolation and immutable caching for worker and wasm-friendly assets.

---

## Development

- **Install**: `bun install`
- **Dev**: `bun run dev`
- **Lint**: `bun run lint`
- **Check**: `bun run check`
- **Build**: `bun run build`

### Environment

- `PUBLIC_REOWN_PROJECT_ID` optional override for the AppKit project id
- `PUBLIC_WALLETCONNECT_PROJECT_ID` fallback override

---

### Contributing to the Project

I am welcome any suggestions and participation in the project! If you have ideas or want to help in development, please do not hesitate to make changes or reach out to me.

---

### Feedback and Support

If you have questions, suggestions, or need support using Vanity, please contact me at [dim@kirillov.digital](mailto:dim@kirillov.digital).

---

## License

Vanity is distributed under the MIT License.
