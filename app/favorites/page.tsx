"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import AnimeCard from "@/app/_components/AnimeCard";
import { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { removeFavorite } from "../../redux/slices/favoritesSlice"; // Import your removeFavorite action

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 font-inter">
        Your Favorites
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteAnimes.map((anime) => (
          <AnimeCard
            key={anime.id}
            id={anime.id}
            title={anime.title.romaji}
            image={anime.coverImage.large} // Menggunakan coverImage.large
            synopsis={anime.description || "No synopsis available."} // Menggunakan description
            onToggleFavorite={() => handleToggleFavorite(anime.id)}
            isFavorite={favorites.includes(anime.id)} // Cek apakah anime ini favorite
            genres={anime.genres || []} // Menambahkan genres
            rating={anime.averageScore || 0} // Menambahkan rating
            season={anime.season || "Unknown"} // Menambahkan season
            episodes={anime.episodes || 0} // Menambahkan episodes
          />
        ))}
      </div>
    </div>
  );
}
