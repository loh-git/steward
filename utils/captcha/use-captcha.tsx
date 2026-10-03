"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

// Public Cloudflare Turnstile site key (safe to expose; the secret key lives in the Supabase
// dashboard under Auth > Bot and Abuse Protection). When unset, CAPTCHA is skipped entirely, so
// the app keeps working locally and before the dashboard toggle is switched on.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export type Captcha = {
  /** False when no site key is configured: no widget, no token needed. */
  enabled: boolean;
  /** Pass as `captchaToken` to Supabase auth calls; undefined until the challenge passes. */
  token: string | undefined;
  /** True once an auth call can be made (always true when CAPTCHA is disabled). */
  ready: boolean;
  /** Render this inside the form/page. Null when disabled. */
  widget: ReactNode;
  /** Tokens are single-use: call after every auth attempt, success or failure. */
  reset: () => void;
};

export function useCaptcha(): Captcha {
  const widgetRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState<string>();
  const enabled = Boolean(SITE_KEY);

  const reset = useCallback(() => {
    setToken(undefined);
    widgetRef.current?.reset();
  }, []);

  const widget = enabled ? (
    <Turnstile
      ref={widgetRef}
      siteKey={SITE_KEY!}
      onSuccess={setToken}
      onExpire={() => setToken(undefined)}
      onError={() => setToken(undefined)}
      // "interaction-only" keeps the widget hidden unless Cloudflare actually needs the visitor
      // to do something.
      options={{ size: "flexible", appearance: "interaction-only" }}
    />
  ) : null;

  return { enabled, token, ready: !enabled || Boolean(token), widget, reset };
}
