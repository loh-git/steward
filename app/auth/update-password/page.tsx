"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = password === confirmPassword;
  const isValid = password.length >= 6 && passwordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Passwords must match and be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success("Password updated successfully");
      router.push("/auth/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-canvas">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">
        New Password
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-8 shadow-sm"
      >
        <p className="mb-6 text-ink-600">
          Enter your new password below.
        </p>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-ink-700"
          >
            New Password
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
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-bold text-ink-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full rounded border p-2 ${!passwordMatch && confirmPassword ? "border-ledger-500" : "border-ink-200"}`}
            placeholder="••••••••"
          />
          {!passwordMatch && confirmPassword && (
            <p className="mt-1 text-xs text-ledger-600">
              {"Passwords don't match"}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
