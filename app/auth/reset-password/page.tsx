"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/auth/actions";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper-canvas">
        <div className="w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-8 shadow-sm">
          <h1 className="mb-4 font-display text-2xl font-bold text-ink-900">
            Check your email
          </h1>
          <p className="mb-6 text-ink-600">
            We've sent you a password reset link at <strong>{email}</strong>.
          </p>
          <p className="text-sm text-ink-600">
            Didn't receive the email? Check your spam filter, or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-ledger-600 hover:underline"
            >
              try another email address
            </button>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="text-ledger-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-canvas">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">
        Reset Password
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-8 shadow-sm"
      >
        <p className="mb-6 text-ink-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        <div className="mb-6">
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-ledger-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
