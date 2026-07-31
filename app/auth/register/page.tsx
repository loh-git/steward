"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatch = password === confirmPassword;
  const highlightMismatch =
    confirmPassword.length >= password.length &&
    password.length > 0 &&
    !passwordMatch;
  const validSubmit =
    !passwordMatch || !email || !password || !email.includes("@");
  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await signUp(email, password);
      router.push("/dashboard");
    } catch (err: string | unknown) {
      const error =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(error, { position: "top-right" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-canvas">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">
        Create an Account
      </h1>
      <form
        className="w-full max-w-sm rounded-lg border border-ink-200 bg-paper-card p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-ink-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder=""
            className={`w-full rounded border p-2 ${emailTouched && !isValidEmail() && email ? "border-ledger-500" : "border-ink-200"}`}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            onBlur={() => setEmailTouched(true)}
          />
          {emailTouched && !isValidEmail() && email && (
            <p className="mt-1 text-xs text-ledger-600">Invalid e-mail address</p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-bold text-ink-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className={`w-full rounded border p-2 ${highlightMismatch ? "border-ledger-500" : "border-ink-200"}`}
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          {highlightMismatch && (
            <p className="mt-1 text-xs text-ledger-600">
              Passwords don&apos;t match
            </p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-bold text-ink-700"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className={`w-full rounded border p-2 ${highlightMismatch ? "border-ledger-500" : "border-ink-200"}`}
            required
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
          {highlightMismatch && (
            <p className="mt-1 text-xs text-ledger-600">
              Passwords don&apos;t match
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`w-full rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700 ${!passwordMatch || !email || !password ? "opacity-50 cursor-not-allowed" : ""}`}
            type="submit"
            disabled={validSubmit}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
