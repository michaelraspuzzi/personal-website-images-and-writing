// ---------------------------------------------------------------------------
// Everything on the site comes from this file. Edit it, save, and the page
// updates. The person "Sam Example" below is made up: replace all of it.
//
// How the page works
//   The home page starts as one sentence (`intro`). Some words in it are
//   links to sections. Clicking one unfurls that section below and swaps the
//   big image at the top for the section's image. Sections can link to more
//   sections, so the page grows like a story the reader chooses.
//
// Writing text (in `intro` and in section blocks)
//   {{words->sectionId}}           a word that opens another section
//   [words](https://url)           a normal link, opens in a new tab
//   [words](https://url|/images/x.webp)
//                                  a link that shows a small image preview
//                                  when hovered
//
// Images
//   Put them in /public/images and refer to them as "/images/name.webp".
//   Wide photos (about 2:1 or 16:9) look best in the header. Any of .jpg,
//   .png, .webp, .svg works; `npm run images` converts photos to small .webp.
// ---------------------------------------------------------------------------

export type Block =
  | { p: string } // a paragraph
  | { list: string[] } // a bulleted list
  | { quote: string; by: string } // a quote with who said it
  | { button: string }; // a button that opens your contact link or form

export type Section = {
  id: string; // short, unique, no spaces: used in {{words->id}}
  label: string; // shown as a tooltip and to search engines
  image: string; // header image while this section is on screen
  blocks: Block[];
};

export const site = {
  // Who you are
  name: "Sam Example",
  firstName: "Sam",
  lastName: "Example",
  title: "Sam Example · Studio, community and workshops", // browser tab title
  description:
    "Sam Example runs Tide Studio and the Night Builders community, and designs hands-on workshops for teams.",
  jobTitle: "Founder, Tide Studio",
  topics: ["Climate hardware", "Community building", "Workshops", "Education"],

  // Your live address. You can also set NEXT_PUBLIC_SITE_URL where you deploy.
  url: "https://example.com",
  // Bump this when you change the copy (used by search engines).
  updated: "2026-11-15",

  // The first image people see, and its description for screen readers.
  homeImage: "/images/home.svg",
  homeImageAlt: "Sam Example with friends at a weekend build",

  // The opening sentence. Every {{word->id}} must match a section id below.
  intro:
    "Hi, I'm Sam. I help people {{build things they care about->why}} through a {{studio->studio}}, a {{community->community}}, and {{hands-on workshops->workshops}}.",

  // The contact button in the footer and every { button } block.
  // Use a mailto:, a Calendly/Cal.com link, or any form URL.
  // Or set tallyFormId (from tally.so/r/<id>) to open a Tally popup instead.
  contact: {
    label: "👋 Say hi",
    href: "mailto:hello@example.com",
    tallyFormId: "",
  },

  // Footer links. Use "x" as the label to show the X logo instead of text.
  social: [
    { label: "x", href: "https://x.com/example" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/example" },
    { label: "Writing", href: "https://example.com/writing" },
  ],

  // Optional: organizations you run, for search engines (can be empty).
  organizations: [
    {
      name: "Tide Studio",
      url: "https://example.com/tide",
      description: "A small studio that helps people build climate hardware.",
    },
    {
      name: "Night Builders",
      url: "https://example.com/night-builders",
      description: "A monthly meetup for people building after hours.",
    },
  ],
};

export const sections: Section[] = [
  {
    id: "why",
    label: "Why",
    image: "/images/why.svg",
    blocks: [
      {
        p: "Most of what I know I learned by making things with other people: late nights, broken prototypes, and the friend who knew how to fix them.",
      },
      {
        p: "I want more people to have that, wherever they live and whatever they studied. So I {{started a studio->studio}}.",
      },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    image: "/images/studio.svg",
    blocks: [
      {
        p: "I run {{Tide Studio->tide}}, a small studio for people who want to build hardware for the climate.",
      },
    ],
  },
  {
    id: "tide",
    label: "Tide Studio",
    image: "/images/tide.svg",
    blocks: [
      {
        p: "We run {{residencies->residencies}} and {{weekend builds->builds}}, and we ship a few experiments of our own, like a [water sensor kit](https://example.com/sensor|/images/thumb-sensor.svg) and a [repair map](https://example.com/repair|/images/thumb-map.svg).",
      },
    ],
  },
  {
    id: "residencies",
    label: "Residencies",
    image: "/images/residencies.svg",
    blocks: [
      {
        p: "Residents spend eight weeks taking one idea from sketch to working prototype, building in public with a small cohort.",
      },
      {
        list: [
          "[Priya turned a class project into a pilot with her city](https://example.com/priya|/images/thumb-priya.svg)",
          "[Leo built a solar dryer that three farms now use](https://example.com/leo|/images/thumb-leo.svg)",
          "[The spring cohort open-sourced five designs](https://example.com/spring|/images/thumb-spring.svg)",
        ],
      },
      {
        quote: "Building next to other people kept me going on the weeks I wanted to quit.",
        by: "Priya, resident",
      },
      { p: "We also host {{weekend builds->builds}}." },
    ],
  },
  {
    id: "builds",
    label: "Weekend builds",
    image: "/images/builds.svg",
    blocks: [
      {
        p: "Short, hands-on events where anyone can show up and leave with something that works. Recent ones:",
      },
      {
        list: [
          "[A three-hour soldering night for first-timers](https://example.com/solder|/images/thumb-solder.svg)",
          "[A 24-hour build at the community garden](https://example.com/garden|/images/thumb-garden.svg)",
        ],
      },
      { p: "None of it works without {{good partners->partners}}." },
    ],
  },
  {
    id: "partners",
    label: "Partners",
    image: "/images/partners.svg",
    blocks: [
      {
        p: "We work with makerspaces, universities, and companies that lend tools, space, and mentors.",
      },
      {
        quote: "We sent two engineers for a weekend and hired one of the teams.",
        by: "Dana, hardware lead",
      },
      { p: "I also {{bring people together->community}}." },
    ],
  },
  {
    id: "community",
    label: "Community",
    image: "/images/community.svg",
    blocks: [
      {
        p: "I host [Night Builders](https://example.com/night-builders), a monthly meetup for people who build things after their day job. It's grown to 1,200 members in four cities, and we've run {{40 events->events}} so far.",
      },
    ],
  },
  {
    id: "events",
    label: "Events",
    image: "/images/events.svg",
    blocks: [
      { p: "A few favorites from this year:" },
      {
        list: [
          "[Demo night at the old train depot](https://example.com/demo|/images/thumb-demo.svg)",
          "[Bike repair and pizza](https://example.com/bikes|/images/thumb-bikes.svg)",
        ],
      },
      { p: "I also run {{workshops for teams->workshops}}." },
    ],
  },
  {
    id: "workshops",
    label: "Workshops",
    image: "/images/workshops.svg",
    blocks: [
      {
        p: "I design hands-on workshops for teams that want to learn by building, from a single afternoon to a few days.",
      },
      {
        list: [
          "1-2 hour workshops and talks",
          "1 day build sprints",
          "2-3 day intensives",
        ],
      },
      { button: "Ask about a workshop" },
      { p: "{{See what people say.->testimonials}}" },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    image: "/images/testimonials.svg",
    blocks: [
      {
        quote: "The most useful day our team spent all year.",
        by: "Morgan, engineering manager",
      },
      { quote: "We still use what we built.", by: "Riley, founder" },
      { button: "Work with me" },
    ],
  },
];
