import type { Metadata } from "next";
import { Libre_Caslon_Text, Public_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "./components/LayoutWrapper";

// Caslon is the historical face of British institutional print — banknotes,
// government documents, legal typesetting — the "Working Ledger" display face.
const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Workhorse body/UI/form face, in the register of an official printed form.
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Steward",
  description: "UK take-home pay, budgeted properly.",
};

// Export wrapper like component for the entire app, which will wrap all pages and components. This is where we can add global styles, fonts,
// and other things that should be applied to the entire app. We also have thing like Toaster from the sonner library, an example of a globally available component.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caslon.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
