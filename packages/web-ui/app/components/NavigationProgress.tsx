"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as styles from "@/styles/loading.css";

/**
 * Thin bar at the top of the page while a navigation is in flight.
 *
 * loading.tsx only shows when the route segment changes, so changing just the
 * query string (pagination, sorting, chart filters) would otherwise give no
 * feedback at all.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams}`;
  const [pending, setPending] = useState(false);

  // The new URL has rendered, so the navigation is done. (Resetting state
  // during render rather than in an effect avoids an extra render pass.)
  const [renderedUrl, setRenderedUrl] = useState(url);
  if (renderedUrl !== url) {
    setRenderedUrl(url);
    setPending(false);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page, or just a different #hash: nothing will load.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      setPending(true);
    }

    function onSubmit(e: SubmitEvent) {
      if (!e.defaultPrevented) setPending(true);
    }

    // Capture phase: Next's <Link> calls preventDefault on click, so a
    // bubbling listener couldn't tell its clicks from cancelled ones.
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  if (!pending) return null;
  return <div className={styles.progress} aria-hidden />;
}
