"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MdWbSunny, MdNightlight } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Navigation() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-transparent shadow-none z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center text-2xl font-bold font-inter"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-3xl font-bold">Yamiyume</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/favorites"
            className="hover:text-primary transition-colors text-lg" // Changed to use primary color
          >
            Favorites
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <MdWbSunny className="h-5 w-5" />
            ) : (
              <MdNightlight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
