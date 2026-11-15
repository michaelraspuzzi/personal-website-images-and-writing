"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections, site, type Block } from "@/content/site";
import { render, type Renderers } from "@/lib/markup";
import { homeJsonLd, ld } from "@/lib/seo";

// ---------------------------------------------------------------------------
// The page is one sentence that unfurls. Each section opens when one of its
// trigger words is clicked. Sections always render in the order of
// content/site.ts. You shouldn't need to edit this file to change content.
// ---------------------------------------------------------------------------

const byId = Object.fromEntries(sections.map((s) => [s.id, s]));

// Section links: the URL hash names the section in view (/#studios), and the
// open sections are remembered for the tab. replaceState, so reading the
// essay doesn't fill the back button with one entry per section.
const STORE = "home:opened";
const readHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return byId[id] ? id : null;
};
const setHash = (id: string | null) => {
  const url = id ? `#${id}` : window.location.pathname + window.location.search;
  if ((id ? `#${id}` : "") !== window.location.hash) history.replaceState(history.state, "", url);
};
const readOpened = (): string[] => {
  try {
    const ids = JSON.parse(sessionStorage.getItem(STORE) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id) => byId[id]) : [];
  } catch {
    return [];
  }
};
const saveOpened = (ids: Set<string>) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify([...ids]));
  } catch {}
};

const textCls = "text-[17px] md:text-[22px] leading-[1.6] tracking-tight mb-5";
const linkCls = "underline underline-offset-4 hover:text-gray-500 transition-colors";
const Arrow = () => <span className="text-[10px] align-super ml-0.5">↗</span>;

// The contact link: a Tally popup if a form id is set, otherwise a plain link.
function Contact({ className, children }: { className: string; children: React.ReactNode }) {
  const { tallyFormId, href } = site.contact;
  if (tallyFormId)
    return (
      <button
        data-tally-open={tallyFormId}
        data-tally-layout="modal"
        data-tally-emoji-text="👋"
        data-tally-emoji-animation="wave"
        className={className}
      >
        {children}
      </button>
    );
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function Blocks({ blocks, r }: { blocks: Block[]; r: Renderers }) {
  return blocks.map((b, i) => {
    if ("p" in b)
      return (
        <p key={i} className={textCls}>
          {render(b.p, r)}
        </p>
      );
    if ("list" in b)
      return (
        <ul
          key={i}
          className="list-disc pl-5 space-y-2 text-[17px] md:text-[22px] leading-[1.45] tracking-tight mb-5"
        >
          {b.list.map((item, j) => (
            <li key={j}>{render(item, r)}</li>
          ))}
        </ul>
      );
    if ("quote" in b)
      return (
        <blockquote
          key={i}
          className="border-l-2 border-black pl-4 my-6 text-[16px] md:text-[19px] leading-[1.5] tracking-tight"
        >
          <p className="italic">“{render(b.quote, r)}”</p>
          <footer className="text-gray-500 mt-1 not-italic text-[14px] md:text-[16px]">
            {b.by}
          </footer>
        </blockquote>
      );
    return (
      <p key={i} className={textCls}>
        <Contact className={`inline cursor-pointer ${linkCls}`}>
          {b.button}
          <Arrow />
        </Contact>
      </p>
    );
  });
}

// Words and links are real, stable components (not created inside Home on
// every render), so a click whose press and release land on different
// renders isn't lost.
type Hover = (src?: string) => Partial<React.HTMLAttributes<HTMLElement>>;
const PageCtx = createContext<{
  open: (id: string) => void;
  opened: Set<string>;
  hover: Hover;
}>({ open: () => {}, opened: new Set(), hover: () => ({}) });

// spans, not buttons, so a multi-word phrase wraps like normal text
function Word({ to, children }: { to: string; children: React.ReactNode }) {
  const { open, opened, hover } = useContext(PageCtx);
  const done = opened.has(to);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => open(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(to);
        }
      }}
      {...(done ? {} : hover(byId[to]?.image))}
      className={
        done
          ? "cursor-pointer hover:text-gray-500 transition-colors"
          : "cursor-pointer underline decoration-2 underline-offset-4 decoration-black hover:decoration-gray-400 hover:text-gray-500 transition-colors"
      }
    >
      {children}
    </span>
  );
}

function Ext({ href, thumb, children }: { href: string; thumb?: string; children: React.ReactNode }) {
  const { hover } = useContext(PageCtx);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...hover(thumb)} className={linkCls}>
      {children}
      <Arrow />
    </a>
  );
}

const ctx: Renderers = { W: Word, A: Ext };

// The same essay as plain text and links, for the hidden full-text copy.
const plainCtx: Renderers = {
  W: ({ children }) => <>{children}</>,
  A: ({ href, children }) => <a href={href}>{children}</a>,
};

