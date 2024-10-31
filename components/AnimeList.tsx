// Ensure this is the very first line in your file
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AnimeCard from "./AnimeCard";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button"; // Renamed import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  synopsis: string;
}

export default function AnimeList() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState("asc");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnimes();
  }, [page, search, genre, sort]);

  const fetchAnimes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://api.jikan.moe/v4/anime", {
        params: {
          page,
          q: search,
          genre: genre || undefined,
          order_by: "title",
          sort,
          limit: 24,
        },
      });
      setAnimes(response.data.data);
      setTotalPages(response.data.pagination.last_visible_page);
    } catch (error) {
      console.error("Error fetching animes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    fetchAnimes();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <Input
          type="text"
          placeholder="Search anime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow"
        />
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            <SelectItem value="1">Action</SelectItem>
            <SelectItem value="2">Adventure</SelectItem>
            <SelectItem value="4">Comedy</SelectItem>
            <SelectItem value="8">Drama</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">A-Z</SelectItem>
            <SelectItem value="desc">Z-A</SelectItem>
          </SelectContent>
        </Select>
        <UIButton type="submit">Search</UIButton> {/* Use renamed Button */}
      </form>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animes.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                id={anime.mal_id}
                title={anime.title}
                image={anime.images.jpg.image_url}
                synopsis={anime.synopsis}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <UIButton
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </UIButton>
            <span className="self-center">
              Page {page} of {totalPages}
            </span>
            <UIButton
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </UIButton>
          </div>
        </>
      )}
    </div>
  );
}
