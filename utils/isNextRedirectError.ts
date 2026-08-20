// Next.js implements redirect() (from next/navigation) by throwing a specially
// tagged error, meant to propagate uncaught up to framework internals that
// perform the actual navigation. A client component that wraps a Server
// Action call in its own try/catch intercepts this like any other thrown
// error, so it needs to recognise and re-throw it rather than treating it as
// a real failure — otherwise a successful redirect gets shown as an error.
export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
