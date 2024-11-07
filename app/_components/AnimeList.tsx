"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { GraphQLClient } from "graphql-request";
import AnimeCard from "./AnimeCard";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/redux/slices/favoritesSlice"; // Import the toggleFavorite action
import { RootState } from "@/redux/store"; // Import RootState for type safety
import { useDebouncedCallback } from "use-debounce";

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
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites); // Access Redux state
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search handler
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debouncedSearchHandler = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 500); // 500ms debounce time

  const fetchAnimes = useCallback(
    async (retries = 3, delay = 1000) => {
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
      } catch (error: unknown) {
        if (retries > 0) {
          console.warn(`Retrying fetch... Attempts left: ${retries}`);
          setTimeout(() => fetchAnimes(retries - 1, delay * 2), delay); // Exponential backoff
        } else {
          if (error instanceof Error) {
            // Mengecek apakah error adalah instance dari Error
            const errorMessage = error.message;
            setError(
              "Network error: Failed to fetch data. Please try again later."
            );
            console.error("Error fetching animes:", errorMessage);
          } else {
            setError("An unknown error occurred.");
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, selectedGenre]
  );

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 when search changes
    fetchAnimes();
  };

  const handleToggleFavorite = (id: number) => {
    dispatch(toggleFavorite(id)); // Dispatch Redux action to toggle favorite
  };

  // Memoize favorite status for each anime to avoid re-checking on every render
  const isFavorite = useMemo(() => {
    return (id: number) => favorites.includes(id); // Memoized check for favorites
  }, [favorites]);

  const getPaginationRange = useMemo(() => {
    return (currentPage: number, totalPages: number) => {
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
  }, []);

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
            value={debouncedSearch}
            onChange={(e) => {
              setDebouncedSearch(e.target.value);
              debouncedSearchHandler(e.target.value);
            }}
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
        <div className="text-red-500 text-center">{error}</div> // Menampilkan error
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

          {/* Pagination - Responsive */}

          <div className="flex justify-center mt-4 sm:justify-end space-x-3 items-center w-full">
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
                        : "bg-black hover:bg-primary"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
