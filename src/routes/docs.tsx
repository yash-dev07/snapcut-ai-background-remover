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
  component: Docs;
});

function Docs() {
  return <SiteLayout>docs</SiteLayout>;
}
