import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lumen Careers" },
      {
        name: "description",
        content: "We're a team building tools people love. Learn what we value.",
      },
      { property: "og:title", content: "About — Lumen Careers" },
      {
        property: "og:description",
        content: "We're a team building tools people love.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
        About us
      </p>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
        We build tools people love using.
      </h1>
      <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>
          Lumen is a small, focused team working on software that respects the
          humans using it. We ship thoughtfully, listen carefully, and treat
          hiring like the high-stakes decision it is — for both sides.
        </p>
        <p>
          If something here looks interesting, apply. We read every application,
          and we get back to you fast.
        </p>
      </div>
    </div>
  );
}
