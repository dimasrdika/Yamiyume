import { MdStar } from "react-icons/md";
import Link from "next/link";

interface AnimeCardProps {
  id: number;
  title: string;
  image: string;
  synopsis: string;
  genres: string[];
  rating: number;
  reviews: number;
  season: string;
  episodes: number;
  onToggleFavorite: (id: number) => void;
  isFavorite: boolean;
}

export default function AnimeCard({
  id,
  title,
  image,
  synopsis,
  genres,
  rating,
  reviews,
  season,
  episodes,
  onToggleFavorite,
  isFavorite,
}: AnimeCardProps) {
  const link = `/anime/${id}`;
  const truncatedSynopsis =
    synopsis && synopsis.length > 200
      ? synopsis.substring(0, 200) + "..."
      : synopsis || "No description available.";

  return (
    <Link href={link} className="block relative group">
      <div
        className="bg-cover bg-center rounded-lg mb-4"
        style={{ backgroundImage: `url(${image})`, paddingTop: "145%" }}
      >
        <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 rounded-lg flex items-center justify-center p-4">
          <div className="text-white space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>

            <div className="flex items-center space-x-2">
              <MdStar className="w-5 h-5 text-yellow-500" />
              <span>{rating}</span>
              <span>({reviews} reviews)</span>
            </div>

            <div className="text-sm">
              <span>{season} | </span>
              <span>{episodes} episodes</span>
            </div>

            <p className="text-xs">{truncatedSynopsis}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-yellow-500 transition-colors"
        >
          <MdStar
            className={`w-6 h-6 ${isFavorite ? "text-yellow-500" : ""}`}
          />
        </button>
      </div>

      {/* Title below the card */}
      <p className="mt-2 text-center text-sm font-semibold transition-opacity duration-300 ease-in-out group-hover:opacity-0">
        {title}
      </p>
    </Link>
  );
}