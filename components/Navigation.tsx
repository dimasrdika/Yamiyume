"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MdWbSunny, MdNightlight } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Navigation() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${
        isScrolled
          ? theme === "dark"
            ? "bg-gray-900"
            : "bg-white shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo Section */}
        <Link href="/" className="flex items-center text-2xl font-bold">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-3xl font-title text-primary font-bold">
            Yamiyume
          </span>
        </Link>

        {/* Desktop and Mobile Menu */}
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/favorites"
            className="hover:text-primary transition-colors  text-lg leading-none" // Adjusted line height
          >
            Favorites
          </Link>
          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <MdWbSunny className="h-5 w-5 text-primary" />
              ) : (
                <MdNightlight className="h-5 w-5 text-primary" />
              )}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
