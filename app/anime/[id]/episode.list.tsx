"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Episode {
  id: number;
  title: string;
  aired: string;
  isFiller: boolean;
  isRecap: boolean;
}

interface VideoSource {
  url: string;
  quality: string;
}

interface AnimeDetails {
  title: string;
  coverImage: {
    extraLarge: string;
  };
}

export default function EpisodeList({ animeId }: { animeId: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>("");
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const fetchVideoSources = async (episodeId: number) => {
    setLoadingVideo(true);
    try {
      const apiUrl = `https://api.consumet.org/anime/anilist/watch/${episodeId}`;
      const response = await fetch(
        `/api/proxy?url=${encodeURIComponent(apiUrl)}`
      );
      if (!response.ok) throw new Error("Failed to fetch video sources");

      const data = await response.json();
      if (!data.sources || data.sources.length === 0) {
        throw new Error("No video sources found");
      }

      setVideoSources(data.sources);
      setCurrentQuality(data.sources[0].quality);
      return data.sources[0].url;
    } catch (error) {
      console.error("Error fetching video sources:", error);
      setError("Failed to load video sources. Please try again later.");
      return null;
    } finally {
      setLoadingVideo(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const numericAnimeId = Number(animeId);
        console.log("Fetching details for anime ID:", numericAnimeId);

        const animeRes = await fetch(`https://graphql.anilist.co`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                Media(id: ${numericAnimeId}) {
                  title {
                    romaji
                  }
                  coverImage {
                    extraLarge
                  }
                  episodes {
                    id
                    title
                    aired
                    isFiller
                    isRecap
                  }
                }
              }
            `,
          }),
        });

        if (!animeRes.ok) {
          const errorData = await animeRes.json();
          throw new Error(
            `Failed to fetch anime details: ${errorData.errors
              .map((err) => err.message)
              .join(", ")}`
          );
        }

        const animeData = await animeRes.json();
        const media = animeData.data.Media;

        setAnimeDetails({
          title: media.title.romaji,
          coverImage: media.coverImage,
        });
        setEpisodes(media.episodes);
      } catch (error) {
        setError("Failed to load anime data. Please try again later.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [animeId]);

  const playEpisode = async (episode: Episode) => {
    setCurrentEpisode(episode);
    await fetchVideoSources(episode.id);
  };

  const changeQuality = (quality: string) => {
    const source = videoSources.find((s) => s.quality === quality);
    if (source) {
      setCurrentQuality(quality);
    }
  };

  const getCurrentVideoUrl = () => {
    const source = videoSources.find((s) => s.quality === currentQuality);
    return source?.url || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {currentEpisode && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h4 className="text-lg font-semibold mb-2">
              Now Playing: Episode {currentEpisode.id} - {currentEpisode.title}
            </h4>
            <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {loadingVideo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
              ) : videoSources.length > 0 ? (
                <>
                  <video
                    key={getCurrentVideoUrl()}
                    controls
                    className="w-full h-full"
                    poster={animeDetails?.coverImage.extraLarge}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    playsInline
                    autoPlay
                  >
                    <source src={getCurrentVideoUrl()} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {videoSources.map((source) => (
                      <Button
                        key={source.quality}
                        size="sm"
                        variant={
                          currentQuality === source.quality
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => changeQuality(source.quality)}
                      >
                        {source.quality}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">
                    No video available for this episode
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((episode) => (
          <Card
            key={episode.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="relative aspect-video w-full mb-2">
                <Image
                  src={
                    animeDetails?.coverImage.extraLarge || "/placeholder.png"
                  }
                  alt={`Thumbnail for ${episode.title}`}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={episode.id <= 4}
                />
                <Button
                  onClick={() => playEpisode(episode)}
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 w-full h-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                >
                  <PlayCircle className="h-12 w-12 text-white" />
                  <span className="sr-only">Play episode {episode.id}</span>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  Episode {episode.id}
                </span>
                {episode.isFiller && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                    Filler
                  </span>
                )}
                {episode.isRecap && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                    Recap
                  </span>
                )}
              </div>

              <h5 className="text-base font-semibold line-clamp-2">
                {episode.title}
              </h5>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(episode.aired).toLocaleDateString("en-US")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
