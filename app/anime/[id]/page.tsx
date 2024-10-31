"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router"; // Import useRouter
import { Checkbox } from "@/components/ui/checkbox";

interface Genre {
  mal_id: number;
  name: string;
}

interface Episode {
  mal_id: number;
  title: string;
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

export default function AnimeDetail() {
  const router = useRouter();
  const { id } = router.query; // Ambil id dari router query
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (id) {
      // Pastikan id ada sebelum memanggil API
      fetchAnimeDetails();
      fetchEpisodes();
    }
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
      setAnime(response.data.data);
    } catch (error) {
      console.error("Error fetching anime details:", error);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime/${id}/episodes`
      );
      setEpisodes(response.data.data);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  if (!anime) return <div>Loading...</div>;

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
            priority // Tambahkan ini untuk optimasi loading
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {episodes.map((episode) => (
                <div key={episode.mal_id} className="flex items-center gap-2">
                  <Checkbox id={`episode-${episode.mal_id}`} />
                  <label htmlFor={`episode-${episode.mal_id}`}>
                    {episode.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
