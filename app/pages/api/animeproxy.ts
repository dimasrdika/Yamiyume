// pages/api/animeProxy.ts

import { NextApiRequest, NextApiResponse } from "next";

async function fetchAnimeData() {
  // Make sure to replace this with an actual external API request.
  const response = await fetch("https://api.example.com/anime"); // Replace with your actual URL
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return await response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const data = await fetchAnimeData(); // Fetch anime data from the external API
      res.status(200).json(data); // Send the fetched data back as JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch data" }); // Handle the error
    }
  } else {
    res.status(404).json({ error: "Not Found" }); // Handle other HTTP methods
  }
}
