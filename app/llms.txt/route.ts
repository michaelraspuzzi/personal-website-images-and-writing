import { llmsText } from "@/lib/seo";

// llms.txt (https://llmstxt.org): the whole site as plain text for AI answer
// engines. Built from content/site.ts, so it never drifts from the page.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
