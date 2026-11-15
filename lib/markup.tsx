import { Fragment, type ReactNode } from "react";

// Turns the small text syntax used in content/site.ts into pieces:
//   {{words->sectionId}}                  opens a section
//   [words](https://url)                  external link
//   [words](https://url|/images/x.webp)   external link with hover preview
export type Piece =
  | { kind: "text"; text: string }
  | { kind: "word"; text: string; to: string }
  | { kind: "link"; text: string; href: string; thumb?: string };

const TOKEN = /\{\{(.+?)->\s*([\w-]+)\s*\}\}|\[([^\]]+)\]\(([^)|\s]+)(?:\|([^)\s]+))?\)/g;

export function parse(src: string): Piece[] {
  const out: Piece[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    if (m.index! > last) out.push({ kind: "text", text: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "word", text: m[1], to: m[2] });
    else out.push({ kind: "link", text: m[3], href: m[4], thumb: m[5] });
    last = m.index! + m[0].length;
  }
  if (last < src.length) out.push({ kind: "text", text: src.slice(last) });
  return out;
}

export type Renderers = {
  W: (p: { to: string; children: ReactNode }) => ReactNode;
  A: (p: { href: string; thumb?: string; children: ReactNode }) => ReactNode;
};

export function render(src: string, { W, A }: Renderers): ReactNode {
  return parse(src).map((p, i) => (
    <Fragment key={i}>
      {p.kind === "text" ? (
        p.text
      ) : p.kind === "word" ? (
        <W to={p.to}>{p.text}</W>
      ) : (
        <A href={p.href} thumb={p.thumb}>
          {p.text}
        </A>
      )}
    </Fragment>
  ));
}

// Plain text with links written out, for llms.txt.
export function toPlain(src: string): string {
  return parse(src)
    .map((p) => (p.kind === "link" ? `${p.text} (${p.href})` : p.text))
    .join("");
}

// Every {{word->id}} target in a string, for checking content.
export const targets = (src: string) =>
  parse(src).flatMap((p) => (p.kind === "word" ? [p.to] : []));
