"use client";
import React, { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { useParams } from "next/navigation";
import { Play, Plus } from "lucide-react";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id) {
    id
    title {
      romaji
      english
    }
    coverImage {
      large
      extraLarge
    }
    bannerImage
    description
    genres
    episodes
    averageScore
    season
    seasonYear
    status
    streamingEpisodes {
      title
      thumbnail
      url
    }
    trailer {
      id
      site
    }
  }
}
`;

interface AnimeDetail {
  id: number;
  title: {
    romaji: string;
    english: string;
  };
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string;
  description: string;
  genres: string[];
  episodes: number;
  averageScore: number;
  season: string;
  seasonYear: number;
  status: string;
  streamingEpisodes: Episode[];
  trailer: {
    id: string;
    site: string;
  } | null;
}

interface Episode {
  title: string;
  thumbnail: string;
  url: string;
}

const AnimeDetailPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnimeDetail(Number(id));
    }
  }, [id]);

  const fetchAnimeDetail = async (animeId: number) => {
    try {
      const response = await client.request<{ Media: AnimeDetail }>(
        ANIME_DETAIL_QUERY,
        { id: animeId }
      );
      setAnime(response.Media);
    } catch (error) {
      console.error("Failed to fetch anime details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 8px solid rgba(255, 255, 255, 0.1);
            border-top: 8px solid #ffffff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!anime) return null;

  const trailerUrl =
    anime.trailer && anime.trailer.site === "youtube"
      ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
      : null;

  const descriptionText = anime.description.replace(/<[^>]+>/g, "");
  const shortDescription = descriptionText.slice(0, 150);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section with Banner */}
      <div className="relative h-96">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <img
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt={anime.title.english || anime.title.romaji}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex gap-8">
            <img
              src={anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              className="w-48 h-72 rounded-lg shadow-lg"
            />

            <div className="flex flex-col justify-end">
              <h1 className="text-4xl font-bold mb-2">
                {anime.title.english || anime.title.romaji}
              </h1>
              <p className="text-sm mb-4">
                {isExpanded ? descriptionText : shortDescription}
                {descriptionText.length > 150 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-500 ml-2"
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </p>
              <div className="flex gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                  {anime.season} {anime.seasonYear}
                </span>
                {anime.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {trailerUrl && (
                  <a
                    href={trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Play size={20} />
                    Watch Trailer
                  </a>
                )}
                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                  <Plus size={20} />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {anime.streamingEpisodes.map((episode) => (
            <a
              key={episode.title}
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
            >
              <div className="relative">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-2 right-2 bg-blue-600 px-2 py-1 rounded text-sm">
                  {episode.title}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg truncate">
                  {episode.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
