import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://vanity.kirillov.digital",
  integrations: [react(), sitemap()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: "ProtoMono",
      cssVariable: "--font-proto-mono",
      weights: [300],
      styles: ["normal"],
      display: "swap",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/ProtoMono-Light.otf"],
            weight: 300,
            style: "normal",
          },
        ],
      },
    },
  ],
});