export default function Home() {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [tick, setTick] = useState<{ src: string; y: number } | null>(null);
  const [thumb, setThumb] = useState<{ src: string; x: number; y: number } | null>(null);
  const header = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);

  // Where content may start: just below the sticky image.
  const headerBottom = () => header.current?.getBoundingClientRect().bottom ?? 0;
  const GAP = 10;

  // One eased scroll we control (native smooth scroll varies by browser and
  // can't be timed with the text fade). Any wheel/touch/key input cancels it.
  const tween = useRef(0);
  const glide = useCallback((to: number, instant = false) => {
    cancelAnimationFrame(tween.current);
    const from = window.scrollY;
    const dist = to - from;
    if (Math.abs(dist) < 1) return;
    const reduce = instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 0 : Math.min(1400, 850 + Math.abs(dist) * 0.3);
    lockUntil.current = Date.now() + dur + 120;
    if (!dur) return window.scrollTo(0, to);
    const t0 = performance.now();
    const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2; // ease-in-out sine
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1;
      window.scrollTo(0, from + dist * ease(t));
      if (t < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const stop = () => {
      cancelAnimationFrame(tween.current);
      lockUntil.current = 0;
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);

  // Put the section's first line right under the image. If the page is too
  // short to scroll that far, grow a spacer just enough to allow it.
  const scrollToSection = useCallback(
    (id: string, instant = false) => {
      const el = document.querySelector<HTMLElement>(`[data-section="${id}"]`);
      const sp = spacer.current;
      if (!el || !sp) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const contentEnd =
        sp.parentElement!.getBoundingClientRect().bottom + window.scrollY - sp.offsetHeight;
      const target = top - headerBottom() - GAP;
      const need = target + window.innerHeight - contentEnd;
      sp.style.height = `${Math.max(0, Math.ceil(need))}px`;
      glide(target, instant);
    },
    [glide],
  );

  // A newly opened section is measured and scrolled to in the same frame it
  // mounts, before paint, so the click moves the page immediately.
  const pending = useRef<{ id: string; instant: boolean } | null>(null);
  useLayoutEffect(() => {
    if (!pending.current) return;
    const { id, instant } = pending.current;
    pending.current = null;
    scrollToSection(id, instant);
    if (!instant) return;
    // On page load the browser/Next can reset scroll after hydration, so jump
    // again once things settle, unless the reader has already scrolled.
    let moved = false;
    const stop = () => (moved = true);
    const opts = { passive: true, once: true } as const;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop, { once: true });
    [60, 250, 600].forEach((ms) =>
      setTimeout(() => {
        if (moved) return;
        lockUntil.current = Date.now() + 200;
        scrollToSection(id, true);
      }, ms),
    );
  }, [opened, scrollToSection]);

  const open = (id: string) => {
    if (!byId[id]) return console.warn(`No section with id "${id}" in content/site.ts`);
    setActive(id);
    setThumb(null);
    setHash(id);
    if (opened.has(id)) return scrollToSection(id);
    pending.current = { id, instant: false };
    setOpened((prev) => {
      const next = new Set(prev).add(id);
      saveOpened(next);
      return next;
    });
  };

  // Every section has its own link (/#studios). Opening one puts it in the
  // URL, so it can be shared, and coming back (back button, reload, reopened
  // tab) lands at the start of that section. The list of sections the reader
  // had open is kept for the tab in sessionStorage: a few bytes, gone when
  // the tab closes. A shared link opens just its own section.
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    const restore = () => {
      const id = readHash();
      const next = new Set(readOpened());
      if (id) next.add(id);
      if (!next.size) return;
      setOpened(next);
      saveOpened(next);
      if (id) {
        setActive(id);
        lockUntil.current = Date.now() + 300;
        pending.current = { id, instant: true };
      }
    };
    restore();
    const onHash = () => {
      const id = readHash();
      if (!id) return;
      setActive(id);
      pending.current = { id, instant: false };
      setOpened((prev) => {
        const next = new Set(prev).add(id);
        saveOpened(next);
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The image follows whichever open section sits under the sticky image.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (Date.now() < lockUntil.current) return;
        if (window.scrollY < 24) {
          setHash(null);
          return setActive(null);
        }
        const line = headerBottom() + (window.innerHeight - headerBottom()) * 0.35;
        let current: string | null = null;
        const all = document.querySelectorAll<HTMLElement>("[data-section]");
        all.forEach((el) => {
          if (el.getBoundingClientRect().top <= line) current = el.dataset.section!;
        });
        // at the very bottom the last section can't reach the line, so it wins
        const atBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom && all.length) current = all[all.length - 1].dataset.section!;
        setHash(current);
        setActive(current);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const hover: Hover = (src) =>
    src
      ? {
          onMouseEnter: (e: React.MouseEvent) => setThumb({ src, x: e.clientX, y: e.clientY }),
          onMouseMove: (e: React.MouseEvent) => setThumb({ src, x: e.clientX, y: e.clientY }),
          onMouseLeave: () => setThumb(null),
        }
      : {};

  const current = active ? byId[active] : null;
  const image = current?.image ?? site.homeImage;
  const visible = sections.filter((s) => opened.has(s.id));

  return (
    <PageCtx.Provider value={{ open, opened, hover }}>
      <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
        {/* Cursor-following preview (pointer devices only) */}
        <AnimatePresence>
          {thumb && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[100] pointer-events-none hidden md:block"
              style={{ left: thumb.x + 20, top: thumb.y - 110 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb.src} alt="" className="w-36 h-28 object-cover rounded-lg shadow-xl bg-gray-100" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-3xl mx-auto px-5 md:px-6">
          {/* Sticky image. Opaque, above the text, so text never shows through. */}
          <div ref={header} className="sticky top-0 z-20 bg-white pt-4 md:pt-6 pb-3">
            <div className="relative w-full h-[30vh] min-h-[170px] max-h-[384px] md:h-[38vh] rounded-2xl overflow-hidden bg-gray-100">
              <AnimatePresence initial={false}>
                <motion.div
                  key={image}
                  // The new image dissolves in on top while the old one stays
                  // opaque underneath (no grey dip), settling from a slight zoom.
                  initial={{ opacity: 0, scale: 1.04, zIndex: 1 }}
                  animate={{ opacity: 1, scale: 1, zIndex: 1 }}
                  exit={{ opacity: 1, zIndex: 0, transition: { duration: 1.1 } }}
                  transition={{
                    opacity: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
                    scale: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={current ? current.label : site.homeImageAlt}
                    className={`absolute inset-0 w-full h-full object-cover ${current ? "" : "object-[50%_35%]"}`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* soft edge so text fades out as it slides under the image */}
            <div className="absolute left-0 right-0 top-full h-2 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          </div>

          {/* Text */}
          <div className="relative z-0 pt-3 pb-24">
            <h1 className="sr-only">{site.name}</h1>
            <p className={textCls}>{render(site.intro, ctx)}</p>

            {sections.map(
              (s) =>
                opened.has(s.id) && (
                  <section key={s.id} data-section={s.id}>
                    {/* each block fades up in turn (see .unfurl in globals.css) */}
                    <div className="unfurl">
                      <Blocks blocks={s.blocks} r={ctx} />
                    </div>
                  </section>
                ),
            )}
            <div ref={spacer} aria-hidden />
          </div>

          {/* Full text of every section, in the HTML but never shown. Readers
              unfurl the essay by clicking; search and AI crawlers don't click,
              so without this they would only see the first sentence. */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(homeJsonLd) }} />
          <article hidden aria-hidden="true">
            {sections.map((s) => (
              <section key={s.id} id={`full-${s.id}`}>
                <h2>{s.label}</h2>
                <Blocks blocks={s.blocks} r={plainCtx} />
              </section>
            ))}
          </article>
        </div>

        {/* Side ticks, like a Notion or Substack outline: one per open section */}
        {visible.length > 0 && (
          <nav
            aria-label="On this page"
            className="fixed left-0 min-[880px]:left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col"
            onMouseLeave={() => setTick(null)}
          >
            {[{ id: null as string | null, label: "Home", image: site.homeImage }, ...visible].map((s) => (
              <button
                key={s.id ?? "home"}
                aria-label={s.label}
                aria-current={active === s.id ? "true" : undefined}
                onMouseEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setTick({ src: s.image, y: r.top + r.height / 2 });
                }}
                onClick={() => {
                  setTick(null);
                  if (s.id) return open(s.id);
                  setHash(null);
                  setActive(null);
                  glide(0);
                }}
                className="group cursor-pointer flex items-center h-[14px] pl-1 pr-1 min-[880px]:pl-2 min-[880px]:pr-4"
              >
                <span
                  className={`block h-[2px] rounded-full transition-all duration-300 ${
                    active === s.id
                      ? "w-3 min-[880px]:w-5 bg-black"
                      : "w-2 min-[880px]:w-3 bg-gray-300 group-hover:bg-gray-500 min-[880px]:group-hover:w-4"
                  }`}
                />
              </button>
            ))}
          </nav>
        )}

        {/* Image preview for the hovered tick */}
        <AnimatePresence>
          {tick && (
            <motion.div
              key="tick-preview"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0, top: tick.y }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16, top: { duration: 0.12 } }}
              className="fixed left-10 md:left-14 z-50 pointer-events-none -translate-y-1/2 hidden md:block"
              style={{ top: tick.y }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tick.src} alt="" className="w-44 h-[99px] object-cover rounded-lg shadow-xl bg-gray-100" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="max-w-3xl mx-auto px-5 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <Contact className="cursor-pointer text-[17px] md:text-[22px] tracking-tight hover:text-gray-500 transition-colors">
              {site.contact.label}
            </Contact>
            <div className="flex items-center gap-5">
              {site.social.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label === "x" ? "X" : undefined}
                  className="text-gray-400 hover:text-black transition-colors text-[17px]"
                >
                  {s.label === "x" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : (
                    s.label
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </PageCtx.Provider>
  );
}
