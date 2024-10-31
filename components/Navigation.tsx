"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MdWbSunny, MdNightlight } from "react-icons/md"; // Import icons from react-icons
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold font-inter">
          Yume
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/favorites"
            className="hover:text-[#FFAD60] transition-colors"
          >
            Favorites
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <MdWbSunny className="h-5 w-5" /> // Replace with react-icons sunny icon
            ) : (
              <MdNightlight className="h-5 w-5" /> // Replace with react-icons moon icon
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
