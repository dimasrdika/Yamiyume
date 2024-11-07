"use client";
import AnimeList from "@/app/_components/AnimeList";
import HeroBanner from "@/app/_components/HeroBanner";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full overflow-x-hidden flex-col items-center justify-between">
      <HeroBanner />
      <div className="w-full">
        <AnimeList />
      </div>
    </main>
  );
}
