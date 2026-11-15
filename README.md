# personal-website-images-and-writing

A personal website that reads like a short story. The home page starts as one
sentence about you. Some words in it are clickable; each one unfurls the next
part of your story below, glides it into view, and crossfades the big header
photo to match. Readers choose their own path through your work.

Everything on the page comes from one file, [`content/site.ts`](content/site.ts),
so you can make it yours without touching any React. The person in the
template, "Sam Example", is made up.

**Built with** Next.js 16, React 19, Tailwind CSS 4 and Framer Motion.

## What you get

- **Unfurling essay.** Click a phrase, a new section fades in line by line and
  the page glides it under the header image.
- **Photo per section.** The sticky header image crossfades as you open or
  scroll between sections.
- **Hover previews.** Clickable phrases and links can show a small image that
  follows the cursor.
- **Outline ticks.** Little marks on the left show each open section; hover one
  to preview its image, click to jump back.
- **Shareable section links.** Each section has its own link (`/#studio`).
  Send one and it opens at the start of that section; the back button or a
  reload brings readers back to where they were.
- **Contact button.** Email, a booking link, or a [Tally](https://tally.so)
  popup form.
- **Readable by search and AI engines.** The full text is in the HTML even
  before anything is clicked, plus JSON-LD structured data, a sitemap,
  `robots.txt` and an [`/llms.txt`](https://llmstxt.org), all generated from
  `content/site.ts`.

## Quick start

You need [Node.js](https://nodejs.org) 22.6 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click the underlined words.

## Set it up with an AI agent (recommended)

Open this folder in Claude Code, Cursor, Codex or another coding agent and
paste in [`SETUP_PROMPT.md`](SETUP_PROMPT.md). The agent interviews you one
topic at a time (your opening sentence, the story behind each phrase, your
photos, contact links), writes the copy with you, converts your photos, checks
everything works, and can help you deploy.

## Set it up by hand

1. Edit [`content/site.ts`](content/site.ts). The comment at the top explains
   everything. The text syntax is small:

   | Write | Get |
   | --- | --- |
   | `{{my studio->studio}}` | a phrase that opens the section with id `studio` |
   | `[my app](https://...)` | a normal link (opens in a new tab) |
   | `[my app](https://...\|/images/app.webp)` | a link with a hover preview image |

   Sections are made of blocks: `{ p }` paragraphs, `{ list }` bullets,
   `{ quote, by }` quotes and `{ button }` contact buttons.

2. Put your photos in `public/images/` and run `npm run images` to make
   small `.webp` copies. Wide photos (about 2:1) look best in the header.

3. Run `npm run check`. It catches phrases that point to sections that don't
   exist, sections nobody can reach, and missing images.

## Deploy

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
(or run `npx vercel`). Any host that runs Next.js works. Set
`NEXT_PUBLIC_SITE_URL` to your domain, or set `url` in `content/site.ts`.

## Project layout

```
content/site.ts      all text, images, links and contact settings
public/images/       header photos and hover previews
app/page.tsx         the unfurling page (no content in here)
app/layout.tsx       page title, link previews, structured data
app/llms.txt/        plain-text copy of the site for AI engines
lib/markup.tsx       the {{phrase->id}} and [link](url) syntax
lib/seo.ts           structured data and llms.txt, built from content
scripts/             npm run check, npm run images
SETUP_PROMPT.md      the agent interview prompt
```

## License

MIT. See [LICENSE](LICENSE).
