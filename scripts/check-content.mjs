// Checks content/site.ts for the mistakes that break the page:
// links to sections that don't exist, duplicate ids, missing images,
// and sections nobody can reach. Run with: npm run check
import { existsSync } from "node:fs";
import { join } from "node:path";
import { sections, site } from "../content/site.ts";

const words = (s) => [...s.matchAll(/\{\{(.+?)->\s*([\w-]+)\s*\}\}/g)].map((m) => m[2]);
const thumbs = (s) => [...s.matchAll(/\]\([^)|\s]+\|([^)\s]+)\)/g)].map((m) => m[1]);
const texts = (sec) =>
  sec.blocks.flatMap((b) => ("p" in b ? [b.p] : "list" in b ? b.list : "quote" in b ? [b.quote] : []));

const problems = [];
const ids = new Set();
for (const s of sections) {
  if (ids.has(s.id)) problems.push(`Two sections use the id "${s.id}".`);
  if (!/^[\w-]+$/.test(s.id)) problems.push(`Section id "${s.id}" should have no spaces or symbols.`);
  ids.add(s.id);
}

const image = (src, where) => {
  if (src.startsWith("http")) return;
  if (!existsSync(join("public", src))) problems.push(`${where}: image ${src} is not in /public.`);
};
image(site.homeImage, "homeImage");

const reachable = new Set();
const visit = (text, where) => {
  for (const to of words(text)) {
    if (!ids.has(to)) problems.push(`${where}: {{...->${to}}} points to a section that doesn't exist.`);
    reachable.add(to);
  }
  for (const t of thumbs(text)) image(t, where);
};
visit(site.intro, "intro");
for (const s of sections) {
  image(s.image, `section "${s.id}"`);
  texts(s).forEach((t) => visit(t, `section "${s.id}"`));
}
for (const s of sections)
  if (!reachable.has(s.id)) problems.push(`Section "${s.id}" has no {{...->${s.id}}} pointing to it, so nobody can open it.`);

const placeholders = JSON.stringify({ site, sections }).match(/example\.com|Sam Example/g);
if (placeholders) console.log(`Note: ${placeholders.length} placeholder bits (example.com, Sam Example) are still in content/site.ts.`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in content/site.ts:\n- ${problems.join("\n- ")}\n`);
  process.exit(1);
}
console.log(`content/site.ts looks good: ${sections.length} sections, all reachable, all images found.`);
