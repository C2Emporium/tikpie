"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-xl font-semibold text-zinc-200">Une erreur est survenue</h1>
      <p className="mt-2 text-zinc-500 text-sm text-center max-w-sm">
        Le chargement a échoué. Réessaie ou reviens plus tard.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
