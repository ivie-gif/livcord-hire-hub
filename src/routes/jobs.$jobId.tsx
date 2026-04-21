import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatJobType, formatDate } from "@/lib/jobs";
import { MapPin, Briefcase, ArrowLeft, Calendar } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Job not found</h1>
      <p className="mt-3 text-muted-foreground">This role may have been removed.</p>
      <Link to="/" className="inline-block mt-6 underline underline-offset-4">
        Browse all jobs
      </Link>
    </div>
  ),
});

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  description: string;
  requirements: string;
  created_at: string;
};

const applicationSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  cover_letter: z.string().trim().max(5000).optional().or(z.literal("")),
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setJob(data as Job | null);
        setLoading(false);
      });
  }, [jobId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;

    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }
    if (resume.size > 10 * 1024 * 1024) {
      toast.error("Resume must be under 10MB");
      return;
    }

    setSubmitting(true);
    try {
      const ext = resume.name.split(".").pop() ?? "pdf";
      const path = `${job.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .upload(path, resume, { contentType: resume.type || "application/octet-stream" });
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("applications").insert({
        job_id: job.id,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        cover_letter: parsed.data.cover_letter || null,
        resume_path: path,
      });
      if (insertErr) throw insertErr;

      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Could not submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-12 w-3/4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!job) throw notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all roles
      </Link>

      <header className="border-b border-border pb-8 mb-10">
        <Badge variant="secondary" className="font-normal mb-4">
          {formatJobType(job.type)}
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
          {job.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{job.company}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {job.location}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {job.salary}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Posted {formatDate(job.created_at)}
          </span>
        </div>
      </header>

      <section className="prose prose-neutral max-w-none mb-12">
        <h2 className="text-xl font-semibold mb-3">About the role</h2>
        <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {job.description}
        </p>

        <h2 className="text-xl font-semibold mt-10 mb-3">Requirements</h2>
        <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {job.requirements}
        </p>
      </section>

      {/* Application form */}
      <section
        id="apply"
        className="border-t border-border pt-12 scroll-mt-24"
      >
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Apply for this role</h2>
        <p className="text-muted-foreground mb-8">
          Tell us a bit about yourself. We read every application.
        </p>

        {submitted ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold">Thanks for applying ✦</h3>
            <p className="mt-2 text-muted-foreground">
              We've received your application and will be in touch soon.
            </p>
            <Link
              to="/"
              className="inline-block mt-6 text-sm underline underline-offset-4"
            >
              Browse more roles
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF, DOC, max 10MB)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover letter (optional)</Label>
              <Textarea
                id="cover_letter"
                rows={6}
                value={form.cover_letter}
                onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
                placeholder="Why are you a great fit?"
              />
            </div>
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        )}
      </section>
    </article>
  );
}
