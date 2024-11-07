"use client";
import React, { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaPlay, FaStar, FaTimes } from "react-icons/fa";

const client = new GraphQLClient("https://graphql.anilist.co");

// GraphQL query for anime details
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

  // Clean HTML tags from description
  const cleanDescription = anime.description?.replace(/<[^>]*>?/gm, "");
  const truncatedDescription =
    cleanDescription?.length > 250
      ? cleanDescription.substring(0, 250) + "..."
      : cleanDescription;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Banner Section */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
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
          {/* Poster Card */}
          <div className="absolute -top-32 md:-top-48 left-4 md:left-8 w-32 md:w-64 rounded-lg overflow-hidden shadow-xl z-20">
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

          {/* Title and Description Section */}
          <div className="ml-40 md:ml-80 -mt-32 relative z-20 pb-8">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-xs md:text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {anime.title.english || anime.title.romaji}
            </h1>

            {/* Year and Score */}
            <div className="flex items-center gap-4 text-gray-300 mb-4 text-sm md:text-base">
              <span>{anime.seasonYear}</span>
              {anime.averageScore && (
                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  {anime.averageScore / 10}/10
                </span>
              )}
              <span>{anime.episodes} Episodes</span>
            </div>

            {/* Description */}
            <div className="max-w-3xl text-sm md:text-base text-gray-300">
              <p>
                {showFullDescription ? cleanDescription : truncatedDescription}
                {cleanDescription?.length > 250 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="ml-2 text-primary hover:text-primary"
                  >
                    {showFullDescription ? "Show Less" : "Read More"}
                  </button>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              {anime.trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-4 md:px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg flex items-center gap-2 text-sm md:text-base transition"
                >
                  <FaPlay />
                  Tonton Trailer
                </button>
              )}
              <button className="px-4 md:px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm md:text-base transition">
                <FaStar />
                Tambahkan ke Favorites
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && anime.trailer && (
        <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
          {/* Modal background */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowTrailer(false)}
          />
          {/* Modal content */}
          <div className="bg-black rounded-lg p-6 z-10 w-full max-w-3xl mx-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-primary bg-black/50 rounded-full p-2 hover:bg-black/75 transition"
              aria-label="Close modal"
            >
              <FaTimes className="h-6 w-6" />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold mb-4 text-white">
              {anime.title.english || anime.title.romaji}
            </h2>

            {/* Trailer iframe */}
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {anime.streamingEpisodes.map((episode, index) => (
              <a
                key={index}
                href={episode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
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
                <div className="p-4">
                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
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
