"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { seedDemo } from "@/app/auth/demo-actions";
import { createClient } from "@/utils/supabase/client";
import { isNextRedirectError } from "@/utils/isNextRedirectError";
import { useCaptcha } from "@/utils/captcha/use-captcha";

type DemoButtonProps = {
  variant: "primary" | "secondary" | "tertiary";
  className?: string;
};

// Friendly copy for the sign-in failures a visitor can actually hit.
function signInErrorMessage(error: { code?: string; status?: number }): string {
  if (error.code === "anonymous_provider_disabled") {
    return "The demo is temporarily unavailable.";
  }
  if (error.code === "over_request_rate_limit" || error.status === 429) {
    return "Lots of people are trying the demo right now. Please try again in a few minutes.";
  }
  if (error.code === "captcha_failed") {
    return "Verification failed. Please retry.";
  }
  return "Couldn't start the demo. Please try again.";
}

const VARIANT_CLASSES = {
  primary: "bg-ledger-600 text-white hover:bg-ledger-700",
  secondary:
    "border border-ledger-500 bg-paper-card text-ledger-600 hover:bg-ledger-50",
  // Brass is the demo's colour (the in-app "Demo mode" banner uses it too).
  tertiary:
    "border border-brass-500 bg-paper-card text-brass-700 hover:bg-brass-100",
} as const;

export function DemoButton({ variant, className = "" }: DemoButtonProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [isPending, startTransition] = useTransition();
  const captcha = useCaptcha();
  const busy = signingIn || isPending;

  const handleClick = async () => {
    if (busy) return;
    setSigningIn(true);

    // Sign in from the browser so Supabase's rate limit applies to the visitor's own IP and the
    // visitor's own Turnstile token can be passed along. An existing session (a real account, or an earlier
    // demo) is left alone: the server action never seeds a real account.
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously({
        options: { captchaToken: captcha.token },
      });
      // Tokens are single-use, so the next attempt needs a fresh challenge either way.
      captcha.reset();
      if (error) {
        toast.error(signInErrorMessage(error));
        setSigningIn(false);
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await seedDemo();
        if (result?.error) toast.error(result.error);
      } catch (err) {
        // A successful seed ends in redirect(), which reaches the client as a rejection while
        // Next still performs the navigation.
        if (!isNextRedirectError(err)) {
          toast.error("Couldn't start the demo. Please try again.");
        }
      }
    });
    setSigningIn(false);
  };

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || !captcha.ready}
        aria-busy={busy}
        className={`flex min-h-12 items-center justify-center gap-2 rounded px-14 py-3 font-medium disabled:opacity-60 ${VARIANT_CLASSES[variant]}`}
      >
        {busy && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {busy ? "Setting up your demo…" : "Try Demo"}
      </button>
      {captcha.widget}
      <p className="mt-2 text-xs text-ink-500">No sign-up. Sample data only.</p>
    </div>
  );
}
