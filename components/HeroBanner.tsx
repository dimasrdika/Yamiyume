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

const client = new GraphQLClient("https://graphql.anilist.co");

const query = gql`
  query {
    Page(page: 1, perPage: 10) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        bannerImage
        description
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
  description: string;
}

// Utility function to remove HTML tags
const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function HeroBanner() {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites);
  const [currentAnime, setCurrentAnime] = useState<Anime | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        const data = await client.request<{ Page: { media: Anime[] } }>(query);
        setTopAnime(data.Page.media);
        // Randomly select an anime from the fetched list
        const randomIndex = Math.floor(Math.random() * data.Page.media.length);
        setCurrentAnime(data.Page.media[randomIndex]);
      } catch {
        setError("Failed to load top anime. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopAnime();
  }, []);

  if (loading)
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );

  if (error)
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );

  // Handle case if no anime is available
  if (!currentAnime) return null;

  // Clean the description by removing HTML tags
  const cleanedDescription = stripHtml(
    currentAnime.description || "No synopsis available."
  );

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-lg shadow-lg">
      <div className="relative w-full h-full">
        <Image
          src={currentAnime.bannerImage || "/fallback-image.jpg"}
          alt={currentAnime.title.romaji || "Anime Banner"}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          quality={100}
          priority
          className="transition-transform duration-500 ease-in-out transform hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/fallback-image.jpg"; // Specify your fallback image
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-center items-start p-8 max-w-2xl space-y-4">
          <h2 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-2 shadow-md">
            {currentAnime.title.english || currentAnime.title.romaji}
          </h2>
          <p className="text-gray-200 text-md md:text-lg line-clamp-3 font-light leading-relaxed mb-4 shadow-md">
            {showFullDescription
              ? cleanedDescription
              : cleanedDescription.length > 100
              ? `${cleanedDescription.slice(0, 100)}...`
              : cleanedDescription}
          </p>
          <Button
            variant="link"
            size="sm"
            className="text-white underline mt-2"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "See Less" : "See More"}
          </Button>
          <div className="flex items-center space-x-4 mt-4">
            <Button
              variant="default"
              size="lg"
              aria-label="Watch Now"
              className="bg-[#f47521] hover:bg-[#ff8c44] text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-md transform transition-transform duration-200 hover:scale-105"
            >
              <FaPlay className="w-5 h-5 mr-2" /> Watch Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(toggleFavorite(currentAnime.id))}
              aria-label={
                favorites.includes(currentAnime.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className="bg-white/10 hover:bg-white/20 border-white/50 transition-colors rounded-full shadow-md transform transition-transform duration-200 hover:scale-105"
            >
              <FaStar
                className={`w-5 h-5 ${
                  favorites.includes(currentAnime.id)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
