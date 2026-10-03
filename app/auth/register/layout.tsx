import type { Metadata } from "next";

// The page itself is a client component, which can't export metadata.
export const metadata: Metadata = { title: "Create an Account" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
