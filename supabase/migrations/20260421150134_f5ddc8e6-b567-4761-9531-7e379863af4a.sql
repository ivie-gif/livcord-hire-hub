
DROP POLICY "Anyone can submit applications" ON public.applications;

CREATE POLICY "Anyone can submit applications for published jobs" ON public.applications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.is_published = true)
  );
