"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

interface Episode {
  id: number;
  title: string;
  number: number;
}

interface EpisodeListProps {
  animeId: string;
  episodes: Episode[];
}

export default function EpisodeList({ animeId, episodes }: EpisodeListProps) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const playEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    // Logic to play the episode can go here
    console.log(`Playing episode ${episode.number}: ${episode.title}`);
  };

  return (
    <div>
      {currentEpisode && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
          </CardHeader>
          <CardContent>
            Episode {currentEpisode.number}: {currentEpisode.title}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <Button
            key={episode.id}
            onClick={() => playEpisode(episode)}
            variant="outline"
            className="justify-start"
          >
            <Play className="mr-2 h-4 w-4" />
            <span className="truncate">
              Ep {episode.number}: {episode.title}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
