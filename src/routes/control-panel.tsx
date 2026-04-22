import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/control-panel")({
  head: () => ({ meta: [{ title: "Admin — Livcord" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname === "/control-panel/login";

  useEffect(() => {
    if (loading || isLoginRoute) return;
    if (!user) {
      navigate({ to: "/control-panel/login" });
    }
  }, [user, loading, navigate, isLoginRoute]);

  // Login route renders without admin layout chrome or guards
  if (isLoginRoute) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">
          Your account doesn't have admin access. Ask an existing admin to grant
          you the role, or sign out.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/control-panel/login" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/control-panel">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              Jobs
            </Button>
          </Link>
          <Link to="/control-panel/applications">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              Applications
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/control-panel/login" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
