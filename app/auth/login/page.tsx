"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { isNextRedirectError } from "@/utils/isNextRedirectError";
import { toast } from "sonner";
import { DemoButton } from "@/app/components/DemoButton";
import { useCaptcha } from "@/utils/captcha/use-captcha";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useCaptcha();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password, captcha.token);
      router.push("/dashboard");
    } catch (err) {
      // A successful signIn ends in redirect(), which surfaces here as a rejection while Next
      // still navigates, so it isn't a failure to report.
      if (isNextRedirectError(err)) return;
      const message = err instanceof Error ? err.message : "Failed to sign in";
      toast.error(message);
    } finally {
      // The token was spent by the attempt above, win or lose.
      captcha.reset();
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-canvas px-4">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">
        Sign In
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-8 shadow-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-ink-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-ink-200 p-2"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-ink-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-ink-200 p-2"
            placeholder="••••••••"
          />
        </div>
        {captcha.widget}
        <button
          type="submit"
          disabled={loading || !captcha.ready}
          className="w-full rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="mt-4 text-center text-sm text-ink-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-ledger-600 hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-600">
          <Link
            href="/auth/reset-password"
            className="text-ledger-600 hover:underline"
          >
            Forgotten Password?
          </Link>
        </p>
      </form>
      {/* Outside the form: a second button inside it would also submit the sign-in. */}
      <div className="mt-4 flex w-full max-w-sm flex-col items-center">
        <p className="mb-4 text-sm text-ink-500">or</p>
        <DemoButton variant="tertiary" />
      </div>
    </div>
  );
}
