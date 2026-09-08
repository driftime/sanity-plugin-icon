import { useEffect, useState } from "react";

import type { LibraryIcon } from "@/lib/library";
import { requestLibrary } from "@/lib/library";

/**
 * Reads the icon library, sharing one request with every other field in the session. Callers mount
 * only while a picker is open, so a Studio that never opens one never pays the megabyte it costs.
 *
 * @returns Every icon the library offers, or undefined while it is still being read.
 */
export function useIconLibrary() {
  const [library, setLibrary] = useState<LibraryIcon[]>();

  useEffect(() => {
    let active = true;

    async function load() {
      const loaded = await requestLibrary();
      if (active) setLibrary(loaded);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return library;
}
