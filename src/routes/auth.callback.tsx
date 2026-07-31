import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Signing you in | Reach by MarketEra";
const DESCRIPTION = "Completing your sign-in to Reach.";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthCallbackPage,
});

/** Returns a safe same-origin path, or the dashboard. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let done = false;
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));

    const go = () => {
      if (done) return;
      done = true;
      window.location.replace(next);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });

    const timeout = setTimeout(() => {
      if (!done) setFailed(true);
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthShell
      title={failed ? "We couldn't finish signing you in" : "Signing you in…"}
      subtitle={
        failed
          ? "The sign-in link may have expired. Try again and we'll get you straight through."
          : "One moment while we hand you over to your workspace."
      }
    >
      {failed ? (
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          onClick={() => navigate({ to: "/login" })}
        >
          Back to log in
        </Button>
      ) : (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting your account
        </div>
      )}
    </AuthShell>
  );
}
