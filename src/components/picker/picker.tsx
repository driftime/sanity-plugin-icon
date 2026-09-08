import { SearchIcon } from "@sanity/icons/Search";
import { Box, Button, Dialog, Flex, Grid, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import type { ChangeEvent, ComponentProps, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Cell } from "@/components/picker/cell";
import { Recent } from "@/components/picker/recent";
import type { HoveredIcon } from "@/components/picker/tooltip";
import { Tooltip } from "@/components/picker/tooltip";
import { defaultIconProps } from "@/config/defaults";
import { gridColumns, gridHeight, gridLayoutStyle, gridRowHeight } from "@/config/grid";
import { useIconLibrary } from "@/hooks/use-icon-library";
import { useRecentIcons } from "@/hooks/use-recent-icons";
import { getNextIndex, getVisibleRows } from "@/lib/grid";
import type { LibraryIcon } from "@/lib/library";
import { normaliseTerms } from "@/lib/library";
import { isDefined } from "@/lib/utils";

export type PickerProps = Omit<
  ComponentProps<typeof Dialog>,
  "children" | "header" | "width" | "selected" | "onSelect"
> & {
  selected: string | undefined;
  onSelect: (icon: LibraryIcon) => void;
};

export function Picker({ selected, onSelect, ...props }: PickerProps) {
  const library = useIconLibrary();
  const { recent, remember, forget } = useRecentIcons();

  const [search, setSearch] = useState("");
  const [scrollRow, setScrollRow] = useState(0);
  const [movedIndex, setMovedIndex] = useState<number>();
  const [hovered, setHovered] = useState<HoveredIcon>();
  const [scrolling, setScrolling] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const activeCell = useRef<HTMLButtonElement>(null);
  const focusActiveCell = useRef(false);
  const scrollFrame = useRef<number>(undefined);
  const scrollStop = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverStart = useRef<ReturnType<typeof setTimeout>>(undefined);

  const query = normaliseTerms(search);
  const searching = isDefined(query);
  const results = (library ?? []).filter((icon) => !searching || icon.terms.includes(query));

  const byName = new Map((library ?? []).map((icon) => [icon.name, icon]));
  const recentIcons = searching
    ? []
    : recent.flatMap((entry) => {
        const icon = byName.get(entry);

        return isDefined(icon) ? [icon] : [];
      });

  const { totalRows, firstRow, lastRow } = getVisibleRows(scrollRow, results.length);
  const visible = results.slice(firstRow * gridColumns, lastRow * gridColumns);

  // Derived rather than stored, so the grid cannot disagree with what is selected.
  const selectedIndex =
    searching || !isDefined(library) || !isDefined(selected) ? -1 : library.findIndex((icon) => icon.name === selected);
  const activeIndex = movedIndex ?? Math.max(0, selectedIndex);

  useEffect(() => {
    const element = scroller.current;
    if (!isDefined(element) || selectedIndex === -1) return;

    element.scrollTop = Math.max(0, Math.floor(selectedIndex / gridColumns) * gridRowHeight - gridHeight / 2);
  }, [selectedIndex]);

  useEffect(
    () => () => {
      if (isDefined(scrollFrame.current)) cancelAnimationFrame(scrollFrame.current);
      if (isDefined(scrollStop.current)) clearTimeout(scrollStop.current);
      if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    },
    [],
  );

  useEffect(() => {
    if (!focusActiveCell.current) return;

    focusActiveCell.current = false;
    if (isDefined(activeCell.current)) activeCell.current.focus();
  }, [activeIndex]);

  function handleSelect(icon: LibraryIcon) {
    remember(icon.name);
    onSelect(icon);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.currentTarget.value);
    setMovedIndex(undefined);

    if (isDefined(scroller.current)) scroller.current.scrollTop = 0;
  }

  function selectActive() {
    const icon = results[activeIndex];

    if (isDefined(icon)) handleSelect(icon);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      selectActive();

      return;
    }

    if (event.key !== "ArrowDown") return;

    event.preventDefault();

    if (isDefined(activeCell.current)) activeCell.current.focus();
  }

  // Coalesced to a frame, so a scroll gesture moves the window a row at a time rather than per event.
  function handleScroll() {
    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    setHovered(undefined);
    if (!scrolling) setScrolling(true);

    if (isDefined(scrollStop.current)) clearTimeout(scrollStop.current);
    scrollStop.current = setTimeout(() => {
      setScrolling(false);
    }, 150);

    if (isDefined(scrollFrame.current)) return;

    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = undefined;

      const element = scroller.current;
      if (isDefined(element)) setScrollRow(Math.floor(element.scrollTop / gridRowHeight));
    });
  }

  // Rows passing under a still cursor fire hover events of their own, hence the scroll guard.
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

  function clearHover() {
    if (isDefined(hoverStart.current)) clearTimeout(hoverStart.current);
    if (isDefined(hovered)) setHovered(undefined);
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = results.length - 1;
    if (last < 0) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectActive();

      return;
    }

    const next = getNextIndex(event.key, activeIndex, last);
    if (!isDefined(next)) return;

    event.preventDefault();

    const index = Math.min(Math.max(next, 0), last);
    focusActiveCell.current = true;
    setMovedIndex(index);

    // Worked out from the index rather than the cell, since Home and End can land outside the window.
    const element = scroller.current;
    if (!isDefined(element)) return;

    const top = Math.floor(index / gridColumns) * gridRowHeight;

    if (top < element.scrollTop) {
      element.scrollTop = top;
    } else if (top + gridRowHeight > element.scrollTop + gridHeight) {
      element.scrollTop = top + gridRowHeight - gridHeight;
    }
  }

  return (
    <Dialog header="Select icon" width={1} {...props}>
      <Stack gap={4} padding={4}>
        <TextInput
          icon={<SearchIcon {...defaultIconProps} />}
          placeholder="Search by name or by what the icon depicts"
          value={search}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyDown}
          disabled={!isDefined(library)}
          aria-label="Search the icon library"
        />
        {!isDefined(library) && (
          <Flex align="center" justify="center" style={{ height: gridHeight }}>
            <Spinner muted />
          </Flex>
        )}
        {isDefined(recentIcons) && (
          <Recent
            icons={recentIcons}
            selected={selected}
            onSelect={handleSelect}
            onForget={forget}
            onMouseOver={handleHover}
            onMouseLeave={clearHover}
          />
        )}
        {isDefined(library) && (
          <Stack gap={3}>
            <Box paddingY={2}>
              <Text size={1} weight="medium" muted>
                All icons ({results.length.toLocaleString("en-GB")})
              </Text>
            </Box>
            <Box
              ref={scroller}
              role="listbox"
              aria-label="Icon library"
              onScroll={handleScroll}
              onMouseOver={handleHover}
              onMouseLeave={clearHover}
              onKeyDown={handleGridKeyDown}
              style={{ height: gridHeight, overflowY: "auto" }}
            >
              {results.length === 0 && (
                <Flex align="center" justify="center" direction="column" gap={3} style={{ height: gridHeight }}>
                  <Text size={1} muted>
                    Nothing matches “{search}”.
                  </Text>
                  <Button
                    type="button"
                    mode="ghost"
                    text="Clear search"
                    onClick={() => {
                      setSearch("");
                      setMovedIndex(undefined);
                    }}
                  />
                </Flex>
              )}
              {results.length > 0 && (
                <Grid
                  gridTemplateColumns={gridColumns}
                  style={{
                    ...gridLayoutStyle,
                    paddingTop: firstRow * gridRowHeight,
                    paddingBottom: (totalRows - lastRow) * gridRowHeight,
                  }}
                >
                  {visible.map((icon, offset) => {
                    const index = firstRow * gridColumns + offset;

                    return (
                      <Cell
                        key={icon.name}
                        ref={index === activeIndex ? activeCell : undefined}
                        icon={icon}
                        selected={icon.name === selected}
                        focusable={index === activeIndex}
                        position={index + 1}
                        total={results.length}
                        onSelect={handleSelect}
                      />
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Stack>
        )}
        <Tooltip key={hovered?.icon.name} hovered={hovered} />
      </Stack>
    </Dialog>
  );
}
