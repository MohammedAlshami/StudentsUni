"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A service worker caching JS/assets is actively harmful in development —
      // it serves stale bundles across code changes (stale chunks, stale
      // public/ assets). Make sure none is left registered from an earlier
      // production build or a previous session.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) reg.unregister();
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is a progressive enhancement; ignore registration failures.
    });
  }, []);

  return null;
}
