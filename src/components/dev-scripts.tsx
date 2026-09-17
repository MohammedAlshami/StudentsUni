"use client";

import { useEffect } from "react";

export function DevScripts() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (document.querySelector("script[data-react-grab]")) return;

    const script = document.createElement("script");
    script.src = "//unpkg.com/react-grab/dist/index.global.js";
    script.crossOrigin = "anonymous";
    script.dataset.reactGrab = "";
    document.head.appendChild(script);
  }, []);

  return null;
}