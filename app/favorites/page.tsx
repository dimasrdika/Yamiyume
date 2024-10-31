"use client"

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import AnimeCard from '@/components/AnimeCard'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Favorites() {
  const favorites = useSelector((state: RootState) => state.favorites)
  const [favoriteAnimes, setFavoriteAnimes] = useState([])

  useEffect(() => {
    const fetchFavoriteAnimes = async () => {
      const animes = await Promise.all(
        favorites.map(async (id) => {
          const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`)
          return response.data.data
        })
      )
      setFavoriteAnimes(animes)
    }

    fetchFavoriteAnimes()
  }, [favorites])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 font-inter">Your Favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteAnimes.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            id={anime.mal_id}
            title={anime.title}
            image={anime.images.jpg.image_url}
            synopsis={anime.synopsis}
          />
        ))}
      </div>
    </div>
  )
}