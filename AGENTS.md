# Notes for coding agents

- All site content lives in `content/site.ts`. Edit content there, not in `app/page.tsx`.
- If the person wants to set up their site, follow `SETUP_PROMPT.md`: interview them one topic at a time, and never invent facts, quotes or links.
- After content changes run `npm run check`, then `npm run lint` and `npm run build`.
- Photos go in `public/images/`; `npm run images` converts them to `.webp`.
