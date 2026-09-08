<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-light.svg" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-light.svg" alt="Icon plugin logo" width="48" />
  </picture>
  <h1>Icon</h1>
  <p><strong>A Sanity Studio plugin by Driftime®</strong></p>
  <p>Lucide icons for Sanity Studio, stored as drawings and rendered without the library.</p>
</div>

<br />

## Overview

Icon adds a field type to Sanity Studio that opens the Lucide library as a searchable grid, either in full or limited to a set you choose. Authors find an icon by its name or by what it depicts, and the drawing itself is stored on the document alongside the name it was chosen by.

Rendering costs one component and **under 2 kB gzipped**, with no icon library in your application. That works because the document holds the drawing rather than a reference to it, so nothing needs resolving by name at runtime.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-selector-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-selector-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-selector-light.png" alt="The icon selector open in Sanity Studio, showing a search field above a scrolling grid of the complete Lucide library alongside a count of every icon it offers" />
  </picture>
  <p align="center"><sub><em>Every Lucide icon, searchable from inside the Studio.</em></sub></p>
</figure>

<br />

## Installation

Icon is built for Sanity Studio 6 and React 19, and declares both as peer dependencies, so your Studio must already be on those versions. You'll need Node 22.12 or later.

```bash
bun add -E @driftime/sanity-plugin-icon
```

<br />

## Basic Setup

Add the plugin to your Sanity configuration.

```typescript
import { defineConfig } from "sanity";
import { iconPlugin } from "@driftime/sanity-plugin-icon";
// ...

export default defineConfig({
  // ...
  plugins: [iconPlugin()],
});
```

That registers an `icon` object type, available alongside Sanity's own. Use it on any document or object.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Shown beside the heading.",
});
```

The type is registered as `icon` and the name is not configurable, so a Studio that already defines its own `icon` type will need to rename that one.

See [Configuration](#configuration) for the options the plugin takes.

<br />

## Restricting the Icon Set

By default the picker offers every icon in the library. Pass `icons` to limit it, and every field takes the set you name.

```typescript
export default defineConfig({
  // ...
  plugins: [iconPlugin({ icons: ["mail", "phone", "globe"] })],
});
```

The plugin augments Sanity's `IntrinsicDefinitions` interface, adding an `icons` option that TypeScript recognises automatically. A field can name its own set, which replaces the one the plugin was given rather than narrowing it.

```typescript
defineField({
  name: "icon",
  type: "icon",
  description: "Shown on the feature card.",
  options: { icons: ["leaf", "shield", "zap"] },
});
```

Names are typed against the Lucide version your project resolved, so they autocomplete as you write them. Icons appear in the order you list them, and a name that version does not recognise is skipped.

Use `SanityIconName` to type a set you want to share between fields.

```typescript
import type { SanityIconName } from "@driftime/sanity-plugin-icon";

export const clientIcons: SanityIconName[] = ["mail", "phone", "globe"];
```

Restricting a set does not affect what has already been stored. The document holds the drawing, so an icon saved earlier still renders even though the picker no longer offers it.

<br />

## Picking an Icon

- Search matches an icon's name and the terms it is tagged with, so "next" finds `arrow-right`.
- The complete Lucide set is offered unless you restrict it, and the count reflects whatever is available.
- The last eight icons chosen are remembered, per browser rather than per dataset.

<br />

<figure>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-search-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-search-light.png" />
    <img src="https://raw.githubusercontent.com/driftime/sanity-plugin-icon/HEAD/.github/assets/icon-search-light.png" alt="The icon selector filtered by the term next, showing thirteen arrow and forward icons matched on what they depict rather than on their names" />
  </picture>
  <p align="center"><sub><em>Searching matches what an icon depicts, so “next” finds every arrow.</em></sub></p>
</figure>

<br />

## Rendering Icons

`Icon` is exported from a separate import path that holds no Studio code, so it can be used anywhere outside the Studio, in server and client components alike. It needs no icon library of its own.

```tsx
import { Icon } from "@driftime/sanity-plugin-icon/render";

<Icon value={home.icon} className="size-8" />;
```

It takes the stored field value directly and renders nothing when that value is absent or unreadable. Props extend `ComponentProps<"svg">`, so `className`, `style`, `aria-label` and the rest pass through to the element.

Type the field with `SanityIcon`, available from either import path.

```typescript
import type { SanityIcon } from "@driftime/sanity-plugin-icon";

