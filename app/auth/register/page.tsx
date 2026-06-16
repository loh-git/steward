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
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Create an Account
      </h1>
      <form
        className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-lg shadow"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder=""
            className={`w-full p-2 border rounded dark:bg-zinc-800 ${emailTouched && !isValidEmail() && email ? "border-red-500" : "border-gray-300"}`}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            onBlur={() => setEmailTouched(true)}
          />
          {emailTouched && !isValidEmail() && email && (
            <p className="text-red-500 text-xs mt-1">Invalid e-mail address</p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className={`w-full p-2 border rounded dark:bg-zinc-800 ${highlightMismatch ? "border-red-500" : "border-gray-300"}`}
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          {highlightMismatch && (
            <p className="text-red-500 text-xs mt-1">
              Passwords don&apos;t match
            </p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className={`w-full p-2 border rounded dark:bg-zinc-800 ${highlightMismatch ? "border-red-500" : "border-gray-300"}`}
            required
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
          {highlightMismatch && (
            <p className="text-red-500 text-xs mt-1">
              Passwords don&apos;t match
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 ${!passwordMatch || !email || !password ? "opacity-50 cursor-not-allowed" : ""}`}
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
