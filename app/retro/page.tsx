import { RetroTvGalaga } from "@/components/RetroTvGalaga";

export default function RetroPage() {
  return (
    <main className="min-h-screen w-full px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accentBlueSoft">Retro Arcade</h1>
        <RetroTvGalaga />
      </div>
    </main>
  );
}
