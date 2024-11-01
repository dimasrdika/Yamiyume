import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query; // Get the URL from the query parameters

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await fetch(url); // Fetch the requested URL
    const data = await response.json(); // Parse the response as JSON
    res.status(response.status).json(data); // Send the response back to the client
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" }); // Handle errors
  }
}
