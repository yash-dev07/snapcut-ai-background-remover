import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Docs — SnapCut AI Background Removal API" },
      {
        name: "description",
        content:
          "SnapCut AI REST API reference: authenticate with an API key, POST an image URL, and receive a transparent PNG result URL. Rate limits and error codes included.",
      },
      { property: "og:title", content: "API Docs — SnapCut AI" },
      {
        property: "og:description",
        content: "Authenticate, POST an image, receive a transparent PNG URL. Full REST reference.",
      },
    ],
  }),
  component: Docs,
});

const request = `curl -X POST https://api.snapcut.ai/v1/remove \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://cdn.example.com/product.jpg",
    "output_format": "png"
  }'`;

const response = `{
  "id": "job_8f21c0",
  "status": "succeeded",
  "result_url": "https://cdn.snapcut.ai/tmp/job_8f21c0.png",
  "expires_at": "2026-08-20T17:05:00Z",
  "credits_used": 1,
  "processing_ms": 3120
}`;

const errors = [
  { code: "400", meaning: "Invalid payload — unsupported format or missing image_url." },
  { code: "401", meaning: "Missing or revoked API key." },
  { code: "413", meaning: "Image exceeds 10 MB or 5000×5000 pixels." },
  { code: "429", meaning: "Rate limit exceeded for this key." },
  { code: "5xx", meaning: "Processing failure — safe to retry with backoff." },
];

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <figure className="glass-card overflow-hidden">
      <figcaption className="border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </figcaption>
      <pre className="overflow-x-auto px-5 py-4 text-sm">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

function Docs() {
  return (
    <SiteLayout>
      <section className="hero-glow">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h1 className="text-4xl font-bold sm:text-5xl">
            SnapCut <span className="text-gradient">API</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            One endpoint, one request. Send an image URL and get back a transparent PNG hosted for
            24 hours.
          </p>

          <h2 className="mt-14 font-display text-2xl font-semibold">Authentication</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every request needs an <code className="text-foreground">Authorization</code> header with
            a key generated from your dashboard. Keys are scoped per environment and can be rotated
            at any time.
          </p>

          <h2 className="mt-12 font-display text-2xl font-semibold">Remove a background</h2>
          <div className="mt-5 space-y-6">
            <CodeBlock label="Request" code={request} />
            <CodeBlock label="200 Response" code={response} />
          </div>

          <h2 className="mt-12 font-display text-2xl font-semibold">Rate limits</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Free: 5 requests per day, 1 concurrent job.</li>
            <li>Pro Monthly: 120 requests per minute, 10 concurrent jobs.</li>
            <li>Credit packs: 60 requests per minute, billed one credit per success.</li>
          </ul>

          <h2 className="mt-12 font-display text-2xl font-semibold">Error codes</h2>
          <div className="glass-card mt-5 divide-y divide-border">
            {errors.map((error) => (
              <div key={error.code} className="flex gap-4 px-5 py-3 text-sm">
                <span className="w-12 shrink-0 font-mono text-primary">{error.code}</span>
                <span className="text-muted-foreground">{error.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
