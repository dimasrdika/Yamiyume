import Image from "next/image";
import Link from "next/link";
import { MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/redux/slices/favoritesSlice";
import { RootState } from "@/redux/store";

interface AnimeCardProps {
  id: number;
  title: string;
  image: string;
  synopsis?: string;
}

export default function AnimeCard({ id, title, image }: AnimeCardProps) {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.includes(id)
  );

  return (
    <div className="flex justify-center items-center p-2">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 w-48 h-72">
        <Link href={`/anime/${id}`}>
          <Image
            src={image}
            alt={title}
            width={192}
            height={256}
            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out hover:opacity-90"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-2">
            <h3 className="text-sm font-semibold text-white truncate">
              {title}
            </h3>
          </div>
        </Link>
        <button
          onClick={() => dispatch(toggleFavorite(id))}
          className="absolute top-2 right-2 text-gray-500 hover:text-yellow-500 transition-colors"
        >
          <MdStar
            className={`w-6 h-6 ${isFavorite ? "text-yellow-500" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
