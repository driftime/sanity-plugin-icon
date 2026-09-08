# Project Guidelines

## Environment

**Package manager.** This project uses Bun. Install dependencies with exact versions using `-E`, and use `-D` for development dependencies.

**Dependencies.** Declare every package the plugin imports — anything undeclared is bundled into `dist` rather than imported from it. Runtime dependencies take a range overlapping the Studio's own so a consumer resolves one shared copy, while `peerDependencies` is for what must be a single instance, like `react` and `sanity`. The icon library data takes a range spanning its major, because Lucide ships every day or two and pinning it would mean either a release of this plugin per release of theirs or a permanently stale library. Nothing depends on which version resolves: a stored icon carries its own drawing, so the version only decides what is pickable, and an unrecognised entry is skipped rather than drawn.

**Scripts.** Prefer scripts defined in `package.json` over running tools directly — manual invocation is fine when needed, but project scripts should be the default.

**Linting.** Never add lint suppression comments without explicit approval. If a rule seems worth suppressing, suggest it and wait.

**Local development.** Changes are tested in consumer projects via [yalc](https://github.com/wclr/yalc). Run `bun run dev` to watch for changes and automatically rebuild and push to linked projects. For one-off pushes, build first then run `bunx yalc push`. To link a consumer project for the first time, run `bunx yalc add @driftime/sanity-plugin-icon` in that project.

## Oxlint Configuration

**Ordering.** Rules in `oxlint.config.ts` are sorted alphabetically. Maintain this when adding new ones.

**Configure before disabling.** Explore a rule's options before reaching for `"off"`. Only disable a rule when no configuration makes it useful.

**Comments.** Every rule must have a comment explaining why it's configured that way, not what the rule does.

**Tool boundaries.** Oxfmt owns formatting and Oxlint owns linting. Configure them so they don't overlap.

## Behaviour

**British English.** All written content uses British English — responses, comments, documentation, everything. The exception is code identifiers and programming keywords where the language demands American spelling, like `color` in CSS or `backgroundColor` in JavaScript.

**Stay focused.** Work only on what has been asked. If you spot issues elsewhere, flag them but don't fix them. Other people or agents may be working on other parts of the codebase.

**Match existing patterns.** Match the existing examples of whatever you're creating — structure, naming, spacing. Where none exist, or they conflict with each other, raise it before proceeding.

## Structure

**Directories.** `lib/` takes the helpers and factories; `config/` takes the definitions that bind them.

**Schema names.** A module registering a schema type exports its name alongside it, so the name lives with the thing it names rather than in a separate register. A stored shape the site also needs is the exception: its name and its interface live in `types.ts`, because a schema module imports `sanity` and nothing reachable from `render.ts` may.

**Studio and website parity.** Anything drawn in both the Studio and a consumer's site renders from one shared component, never its own markup. An adapter that restates the drawing has broken this, however tidy the directory looks.

**Two entry points.** `index.ts` serves the Studio and `render.ts` serves the consumer's site. Nothing reachable from `render.ts` may import `sanity` or `@sanity/ui`, so Studio code cannot reach a page bundle by construction rather than by trusting a bundler to shake it out. A helper needed by both sides belongs in `lib/` and must stay free of Studio imports.

**The picker's grid is hand-rolled deliberately.** `sanity` exports `CommandList`, its own virtualised keyboard-navigable list, and it is the wrong shape here: its navigation is one-dimensional, so a grid of eight columns would have to be fed to it as rows, leaving its active index, focus ring and listbox semantics describing rows rather than icons. It is also `@internal` with no plugin-facing contract, unlike `FormField`, which Sanity documents for custom inputs. Don't swap the window for it.

**Icons.** Controls the Studio already draws take their icons from `@sanity/icons`, so they match their surroundings. The plugin's own iconography goes in `icons/`, inlined as components rather than pulled from an icon package.

**The stored format.** How an icon is stored is the plugin's own business. Parsing, serialising, and stega cleaning stay internal, and the public components take a whole stored field value rather than a piece of one — a consumer should never learn what the value contains.

**Public API.** `index.ts` and `render.ts` are the only entry points `package.json` exposes, so an `export` anywhere else is module scope, not a consumer contract. Treat a change to what either re-exports as breaking until proven otherwise.

**Cross-references.** The split describes where a thing is defined, not a layering that only points one way. The only hard constraint is that no import may close a module cycle.

## Code

**Naming.** Use complete, unabbreviated identifiers. Constants use camelCase like any other variable. Import specific exports by name rather than accessing them through a namespace. Use path aliases rather than relative paths.

**Prefixing.** Prefix what escapes into a consumer's namespace, and nothing else. Types carry `Sanity`, because a type floats free into a consumer's own definitions and needs to read as a stored-data shape there. Functions and values carry only the subject, since the package name already says Sanity — `iconPlugin`, not `sanityIconPlugin`. Internal names go without any prefix: inside a plugin whose whole subject is icons, the prefix says nothing. Internally it survives only where dropping it would collide with a name React or `sanity` already exports.

**Ordering.** When a definition establishes an order — a type, an interface, a schema — everything that consumes or mirrors it follows the same order, including destructuring, function parameters, component props, and query fields. Where a spread makes strict ordering impractical, the properties after the spread still respect the definition's order relative to each other.

**File structure.** Files follow a consistent top-to-bottom order: imports, type and interface definitions, constants, functions, then component functions. A helper that exists only to serve the file's principal definition sits immediately above it, even when that definition is a constant. A props type is the exception that proves it — it sits immediately above the component it types rather than with the other types, so a file holding several components reads as a run of type-and-component pairs.

**Absence.** Always use `undefined` to represent missing values. Only use `null` where something outside the codebase deals in it — a third-party API that requires it, or a React component's intentionally empty render.

**Existence checks.** Use `isDefined` rather than truthiness or a comparison against `undefined`. It already treats empty strings, arrays, and objects as absent, so it replaces a `.length` check rather than joining one — reserve `.length` for genuine counts. An array is absent unless one of its elements is present, which makes `isDefined([first, second, third])` the way to ask whether any one of several sources holds a value. Check genuine booleans directly.

**Destructuring.** When a function reads several properties off the same object, or reads one of them repeatedly, destructure them together at the top — `const { name, node } = value ?? {}` rather than a scattering of `value?.…` reads. A single access needs nothing, and optional chaining is fine in itself. Skip destructuring where it would discard a type guard's narrowing or force properties to be renamed around a collision.

**Abstraction.** Don't extract named constants for trivial or single-use values — a unit conversion reads better inlined than named, and a one-off options object belongs at its call site. Hoist only what is genuinely shared, configuration-like, or non-obvious.

**Styling.** The Studio loads theme tokens only, so styling comes from `@sanity/ui` primitives, with an inline `style` reserved for what those can't express. Prefer the Studio's CSS custom properties over hardcoded values, so the plugin follows the active theme. Components reaching a consumer's site carry no styling of their own and accept whatever the consumer passes.

## React

**Memoisation.** The plugin uses React 19 with React Compiler, which handles memoisation automatically. Never use `useMemo`, `useCallback`, or `React.memo`.

**The render path opts out.** Anything reachable from `render.ts` carries `"use no memo"`, because the compiler rewrites a component to call its memo cache hook and a consumer draws these inside a server component, where no hook can run. Without it a static render fails on an undefined React dispatcher, and only at prerender time.

**Props.** Derive component props from `ComponentProps<"element">` matching the root element, so standard attributes are inherited rather than redeclared. Export the props type, and spread `{...props}` onto that root element as the final attribute, after every explicit one, so consumer values win predictably.

**Wrapping components.** When wrapping an existing component, derive props from its type and use `Omit` for any props you're handling internally. This preserves the original component's type constraints, including discriminated unions.

**Conditional rendering.** Render conditional elements with `{condition && <Element />}`, never a ternary whose else branch is `undefined`. This applies to JSX children only — value ternaries such as `aria-current={isActive ? "page" : undefined}` stay as they are.

**Markup.** Reserve `ul`, `ol`, and `li` for genuine text lists. Card grids, icon groups, tab strips, and pagination are laid out with `div` and `span` — list semantics describe prose, not layout.

**DOM access.** Target elements with refs rather than ids and `querySelector`. When the element and the code acting on it live in different components, share the ref through a small client context. Ids used purely as CSS hooks are fine.

## TypeScript

**No `any`.** Prefer specific types over `unknown` wherever possible, and never use `any`.

**Inferred return types.** Let TypeScript infer them. An annotation earns its place only where it _is_ the contract — normalising several branch shapes into one, or typing a callback's parameters — or where a named type reads better on hover than an expanded anonymous object. The compiler asking for one is a prompt to look, not a reason on its own. Where it only compensates for a weak type upstream, fix that type.

## Documentation

**What to document.** JSDoc goes on utility functions, hooks, context providers, non-obvious constants — including any a `lib/` or `config/` factory returns — and interface properties. Types and interfaces in `lib/` also take definition-level JSDoc. Exempt: React components and their prop types, Sanity schema types and their properties (schema `description` strings cover those), and constants that are framework conventions or self-evident from context. Every exemption lapses for anything an entry point re-exports, since a consumer reads the published declarations and never the source — those take a full block, and the build additionally rejects any of them missing an `@public` release tag.

**How to document.** Describe what code accomplishes, not how. Summaries should survive refactoring — avoid referencing specific function names or implementation details. Always include `@param` and `@returns` tags, without type annotations. A function that returns nothing takes no `@returns`.

**Length.** Documentation earns its length from how surprising the code is, not how important it is. A second sentence belongs only where the behaviour would catch someone out, and it makes its point once. Keep rationale out of `@param` and `@returns`, which describe values.

**Layout.** A block holding a single sentence sits on one line wherever the print width allows, whatever it documents. Tags force the multi-line form.

**Comments.** JSDoc carries the documentation here, and inline `//` comments stay rare by design — never add one to narrate what a line does or to restate the code in prose. Keep them for the cases where a developer genuinely needs something the code cannot show: a deliberate omission that reads as a mistake, a constraint that isn't visible locally, or the reasoning behind a decision that would otherwise invite an innocent-looking change. Lint suppressions must always state why.

## Sanity

**Descriptions.** Every field should have a `description` for CMS authors. Write descriptions that are consistent in tone and structure with the existing ones across the codebase.

**Type safety.** Use `defineField` for all fields and `defineArrayMember` within array `of` properties. Use the `satisfies` operator to keep field names synchronised with their TypeScript types. An inline `defineArrayMember` needs a singular `name`. One that references a type registered elsewhere takes that type's own name instead — a differing `name` re-registers the type under it, and it is the `name` that gets stored as `_type` on the value.

**Previews.** All document and object types should have preview configuration. Use `select` to map document fields to preview properties, and add `prepare` when the selected values need transformation or fallback logic. Objects are selectable in the CMS just as documents are, so they need meaningful previews.

**Titles.** Don't define a `title` on fields or array members unless title-casing the `name` would mangle it — abbreviations like "SEO" or "URL" are the typical exception.

**Data strings.** Sanity strings carry invisible stega characters on any fetch that doesn't opt out. Rendering one as text is safe, but a string that gets parsed, compared, or interpolated into a URL, key, or filter must pass through `stegaClean` first — otherwise it fails silently, and only in Presentation mode.

## Releasing

To create a new release, follow these steps in order:

1. Bump the version in `package.json` following semver.
2. Commit the version bump.
3. Draft a changelog and present it for review before proceeding.
4. Create a GitHub release with `gh release create v<version> --title "v<version>" --notes "<changelog>"`. Add `--prerelease` for pre-1.0 versions. This creates the tag, so any later amend to the release commit has to move the tag with it.
5. Stop and hand over. Publishing to npm is done by hand, once everything above is settled, because npm asks for a one-time password. Amend the release notes with `gh release edit v<version> --notes-file <file>` if anything needs correcting first.
