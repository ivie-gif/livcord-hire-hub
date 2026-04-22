import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/jobs";
import { Download, Trash2, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/control-panel/applications")({
  component: AdminApplicationsPage,
});

type Application = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_path: string;
  created_at: string;
  jobs: { title: string; company: string } | null;
};

function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*, jobs(title, company)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setApps((data ?? []) as unknown as Application[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function downloadResume(path: string) {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Couldn't generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function remove(app: Application) {
    if (!confirm(`Delete application from ${app.full_name}?`)) return;
    await supabase.storage.from("resumes").remove([app.resume_path]);
    const { error } = await supabase.from("applications").delete().eq("id", app.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Application deleted");
    load();
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Applications ({apps.length})</h2>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No applications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {apps.map((app) => (
            <li key={app.id} className="border border-border rounded-lg bg-card">
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium">{app.full_name}</h3>
                    <span className="text-sm text-muted-foreground">
                      → {app.jobs?.title ?? "Unknown role"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <a href={`mailto:${app.email}`} className="hover:text-foreground">
                        {app.email}
                      </a>
                    </span>
                    {app.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {app.phone}
                      </span>
                    )}
                    <span>{formatDate(app.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => downloadResume(app.resume_path)}>
                    <Download className="h-4 w-4 mr-1.5" /> Resume
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(app)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {app.cover_letter && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    {expanded === app.id ? "Hide cover letter" : "Show cover letter"}
                  </button>
                  {expanded === app.id && (
                    <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/90 border-t border-border pt-3">
                      {app.cover_letter}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
