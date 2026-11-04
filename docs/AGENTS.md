# Instructions for AI assistants

Before proposing or making changes, inspect the existing codebase and [PROJECT_STATUS.md](PROJECT_STATUS.md), then read [PROJECT_MASTER_CONTEXT.md](PROJECT_MASTER_CONTEXT.md) as the main project reference. Review the roadmap and decision log for the current phase and outstanding choices. The master context records requirements; distinguish confirmed decisions, proposals, assumptions, and unverified information.

- Work only within the requested and agreed scope. The owner subsequently authorized a local frontend foundation; see the status and decision log for its limits. Do not initiate later integration or production work without an instruction to do so.
- Preserve working code and useful documentation. Avoid unrelated changes and inspect existing files before editing them.
- Respect the existing Shopify storefront, theme, images, and operations. Do not modify the store or make any production, hosting, DNS, tracking, or deployment changes without explicit approval.
- Prefer modular, maintainable HTML, CSS, and vanilla JavaScript. Avoid unnecessary frameworks and backend infrastructure; a custom backend requires a specific need and approval.
- Never put private Shopify credentials, access secrets, or other secrets in browser code, version control, or documentation. Treat any browser-accessible token as public and use only appropriately scoped public access.
- Treat Shopify as the source for live commerce data and the proposed custom content as independent; verify integration behavior instead of assuming it.
- Update the decision log, roadmap, status, and master context as appropriate when material decisions or verified progress change. Record dates and consequences; never claim that an unimplemented or unverified feature is complete.
- Do not invent product facts, cultural claims, brand history, testimonials, approvals, identifiers, or test results. Flag missing information and assumptions.

This file is intentionally inside `docs` at the owner's request. Some coding assistants only automatically discover `AGENTS.md` in ancestor directories of the files they are editing; for work outside `docs`, explicitly provide this file and the master context to the assistant or consult them manually. Its location alone does not guarantee project-wide automatic discovery.
