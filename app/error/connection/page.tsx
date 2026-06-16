import React from "react";

export default function ConnectionErrorPage() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="max-w-lg p-8 bg-white dark:bg-zinc-900 rounded shadow">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Something went wrong</h1>
          <p className="text-gray-700 dark:text-gray-300">We couldn&apos;t connect to the backend. Please check your internet connection and try again.</p>
        </div>
      </body>
    </html>
  );
}
