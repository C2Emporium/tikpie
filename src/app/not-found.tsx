import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-6xl font-bold text-zinc-500">404</h1>
      <p className="mt-4 text-zinc-400 text-center">
        Cette page n’existe pas.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
