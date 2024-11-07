"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import AnimeCard from "@/app/_components/AnimeCard";
import { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { removeFavorite } from "../../redux/slices/favoritesSlice"; // Import your removeFavorite action
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router for app directory
import Image from "next/image";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_QUERY = `
query ($id: Int) {
  Media(id: $id) {
    id
    title {
      romaji
      english
    }
    coverImage {
      large
    }
    description
    genres
    averageScore
    reviews {
      nodes {
        summary
      }
    }
    season
    episodes
  }
}
`;

interface Anime {
  id: number;
  title: {
    romaji: string;
    english: string;
  };
  coverImage: {
    large: string;
  };
  description: string;
  genres: string[];
  averageScore: number;
  reviews: {
    nodes: {
      summary: string;
    }[];
  };
  season: string;
  episodes: number;
}

export default function Favorites() {
  const favorites = useSelector((state: RootState) => state.favorites);
  const dispatch = useDispatch();
  const [favoriteAnimes, setFavoriteAnimes] = useState<Anime[]>([]);
  const [isClient, setIsClient] = useState(false); // Flag to check if it's client-side

  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set the client flag to true after the component mounts
  }, []);

  useEffect(() => {
    const fetchFavoriteAnimes = async () => {
      const animes = await Promise.all(
        favorites.map(async (id) => {
          const response = await client.request<{ Media: Anime }>(ANIME_QUERY, {
            id,
          });
          return response.Media;
        })
      );
      setFavoriteAnimes(animes);
    };

    if (favorites.length > 0) {
      fetchFavoriteAnimes();
    } else {
      setFavoriteAnimes([]); // Clear favorites if none are selected
    }
  }, [favorites]);

  const handleToggleFavorite = (id: number) => {
    dispatch(removeFavorite(id)); // Dispatch the action to remove from favorites
  };

  const handleGoHome = () => {
    router.push("/"); // Navigate back to the homepage
  };

  if (!isClient) {
    return null; // Prevent rendering content before it's on the client
  }

  return (
    <div className="container mx-auto px-4 py-28 bg-white dark:bg-background">
      <h1 className="text-4xl text-black dark:text-white font-bold text-center mb-8 font-inter">
        Favorit kamu
      </h1>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Image
            src="/frieren.png"
            width={500}
            height={500}
            alt="Empty favorites"
            className="w-96 h-96 mb-4"
          />
          <p className="text-md font-semibold text-gray-600 dark:text-gray-300">
            Kamu belum menambahkan anime favorite mu
          </p>
          <button
            onClick={handleGoHome}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-dark"
          >
            Kembali ke Beranda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteAnimes.map((anime) => (
            <AnimeCard
              key={anime.id}
              id={anime.id}
              title={anime.title.romaji}
              image={anime.coverImage.large}
              synopsis={anime.description || "No synopsis available."}
              onToggleFavorite={() => handleToggleFavorite(anime.id)}
              isFavorite={favorites.includes(anime.id)}
              genres={anime.genres || []}
              rating={anime.averageScore || 0}
              season={anime.season || "Unknown"}
              episodes={anime.episodes || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
