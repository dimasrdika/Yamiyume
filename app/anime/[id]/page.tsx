"use client";
import React, { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaPlay, FaStar, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleFavorite } from "@/redux/slices/favoritesSlice";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        extraLarge
      }
      bannerImage
      genres
      episodes
      duration
      status
      season
      seasonYear
      averageScore
      popularity
      trailer {
        id
        site
      }
      streamingEpisodes {
        title
        thumbnail
        url
      }
    }
  }
`;

interface AnimeDetail {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string;
  genres: string[];
  episodes: number;
  duration: number;
  status: string;
  season: string;
  seasonYear: number;
  averageScore: number;
  popularity: number;
  trailer: {
    id: string;
    site: string;
  } | null;
  streamingEpisodes: {
    title: string;
    thumbnail: string;
    url: string;
  }[];
}

const AnimeDetailPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const favorites = useSelector((state: RootState) => state.favorites);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      try {
        const data = await client.request<{ Media: AnimeDetail }>(ANIME_QUERY, {
          id: Number(id),
        });
        setAnime(data.Media);
      } catch (error) {
        console.error("Error fetching anime details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAnimeDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-primary rounded-full"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Anime not found
      </div>
    );
  }

  const cleanDescription = anime.description?.replace(/<[^>]*>?/gm, "");
  const truncatedDescription =
    cleanDescription?.length > 250
      ? cleanDescription.substring(0, 250) + "..."
      : cleanDescription;

  return (
    <main className="min-h-screen bg-white dark:bg-background overflow-x-hidden text-black dark:text-gray-200">
      {/* Banner Section */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-[30vh] sm:h-[40vh] md:h-[60vh] w-full overflow-hidden">
          {anime.bannerImage && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              <Image
                src={anime.bannerImage}
                alt={anime.title.english || anime.title.romaji}
                layout="fill"
                objectFit="cover"
                className="object-cover"
                priority
              />
            </>
          )}
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Poster Card for Mobile */}
            <div className="relative -mt-20 mx-auto w-32 rounded-lg overflow-hidden shadow-xl z-20">
              <div className="relative aspect-[2/3]">
                <Image
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Title and Info for Mobile */}
            <div className="mt-4 text-center">
              <h1 className="text-xl font-bold text-white dark:text-gray-200 mb-2">
                {anime.title.english || anime.title.romaji}
              </h1>

              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {anime.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex justify-center items-center gap-3 text-gray-300 dark:text-gray-400 mb-4 text-sm">
                <span>{anime.seasonYear}</span>
                {anime.averageScore && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    {anime.averageScore / 10}/10
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            {/* Poster Card for Desktop */}
            <div className="absolute -top-48 left-8 w-64 rounded-lg overflow-hidden shadow-xl z-20">
              <div className="relative aspect-[2/3]">
                <Image
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Title and Info for Desktop */}
            <div className="ml-80 -mt-32 relative z-20 pb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-white dark:text-gray-200 mb-2">
                {anime.title.english || anime.title.romaji}
              </h1>

              <div className="flex items-center gap-4 text-gray-300 dark:text-gray-400 mb-4">
                <span>{anime.seasonYear}</span>
                {anime.averageScore && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    {anime.averageScore / 10}/10
                  </span>
                )}
                <span>{anime.episodes} Episodes</span>
              </div>
            </div>
          </div>

          {/* Common Content for Both Layouts */}
          <div
            className={`${
              showFullDescription ? "mt-4" : "mt-4"
            } px-4 md:px-0 md:ml-80`}
          >
            <div className="max-w-3xl text-sm md:text-base text-black dark:text-gray-400">
              <p>
                {showFullDescription ? cleanDescription : truncatedDescription}
                {cleanDescription?.length > 250 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="ml-2 text-primary dark:text-primary hover:text-primary dark:hover:text-primary"
                  >
                    {showFullDescription ? "Lebih sedikit" : "Selengkapnya"}
                  </button>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {anime.trailer && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowTrailer(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <FaPlay className="w-4 h-4 mr-2" /> Tonton Trailer
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => dispatch(toggleFavorite(anime.id))}
                className="bg-white/10 hover:bg-white/20 border-white/50 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <FaStar
                  className={`w-5 h-5 ${
                    favorites.includes(anime.id)
                      ? "text-yellow-400"
                      : "text-white"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && anime.trailer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowTrailer(false)}
          />
          <div className="bg-black dark:bg-black rounded-lg p-4 sm:p-6 z-10 w-full max-w-3xl mx-auto shadow-2xl relative">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-primary dark:text-primary bg-black/50 rounded-full p-2 hover:bg-black/75 transition"
            >
              <FaTimes className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">
              {anime.title.english || anime.title.romaji}
            </h2>

            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${anime.trailer.id}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Episodes Section */}
      {anime.streamingEpisodes && anime.streamingEpisodes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 sm:mb-6">
            Episodes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {anime.streamingEpisodes.map((episode, index) => (
              <a
                key={index}
                href={episode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
              >
                <div className="relative aspect-video">
                  <Image
                    src={episode.thumbnail}
                    alt={episode.title}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-sm md:text-base line-clamp-2 text-white dark:text-gray-200">
                    {episode.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default AnimeDetailPage;
