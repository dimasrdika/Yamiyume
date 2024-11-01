import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import EpisodeList from "./episode.list";

interface Genre {
  mal_id: number;
  name: string;
}

interface Anime {
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  title: string;
  synopsis: string;
  genres: Genre[];
}

async function getAnime(id: string): Promise<Anime> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
  if (!res.ok) throw new Error("Failed to fetch anime");
  const data = await res.json();
  return data.data;
}

export default async function AnimeDetail({
  params,
}: {
  params: { id: string };
}) {
  let anime: Anime;

  try {
    anime = await getAnime(params.id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            width={300}
            height={400}
            className="w-full rounded-lg shadow-lg"
            priority
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{anime.title}</h1>
          <p className="text-lg mb-4">{anime.synopsis}</p>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span
                  key={genre.mal_id}
                  className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Episodes</h3>
            <Suspense fallback={<div>Loading episodes...</div>}>
              <EpisodeList animeId={params.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
