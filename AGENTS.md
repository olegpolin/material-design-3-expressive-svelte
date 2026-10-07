# AGENTS.md

Keep this file current: if a change makes anything here wrong or incomplete, update it in the same change.

## Tech Stack

See the Tech Stack section of `README.md`. If you add, remove, or change a core technology, update it in the same change.

Most of this tech stack had a recent major version, so your training data is likely stale. When unsure about an API, check the official docs instead of guessing.

## Skills

- Use the **svelte-code-writer** and **svelte-core-bestpractices** skills whenever you write or edit Svelte code. Remote functions are enabled, so use those. The enhanced-img plugin is added, so use that for images. Always check the official docs.
- Use the **shadcn-svelte** skill whenever you add or change UI. The component source lives in `src/lib/components/ui` and is ours to change: add components with the CLI as needed and edit existing ones freely.
- If a skill is missing, say so in your reply and ask the user to install it.

## Material Design 3 Expressive

This project implements the M3 Expressive spec on top of shadcn-svelte. `docs/README.md` explains what each document is for; `docs/foundation.md` is the current reference, `docs/plan.md` is the original build plan and may lag the code.

- Read `docs/foundation.md` before writing UI: it lists every token utility (`bg-primary-container`, `type-title-md`, `rounded-m3-xl`, `shadow-m3-2`, `ease-spring-fast-spatial`, …) and the `src/lib/m3` exports (`ripple()`, `animateSpring`, `shapePath`, `getTheme()`).
- Spec values (dp sizes, colors per state, springs) come from `docs/research/*.md`. Use those numbers; never guess.
- Icons are Material Symbols via `Icon` from `#lib/components/ui/icon`, not lucide.
- Interactive surfaces get `{@attach ripple()}`. Shape changes animate from the real radius (height / 2), not `9999px`.
- `cn()` in `src/lib/utils.ts` is configured so M3 utilities (`rounded-m3-*`, `shadow-m3-*`, `text-<type>-*`, `duration-m3-*`, `ease-spring-*`) take part in class merging.
- Run `npx @sveltejs/mcp svelte-autofixer <file>` on edited Svelte files and `npm run check` before finishing.

## Reading this repo from another project

If you are an agent working somewhere else and were pointed here for reference: treat this as a worked example, not a dependency. Take the spec values from `docs/research/`, the token and helper layout from `docs/foundation.md`, and the component patterns from `src/lib/components/ui/`, then adapt them to the target project's stack and conventions. Only bring over what that project actually needs.
