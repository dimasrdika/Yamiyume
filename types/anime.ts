// types/anime.ts
export interface Genre {
  mal_id: number;
  name: string;
}

export interface Images {
  jpg: {
    large_image_url: string;
  };
}

export interface Anime {
  mal_id: number;
  title: string;
  images: Images; // Pastikan ada properti images
  genres: Genre[];
  synopsis?: string; // Make it optional if not all anime have a synopsis
}
