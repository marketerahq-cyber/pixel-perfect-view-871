import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppleIcon, GoogleIcon } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

type Provider = "google" | "apple";

/**
 * Google / Apple sign-in. The redirect target must be a public route — the
 * callback page waits for the session then forwards to the dashboard.
 */
export function SocialAuthButtons({ mode }: { mode: "login" | "signup" }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const verb = mode === "login" ? "Continue" : "Sign up";

  async function signIn(provider: Provider) {
    setPending(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        setPending(null);
        toast.error(result.error.message ?? "Sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      window.location.replace("/dashboard");
    } catch (e) {
      setPending(null);
      toast.error(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google")}
        disabled={pending !== null}
      >
        {pending === "google" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        {verb} with Google
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("apple")}
        disabled={pending !== null}
      >
        {pending === "apple" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <AppleIcon className="h-4 w-4" />
        )}
        {verb} with Apple
      </Button>
    </div>
  );
}
