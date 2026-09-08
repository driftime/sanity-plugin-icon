import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import type { HoveredIcon } from "@/components/picker/tooltip";
import type { LibraryIcon } from "@/lib/library";
import { isDefined } from "@/lib/utils";

/**
 * Tracks which icon the cursor rests on, holding a tooltip back until it has settled somewhere.
 *
 * @param byName - Every icon the library offers, keyed by the name it goes by.
 * @param scrolling - Whether the grid is currently moving under the cursor.
 * @returns The icon being hovered, alongside ways to follow the cursor and to dismiss it.
 */
export function useIconTooltip(byName: Map<string, LibraryIcon>, scrolling: boolean) {
  const [hovered, setHovered] = useState<HoveredIcon>();
  const hoverStart = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    },
    [],
  );

  function clearHover() {
    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    if (isDefined(hovered)) setHovered(undefined);
  }

  function handleHover(event: MouseEvent<HTMLElement>) {
    if (scrolling) return;

    // Element rather than HTMLElement, since the glyph under the cursor is an SVG and inherits neither.
    const target = event.target instanceof Element ? event.target.closest("[data-icon]") : undefined;
    const cell = target instanceof HTMLElement ? target : undefined;

    if (cell === hovered?.element) return;

    const name = cell?.dataset["icon"];
    const icon = isDefined(name) ? byName.get(name) : undefined;

    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);

    if (!isDefined(icon) || !isDefined(cell)) {
      setHovered(undefined);

      return;
    }

    // Once one tooltip is up, the next follows the cursor rather than waiting again.
    if (isDefined(hovered)) {
      setHovered({ icon, element: cell });

      return;
    }

    hoverStart.current = setTimeout(() => {
      setHovered({ icon, element: cell });
    }, 200);
  }

  return { hovered, handleHover, clearHover };
}
