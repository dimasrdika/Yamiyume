import Link from "next/link";
import { MdStar } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/redux/slices/favoritesSlice";
import { RootState } from "@/redux/store";

interface AnimeCardProps {
  id: number;
  title: string;
  image: string;
  synopsis: string;
}

export default function AnimeCard({ id, title, image }: AnimeCardProps) {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.includes(id)
  );

  const link = `/anime/${id}`;

  return (
    <Link href={link} className="block relative group">
      <div
        className="bg-cover bg-center rounded-lg mb-4"
        style={{ backgroundImage: `url(${image})`, paddingTop: "160%" }}
      >
        <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 rounded-lg flex items-center justify-center">
          <h3 className="text-white text-lg font-semibold opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
            {title}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent link click
            dispatch(toggleFavorite(id));
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-yellow-500 transition-colors"
        >
          <MdStar
            className={`w-6 h-6 ${isFavorite ? "text-yellow-500" : ""}`}
          />
        </button>
      </div>
    </Link>
  );
}
