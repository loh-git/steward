"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

// Same public site key as use-captcha.tsx; unset means CAPTCHA is skipped entirely.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Thrown by getToken() when the visitor backs out of the challenge, so callers can stay quiet.
export class CaptchaCancelledError extends Error {
  constructor() {
    super("Verification cancelled");
  }
}

type Pending = {
  resolve: (token: string | undefined) => void;
  reject: (error: Error) => void;
};

export type OnDemandCaptcha = {
  /** False when no site key is configured: nothing to run, getToken() resolves to undefined. */
  enabled: boolean;
  /** True once the widget has rendered and getToken() can be called. */
  ready: boolean;
  /** Runs the check when called (e.g. on a button click) and resolves with the token. */
  getToken: () => Promise<string | undefined>;
  /** Tokens are single-use: call after the auth attempt, success or failure. */
  reset: () => void;
  /** Render once, anywhere. Invisible until Cloudflare needs the visitor, then a centred card. */
  widget: ReactNode;
};

/**
 * Turnstile that stays out of the page until it's actually needed. The check starts when
 * getToken() is called, and the widget only becomes visible (as a small modal over the page) if
 * Cloudflare decides the visitor has to interact. Used for the Try Demo button; the login and
 * sign-up forms use the inline use-captcha.tsx instead.
 */
export function useOnDemandCaptcha(): OnDemandCaptcha {
  const widgetRef = useRef<TurnstileInstance>(null);
  const pending = useRef<Pending | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const enabled = Boolean(SITE_KEY);

  const settle = useCallback((error: Error | null, token?: string) => {
    const current = pending.current;
    pending.current = null;
    setChallengeOpen(false);
    if (!current) return;
    if (error) current.reject(error);
    else current.resolve(token);
  }, []);

  const getToken = useCallback((): Promise<string | undefined> => {
    if (!enabled) return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
      const widgetInstance = widgetRef.current;
      if (!widgetInstance) {
        reject(new Error("Verification isn't ready yet."));
        return;
      }
      pending.current = { resolve, reject };
      widgetInstance.execute();
    });
  }, [enabled]);

  const reset = useCallback(() => {
    widgetRef.current?.reset();
  }, []);

  const cancel = useCallback(() => {
    settle(new CaptchaCancelledError());
    widgetRef.current?.reset();
  }, [settle]);

  useEffect(() => {
    if (!challengeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [challengeOpen, cancel]);

  // The element tree is identical whether or not the card is showing (only classes and the
  // conditional siblings change), so React keeps the same <Turnstile> mounted and the
  // in-progress challenge isn't reset when the card appears.
  const widget = enabled ? (
    <div
      className={
        challengeOpen
          ? "fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 px-4"
          : "sr-only"
      }
      role={challengeOpen ? "dialog" : undefined}
      aria-modal={challengeOpen ? true : undefined}
      aria-label={challengeOpen ? "Security check" : undefined}
    >
      <div
        className={
          challengeOpen
            ? "w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-6 text-center shadow-xl"
            : undefined
        }
      >
        {challengeOpen && (
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Quick security check
          </h2>
        )}
        {challengeOpen && (
          <p className="mb-4 mt-1 text-sm text-ink-600">
            Please confirm you&apos;re human to continue.
          </p>
        )}
        <Turnstile
          ref={widgetRef}
          siteKey={SITE_KEY!}
          onWidgetLoad={() => setLoaded(true)}
          onBeforeInteractive={() => setChallengeOpen(true)}
          onAfterInteractive={() => setChallengeOpen(false)}
          onSuccess={(token) => settle(null, token)}
          onError={() => settle(new Error("Verification failed"))}
          onTimeout={() => settle(new Error("Verification timed out"))}
          onUnsupported={() => settle(new Error("Verification isn't supported here"))}
          // Nothing runs until getToken() calls execute(); "interaction-only" then keeps the
          // widget hidden unless Cloudflare needs the visitor to do something.
          options={{
            size: "flexible",
            appearance: "interaction-only",
            execution: "execute",
          }}
        />
        {challengeOpen && (
          <button
            type="button"
            onClick={cancel}
            className="mt-4 text-sm text-ink-600 underline underline-offset-2 hover:text-ink-900"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  ) : null;

  return { enabled, ready: !enabled || loaded, getToken, reset, widget };
}
