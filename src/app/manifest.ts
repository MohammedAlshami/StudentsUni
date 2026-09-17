import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arabic Era - Find Your University in Malaysia",
    short_name: "Arabic Era",
    description:
      "Browse Malaysian universities and programs. Compare fees, entry requirements, and get free guidance from application to registration.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5efeb",
    theme_color: "#285b50",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
