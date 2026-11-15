// Converts photos in public/images (jpg, jpeg, png, heic, tiff) to small .webp
// files next to them, at most 2000px wide. Originals are left in place so you
// can delete them yourself once you're happy. Run with: npm run images
// Then point content/site.ts at the new .webp names.
import { readdirSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const dir = "public/images";
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|heic|heif|tiff?)$/i.test(f));
if (!files.length) console.log("No .jpg/.png/.heic photos in public/images to convert.");
for (const f of files) {
  const out = join(dir, `${parse(f).name}.webp`);
  const info = await sharp(join(dir, f))
    .rotate() // respect phone orientation
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`${f} -> ${out} (${Math.round(info.size / 1024)} KB)`);
}
