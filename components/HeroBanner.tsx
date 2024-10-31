"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/redux/slices/favoritesSlice";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";

interface Anime {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
}

const fetchSeasonalAnime = async (): Promise<Anime[]> => {
  try {
    const response = await fetch(
      "https://api.jikan.moe/v4/seasons/now?limit=5"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data as Anime[];
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default function HeroBanner() {
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const autoplay = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  useEffect(() => {
    const getSeasonalAnime = async () => {
      try {
        const data = await fetchSeasonalAnime();
        setSeasonalAnime(data);
      } catch (error) {
        console.error("Error fetching seasonal anime:", error);
        setError("Failed to load seasonal anime. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getSeasonalAnime();
  }, []);

  useEffect(() => {
    if (emblaApi) {
      const intervalId = setInterval(autoplay, 5000);
      return () => clearInterval(intervalId);
    }
  }, [emblaApi, autoplay]);

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <Carousel className="w-full">
        <CarouselContent>
          {seasonalAnime.map((anime) => (
            <CarouselItem key={anime.mal_id}>
              <Card className="relative overflow-hidden rounded-none shadow-lg">
                <CardContent className="p-0">
                  <div className="relative h-[600px]">
                    <Image
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      layout="fill"
                      objectFit="cover"
                      quality={100}
                      priority
                      className="brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center p-12 max-w-3xl">
                      <h2 className="text-white text-5xl font-bold leading-tight mb-4">
                        {anime.title}
                      </h2>
                      <p className="text-gray-200 text-lg line-clamp-3 font-light leading-relaxed mb-6">
                        {anime.synopsis || "No synopsis available."}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="default"
                          size="lg"
                          className="bg-[#f47521] hover:bg-[#ff8c44] text-white font-semibold py-2 px-6 rounded-full transition-colors"
                        >
                          <Play className="w-5 h-5 mr-2" /> Watch Now
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => dispatch(toggleFavorite(anime.mal_id))}
                          aria-label={
                            favorites.includes(anime.mal_id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className="bg-white/10 hover:bg-white/20 border-white/50 transition-colors rounded-full"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              favorites.includes(anime.mal_id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white"
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white" />
        <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white" />
      </Carousel>
    </div>
  );
}
