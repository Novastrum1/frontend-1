"use client";

import { useEffect } from "react";

/** Registers the offline shell without intercepting wallet or API requests. */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }, []);

  return children;
}
