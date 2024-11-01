"use client";

import { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import AnimeCard from "./AnimeCard";
import { Input } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_QUERY = `
query ($page: Int, $search: String) {
  Page(page: $page, perPage: 24) {
    media(search: $search, sort: [SCORE_DESC]) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
      }
      description
    }
    pageInfo {
      total
      currentPage
      lastPage
    }
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
}

interface AnimeResponse {
  Page: {
    media: Anime[];
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
    };
  };
}

export default function AnimeList() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimes();
  }, [page, search]);

  const fetchAnimes = async () => {
    setIsLoading(true);
    setError(null);
    const variables = { page, search: search || undefined }; // Use undefined for empty search

    try {
      const response: AnimeResponse = await client.request(
        ANIME_QUERY,
        variables
      );
      if (response.Page.media.length === 0) {
        setError("No anime found. Please try a different search.");
      }
      setAnimes(response.Page.media);
      setTotalPages(response.Page.pageInfo.lastPage);
    } catch (error) {
      console.error("Error fetching animes:", error);
      setError("Failed to fetch anime data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    fetchAnimes();
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (start > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" onClick={() => setPage(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (start > 2) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={() => setPage(i)}
            isActive={i === page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages - 1) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    if (end < totalPages) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
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
        <UIButton type="submit">Search</UIButton>
      </form>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animes.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title.romaji}
                image={anime.coverImage.large}
                synopsis={anime.description}
              />
            ))}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={page === 1 ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
              {getPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
