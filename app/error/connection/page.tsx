import React from "react";

export default function ConnectionErrorPage() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-paper-canvas">
        <div className="max-w-lg p-8 bg-paper-card border border-ink-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4 text-ink-900">
            Something went wrong
          </h1>
          <p className="text-ink-700">
            We couldn&apos;t connect to the backend. Please check your internet
            connection and try again.
          </p>
        </div>
      </body>
    </html>
  );
}
