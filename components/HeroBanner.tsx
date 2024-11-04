"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaStar, FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/redux/slices/favoritesSlice";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraphQLClient, gql } from "graphql-request";
import { useTheme } from "next-themes";

const client = new GraphQLClient("https://graphql.anilist.co");

const query = gql`
  query {
    Page(page: 1, perPage: 10) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        bannerImage
        coverImage {
          extraLarge
        }
        description
        trailer {
          id
          site
        }
      }
    }
  }
`;

interface Anime {
  id: number;
  title: {
    romaji: string;
    english?: string;
  };
  bannerImage: string;
  coverImage: {
    extraLarge: string;
  };
  description: string;
  trailer?: {
    id: string;
    site: string;
  };
}

const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function HeroBanner() {
  const { theme } = useTheme();
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites);
  const [currentAnimeIndex, setCurrentAnimeIndex] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        const data = await client.request<{ Page: { media: Anime[] } }>(query);
        setTopAnime(data.Page.media);

        // Select a random anime index
        const randomIndex = Math.floor(Math.random() * data.Page.media.length);
        setCurrentAnimeIndex(randomIndex);
      } catch (err) {
        setError("Failed to load top anime. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopAnime();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen md:h-[70vh] lg:h-[80vh] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen md:h-[70vh] lg:h-[80vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!topAnime.length) return null;

  const currentAnime = topAnime[currentAnimeIndex];
  const cleanedDescription = stripHtml(
    currentAnime.description || "No synopsis available."
  );

  const trailerUrl =
    currentAnime.trailer?.site === "youtube"
      ? `https://www.youtube.com/embed/${currentAnime.trailer.id}?autoplay=1`
      : null;

  const backgroundImage =
    currentAnime.bannerImage || currentAnime.coverImage.extraLarge;

  return (
    <div className="relative w-full h-screen md:h-[70vh] lg:h-[80vh] overflow-hidden">
      <div className="relative w-full h-full md:hidden">
        <Image
          src={currentAnime.coverImage.extraLarge}
          alt={currentAnime.title.romaji || "Anime Poster"}
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className={`transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="relative hidden md:block w-full h-full">
        <Image
          src={backgroundImage}
          alt={currentAnime.title.romaji || "Anime Banner"}
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className={`transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end md:justify-center pl-4 md:pl-8">
        <div className="w-full px-4 pb-8 pt-20 md:pt-0 md:pb-0 md:px-8 lg:px-12 max-w-4xl md:max-w-5xl space-y-4 md:space-y-6">
          <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold font-title leading-tight drop-shadow-lg">
            {currentAnime.title.english || currentAnime.title.romaji}
          </h2>

          <div className="max-w-2xl relative">
            <div
              className={`max-w-2xl ${
                showFullDescription
                  ? "custom-scrollbar max-h-[40vh] overflow-y-auto"
                  : "max-h-28 overflow-hidden"
              } transition-all duration-300`}
            >
              <p className="text-gray-200 text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-md">
                {cleanedDescription}
              </p>
            </div>

            <Button
              variant="link"
              size="sm"
              className="text-white hover:text-primary-400 underline mt-2 md:mt-3"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? "See Less" : "See More"}
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-6">
            <Button
              variant="default"
              size="lg"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              <FaPlay className="w-4 h-4 mr-2" /> Watch Trailer
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(toggleFavorite(currentAnime.id))}
              className="bg-white/10 hover:bg-white/20 border-white/50 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              <FaStar
                className={`w-5 h-5 ${
                  favorites.includes(currentAnime.id)
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setModalOpen(false)}
          />
          <div
            className={`${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg p-6 z-10 w-full max-w-3xl mx-auto shadow-2xl`}
          >
            <h2 className="text-xl font-bold mb-4">
              {currentAnime.title.english || currentAnime.title.romaji}
            </h2>
            <div className="relative pt-[56.25%]">
              {trailerUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full rounded-lg"
                  src={trailerUrl}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                  <p className="text-gray-400">Trailer not available</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="hover:bg-red-500 bg-primary dark:hover:bg-red-500"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
