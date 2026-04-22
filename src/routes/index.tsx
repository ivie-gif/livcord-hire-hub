import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatJobType, formatDate } from "@/lib/jobs";
import { MapPin, Briefcase, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Open Roles — Livcord" },
      {
        name: "description",
        content: "Discover open roles and apply in minutes. Curated jobs from Livcord.",
      },
      { property: "og:title", content: "Open Roles — Livcord" },
      {
        property: "og:description",
        content: "Discover open roles and apply in minutes.",
      },
    ],
  }),
  component: Index,
});

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  description: string;
  created_at: string;
};

function Index() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id,title,company,location,type,salary,description,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJobs((data ?? []) as Job[]);
        setLoading(false);
      });
  }, []);

  const filtered = jobs.filter((j) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Now hiring
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.05]">
            Find work that <span className="italic font-light">matters</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Browse open roles across our teams. Honest descriptions, fast applications,
            real humans on the other side.
          </p>

          <div className="mt-10 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, company, or location"
              className="pl-11 h-12 bg-card"
            />
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Open positions</h2>
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} role${filtered.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No roles match your search.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {filtered.map((job) => (
              <li key={job.id}>
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: job.id }}
                  className="group block py-6 hover:bg-accent/40 -mx-4 px-4 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-medium tracking-tight group-hover:underline underline-offset-4">
                          {job.title}
                        </h3>
                        <Badge variant="secondary" className="font-normal">
                          {formatJobType(job.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(job.created_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
