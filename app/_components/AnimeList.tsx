"use client";
import { useState, useEffect, useCallback } from "react";
import { GraphQLClient } from "graphql-request";
import AnimeCard from "./AnimeCard";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_QUERY = `
query ($page: Int, $search: String, $genre_in: [String]) {
  Page(page: $page, perPage: 24) {
    media(search: $search, genre_in: $genre_in, sort: [POPULARITY_DESC]) {
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
      episodes
      season
      seasonYear
      siteUrl
    }
    pageInfo {
      total
      currentPage
      lastPage
    }
  }
}
`;

const genreOptions: string[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mecha",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
];

interface Review {
  summary: string;
}

interface Anime {
  reviews: Review[];
  id: number;
  title: { romaji: string; english: string };
  coverImage: { large: string };
  description: string;
  genres: string[];
  averageScore: number;
  episodes: number;
  season: string;
  seasonYear: string;
  siteUrl: string;
}

interface AnimeResponse {
  Page: {
    media: Anime[];
    pageInfo: { total: number; currentPage: number; lastPage: number };
  };
}

export default function AnimeList() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const variables = {
      page: page,
      search: search || undefined,
      genre_in: selectedGenre ? [selectedGenre] : undefined,
    };

    try {
      const response: AnimeResponse = await client.request(
        ANIME_QUERY,
        variables
      );
      setAnimes(response.Page.media || []);
      setTotalPages(response.Page.pageInfo.lastPage);

      if (response.Page.media.length === 0) {
        setError("No anime found. Please try a different search or genre.");
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Failed to fetch anime data.";
      console.error("Error fetching animes:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedGenre]);

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 when search changes
    fetchAnimes();
  };

  const handleToggleFavorite = (id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((favoriteId) => favoriteId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: number) => favorites.includes(id);

  const getPaginationRange = (currentPage: number, totalPages: number) => {
    let range = [];
    if (totalPages <= 5) {
      range = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        range = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        range = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        range = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return range;
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6 ml-2">Semua Anime</h1>
      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-start"
      >
        <div className="flex-grow sm:max-w-[300px]">
          <Input
            type="text"
            placeholder="Cari anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 px-4 border rounded-md"
          />
        </div>
        <UIButton
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition"
        >
          Cari
        </UIButton>
        <div className="flex-grow sm:max-w-[200px]">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value || undefined)}
            className="w-full border py-2 px-4 rounded-md"
          >
            <option value="">All Genres</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Loading & Error Handling */}
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-primary rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          {/* Anime Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {animes.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title.romaji}
                image={anime.coverImage.large}
                synopsis={anime.description}
                genres={anime.genres}
                rating={anime.averageScore}
                season={anime.season}
                episodes={anime.episodes}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite(anime.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-6">
            <div className="flex items-center space-x-3">
              {getPaginationRange(page, totalPages).map((pageNumber, index) => (
                <div key={index} className="flex items-center">
                  {pageNumber === "..." ? (
                    <span className="text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => setPage(pageNumber as number)}
                      className={`px-4 py-2 rounded-md text-sm ${
                        page === pageNumber
                          ? "bg-primary text-white"
                          : "bg-black hover:bg-primary "
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
