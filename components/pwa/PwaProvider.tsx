"use client";

import { useEffect } from "react";

/** Registers the offline shell without intercepting wallet or API requests. */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // A development server can change its API origin and compiled public
    // environment between reloads. Do not let an old shell cache mask those
    // changes; installation and offline support remain production features.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      );
      return;
    }

    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }, []);

  return children;
}
