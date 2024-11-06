import AnimeList from "@/app/_components/AnimeList";
import HeroBanner from "@/app/_components/HeroBanner";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full overflow-x-hidden flex-col items-center justify-between">
      <HeroBanner />
      <div className="w-full">
        <AnimeList />
      </div>
    </main>
  );
}
