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

export interface CoverImage {
  large: string;
  small?: string;
}

export interface Episode {
  id: number;
  title: string;
  thumbnail: string;
  url: string;
}

export interface Anime {
  episodes: Episode[];
  description: string;
  coverImage: CoverImage;
  mal_id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  images: Images;
  genres: Genre[];
  synopsis?: string;
}
