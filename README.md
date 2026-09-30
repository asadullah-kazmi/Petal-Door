# PetalDoor Shopify theme

Local theme-development workspace connected to `mawfwd-ny.myshopify.com`. The starting code is the store's live **Horizon** theme, pulled on September 30, 2026.

## Start developing

Requirements: Node.js 20+ and Shopify CLI. This computer is already authenticated to the store.

```powershell
npm run dev
```

Open the preview URL printed by Shopify CLI. Changes to local theme files are uploaded to a temporary development theme and hot-reloaded; they do not replace the live theme.

## Validate and share

```powershell
npm run check
npm run share
```

`npm run share` creates an unpublished theme and returns a review link. Publishing to production should only be done as a separate, deliberate step after review.

## Working with Claude

Open this folder in Claude Code and describe the section or experience you want to build. `CLAUDE.md` gives Claude the project structure, validation workflow, and production-safety rules. Useful prompts include:

- “Redesign the home-page hero in `sections/` to match this reference, keep all content editable, then run Theme Check.”
- “Create a reusable product-benefits section with responsive styling and a Horizon-compatible preset.”
- “Start the Shopify development preview and fix the mobile header without changing desktop behavior.”

Commit working checkpoints with Git before large redesigns so changes remain easy to review and undo.

