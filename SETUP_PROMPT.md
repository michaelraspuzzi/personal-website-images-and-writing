# Setup agent prompt

Paste everything below the line into Claude Code, Cursor, Codex or any coding
agent that is open in this folder. It will interview you, fill in
`content/site.ts`, bring in your photos, and check the site works. Plan on
20–40 minutes. Have a few photos of yourself and your work handy.

---

You are helping me set up my personal website from this template. It's a
Next.js site where the home page starts as one sentence about me, and some
words in it can be clicked to unfurl the next part of my story. Each part has
its own header photo that crossfades in.

**Read these first:** `README.md`, `content/site.ts` (all content lives here,
and the comment at the top explains the text syntax), and skim `app/page.tsx`.
Don't change `app/page.tsx` or `lib/` unless I ask for a design change.

## How to work with me

- Interview me. Ask **one topic at a time**, a few short questions per
  message, and wait for my answers. Don't ask everything at once.
- Offer examples and drafts. Most people find it easier to react to a draft
  than to write from scratch. When I give rough notes, turn them into short,
  plain, first-person sentences in my voice, and show me before saving.
- Keep the copy short: one to three short paragraphs per section. Plain words,
  no buzzwords, no "passionate about", no em dashes.
- Only use facts I give you. Never invent numbers, quotes, names, employers or
  links. If something is missing, ask or leave it out.
- Quotes and testimonials must be real things people said. Ask me who said
  each one and how they want to be named (e.g. "Dana, hardware lead").
- Save progress to `content/site.ts` after each topic so nothing is lost.

## The interview

Go through these in order. Skip anything I say I don't want.

1. **Basics.** My name, how I want to be described in one line (for search
   results and link previews), my role or title, 3–6 topics I want to be known
   for, and my domain if I have one (fine to leave `example.com` for now).

2. **The opening sentence.** This is the most important line on the site.
   Help me write one sentence (two at most) that says who I am and what I'm
   doing, with **2–4 phrases that will become clickable**, one per main part
   of my life or work (e.g. a company, a community, a practice, a cause).
   Offer me 3 different drafts to choose from or mix.

3. **The story map.** For each clickable phrase, ask what's behind it. Sketch
   the sections as a short tree and show it to me before writing, like:

   ```
   intro
   ├─ "build things"   -> why
   ├─ "studio"         -> studio -> tide -> residencies -> builds -> partners
   ├─ "community"      -> community -> events
   └─ "workshops"      -> workshops -> testimonials
   ```

   Aim for 5–12 sections total. Each section should end by linking onward
   (`{{phrase->nextId}}`) so the reader can keep going, and the last section
   on each branch can end with a contact button (`{ button: "Work with me" }`).

4. **Section by section.** For each section: the text, any links (projects,
   articles, events) and whether each link should show a hover preview image,
   any lists, and any real quotes.

5. **Photos.** Ask me to put my photos in `public/images/` (or tell you
   where they are on my computer so you can copy them in). Then:
   - Run `npm run images` to make small `.webp` versions.
   - Look at each photo (open it if you can view images) and suggest which
     one fits which section. Wide photos, roughly 2:1 or 16:9, work best in
     the header. Ask me to confirm.
   - The first image (`homeImage`) should be a good photo of me, ideally with
     other people or doing the work. Ask me for a short description of it
     for `homeImageAlt`.
   - Small hover previews can use the same photos or screenshots.
   - Delete the placeholder `.svg` files in `public/images/` that are no
     longer used, and the original `.jpg`/`.png` files once the `.webp`
     versions are in use (ask first).

6. **Contact and links.** How people should reach me: an email (`mailto:`),
   a booking link (Calendly, Cal.com) or a form. If I use Tally, put the form
   id in `tallyFormId`. The footer label (default "👋 Say hi"). Footer links:
   X (use label `"x"` for the logo), LinkedIn, writing, GitHub or anything
   else.

7. **Organizations (optional).** Companies or groups I run, with a URL and
   one-line description, so search engines connect them to me.

## When the content is in

1. Set `updated` in `content/site.ts` to today's date and `title` to
   something like "Name · what you do".
2. Run `npm install` if `node_modules` is missing, then `npm run check`,
   and fix every problem it reports.
3. Run `npm run lint` and `npm run build` and fix any errors.
4. Start `npm run dev`, open http://localhost:3000, and click through every
   phrase. Check each section opens, each image loads, hover previews show,
   the footer links work, and it reads well on a phone-width window. Show me
   a screenshot if you can take one.
5. Read the whole site back to me as plain text (it's at
   http://localhost:3000/llms.txt) and ask if anything sounds off.
6. If I have a logo or small square photo for the browser tab, save it as
   `app/icon.png` (Next.js picks it up automatically).
7. Ask if I want to deploy. If yes, the simplest path is: push this folder
   to a new GitHub repo, then import it at vercel.com/new (or run
   `npx vercel`), and set `NEXT_PUBLIC_SITE_URL` to my domain. Walk me
   through connecting the domain. Don't push or deploy without my yes.

Start now with step 1 of the interview.
