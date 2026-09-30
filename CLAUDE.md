# PetalDoor Shopify theme

This repository is the local source for the Shopify store at `mawfwd-ny.myshopify.com`. It was pulled from the live **Horizon** theme (theme ID `185673253087`).

## Safety rules

- Never publish or push directly to the live theme.
- Never run `shopify theme push --live`, `shopify theme publish`, or use `--allow-live` unless the user explicitly requests a production deployment in the current conversation.
- Use `npm run dev` for normal development. Shopify CLI creates a temporary development theme and provides preview/theme-editor links.
- Use `npm run share` when the user needs a persistent unpublished preview.
- Before editing, inspect the relevant section, block, snippet, template, and referenced assets. Horizon uses theme blocks heavily; preserve its existing conventions.
- Keep merchant-editable content in section/block schema settings rather than hard-coding copy, images, colors, or product handles.
- Preserve Shopify editor compatibility: valid `{% schema %}` JSON, unique setting IDs, valid block/section presets, and dynamic sources.
- Do not expose secrets or add access tokens to tracked files. Authentication is handled by the logged-in Shopify CLI session.
- Do not overwrite unrelated merchant customizations in `config/settings_data.json`.

## Standard workflow

1. Run `npm run info` to confirm the target store.
2. Run `npm run dev` and use the returned local preview URL while developing.
3. Make focused changes in Liquid, JSON templates, CSS, and JavaScript.
4. Run `npm run check` and fix new errors before considering work complete.
5. Review `git diff` so only intended files are included.
6. Use `npm run share` for an unpublished review copy. Production publishing is a separate, explicit user action.

## Theme structure

- `layout/`: global HTML shells.
- `templates/`: JSON/Liquid page templates.
- `sections/`: page-level, merchant-configurable components.
- `blocks/`: reusable Horizon theme blocks.
- `snippets/`: small reusable Liquid fragments.
- `assets/`: CSS, JavaScript, icons, fonts, and images.
- `config/`: theme setting definitions and current store settings.
- `locales/`: storefront and theme-editor translations.

## Commands

```powershell
npm run dev      # temporary development theme with hot reload
npm run check    # Shopify Theme Check
npm run info     # confirm store and CLI configuration
npm run pull     # deliberately refresh from a selected remote theme
npm run share    # upload an unpublished preview theme
```

When a request is visually ambiguous, ask for brand direction or a reference before making broad design changes. For focused requests, implement directly and verify the result.

