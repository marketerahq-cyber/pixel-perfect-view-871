import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Log in | Reach by MarketEra";
const DESCRIPTION = "Log in to Reach to send invoices and let automatic reminders chase payment.";

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to keep your follow-ups running."
      footer={
        <>
          New to Reach?{" "}
          <Link to="/signup" className="text-accent font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SocialAuthButtons mode="login" />

      <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or log in with email
        <span className="bg-border h-px flex-1" />
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleReset}
              className="text-muted-foreground hover:text-accent text-xs"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