export interface SanityHome {
  title: string;
  icon?: SanityIcon;
}
```

<br />

## Document Previews

A document's preview shows the icon its _type_ defines, which is the same glyph for every document of that type. `createIconPreview` builds preview media from the icon an author chose instead.

```typescript
import { createIconPreview } from "@driftime/sanity-plugin-icon";

preview: {
  select: { title: "title", icon: "icon" },
  prepare({ title, icon }) {
    return { title, media: createIconPreview(icon) };
  },
},
```

It returns `undefined` when there is nothing to draw, so the preview falls back to Sanity's own placeholder.

<br />

## Querying

A stored icon needs no special handling in a query. It comes down as a plain object alongside the rest of the document, with nothing to dereference or expand.

```groq
*[_type == "home"][0] { title, icon }
```

<br />

## What Gets Stored

```json
{
  "_type": "icon",
  "name": "house",
  "node": "[[\"path\",{\"d\":\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"}], …]"
}
```

The `name` records which icon was chosen, and the `node` holds the shapes it is drawn from. Both are written when the icon is picked, which is what lets it render without an icon library.

<br />

## Keeping the Icon Set Current

The plugin tracks Lucide within its major version, so new icons arrive without waiting for a plugin release. Your lockfile pins whichever version resolved at install, and removing and re-adding the plugin resolves it afresh.

```bash
bun remove @driftime/sanity-plugin-icon
bun add -E @driftime/sanity-plugin-icon
```

`bun update lucide-static` also works, and adds the icon library to your own dependencies so you control the version from then on.

<br />

## API

What the package exports at runtime, and which import path each one comes from.

| Export                     | Import from                           | Purpose                                    |
| -------------------------- | ------------------------------------- | ------------------------------------------ |
| `iconPlugin(config?)`      | `@driftime/sanity-plugin-icon`        | Registers the `icon` type with the Studio. |
| `createIconPreview(value)` | `@driftime/sanity-plugin-icon`        | Builds preview media from a stored icon.   |
| `Icon`                     | `@driftime/sanity-plugin-icon/render` | Draws a stored icon.                       |

<br />

## Configuration

Nothing is required. Without `icons`, the picker offers every icon in the library.

| Option  | Type               | Default     | Purpose                                                                                 |
| ------- | ------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `icons` | `SanityIconName[]` | `undefined` | Icons an author may choose from, in the order they are listed. Every icon when omitted. |

A field accepts the same option under `options`, where it replaces the set the plugin was given.

<br />

## Exported Types

These types are exported for typing your own configuration and for querying stored icons outside the Studio.

Configuration you supply:

| Type                   | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `SanityIconName`       | The name of an icon in the installed Lucide version.    |
| `SanityIconOptions`    | The `options` an icon field accepts.                    |
| `SanityIconDefinition` | The shape of a field or array member of type `icon`.    |
| `SanityIconConfig`     | The full plugin configuration accepted by `iconPlugin`. |

Content the dataset stores:

| Type         | Purpose                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `SanityIcon` | A stored icon, holding the name it was chosen by and the shapes it draws. Available from either import path. |

<br />

## Acknowledgements

Icons come from [Lucide](https://lucide.dev), distributed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE). Icons for controls the Studio already draws come from `@sanity/icons` so they match their surroundings.

<br />
<br />

<div align="center">
  <p><strong>Built alongside <a href="https://cairn.driftime.com">Cairn</a>, a starting point for responsible web experiences.</strong></p>
  <p>Part of a suite of Sanity Studio plugins by Driftime®</p>
  <p><a href="https://github.com/driftime/sanity-plugin-handbook">Handbook</a> · <a href="https://github.com/driftime/sanity-plugin-icon">Icon</a></p>
</div>

<br />

<div align="center">
  <a href="https://driftime.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://driftime.com/driftime-github-logo-dark.svg" />
      <source media="(prefers-color-scheme: light)" srcset="https://driftime.com/driftime-github-logo.svg" />
      <img src="https://driftime.com/driftime-github-logo.svg" alt="Driftime® Logo" width="100" />
    </picture>
  </a>
</div>
