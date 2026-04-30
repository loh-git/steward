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
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Check your email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent you a password reset link at <strong>{email}</strong>.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the email? Check your spam filter, or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-blue-600 hover:underline"
            >
              try another email address
            </button>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Reset Password
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-lg shadow"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded dark:bg-zinc-800"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}