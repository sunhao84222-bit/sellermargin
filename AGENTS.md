# SellerMargin Codex Instructions

This repository is SellerMargin, a multilingual ecommerce calculator website.

The product and engineering target specification is:

- `docs/SellerMargin_需求文档_V3.3.md`

Use that document as the long-term product specification, but do not rewrite the whole project just to match it in one pass. This project already has a working implementation. Prefer incremental, low-risk changes.

## Core product rules

- Do not add login.
- Do not add payment.
- Do not add a database.
- Do not add a real email backend.
- Do not add ads or AdSense.
- Do not add real Pro features.
- Do not add fake users, fake reviews, fake revenue claims, or guaranteed accuracy claims.
- Do not present default platform or payment fees as official, permanent, or guaranteed rates.
- Do not provide financial, tax, legal, accounting, or customs advice.

## Current implementation rules

- Preserve the existing working app unless the task explicitly asks for migration.
- Do not perform broad rewrites.
- Do not migrate i18n, package manager, testing framework, or routing architecture unless the task explicitly asks for it.
- The current project may use npm/package-lock. If so, keep using npm commands unless a task explicitly asks to switch to pnpm.
- If the repository already uses custom i18n, do not migrate to next-intl unless the task explicitly requests the next-intl migration.
- Keep calculation logic outside UI components.
- Calculation functions should return a structured response such as `{ result, errors, warnings }`.
- Keep default fee assumptions in `lib/defaultFees.ts` or a clearly named default-fee module.
- Use safe localStorage access only through client-safe hooks or `useEffect`; never access `window` or `localStorage` at module scope.

## Calculator rules

- Percent inputs use the user-facing convention: `30` means 30%, and calculation code converts it to `0.3`.
- If a user enters `0.3`, treat it as 0.3%, not 30%, and show a warning on blur when appropriate.
- Keep user-entered raw string values in form state and localStorage where input validation requires it.
- Do not silently convert empty strings to `0`.
- Show field-level errors for invalid required inputs.
- Optional empty numeric fields should be handled safely and must not create `NaN`.
- Do not change calculator formulas unless the task explicitly says to change them.
- When adding or changing formulas, update validation scripts or tests.

## SEO and compliance rules

- Do not add `noindex` to the homepage, calculator pages, or guide pages.
- 404 and error pages may use noindex.
- Keep canonical and hreflang logic consistent across `en`, `zh`, and `es`.
- Keep `x-default` pointing to the root path `/` unless a task explicitly changes this.
- Cookie/analytics behavior must remain opt-in. If analytics are not explicitly enabled, `CookieConsentBanner` should render nothing.
- Do not add analytics SDKs unless explicitly requested.

## Development workflow

Before making changes:
1. Read the relevant task carefully.
2. Check the current implementation.
3. Make the smallest safe change that satisfies the task.

After making changes, report:
1. Files changed.
2. What was changed and why.
3. How to manually verify the change.
4. Which checks were run.

Run the commands that match the current repository setup. If the project uses npm, prefer:

```bash
npm run test:calculators
npm run lint
npm run build
```

If the project is later migrated to pnpm, use the equivalent pnpm commands.

## Guardrails

- Do not delete working pages or existing translations.
- Do not remove existing calculator fields unless explicitly requested.
- Do not introduce backend services.
- Do not introduce paid services.
- Do not introduce major dependencies unless the task explicitly allows it.
- If a task seems to require a risky migration, first produce a short plan and identify risks before modifying files.
