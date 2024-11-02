import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("https://graphql.anilist.co");

const ANIME_QUERY = `
query ($page: Int, $search: String) {
  Page(page: $page, perPage: 24) {
    media(search: $search, sort: [POPULARITY_DESC]) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
      }
      description
    }
    pageInfo {
      total
      currentPage
      lastPage
    }
  }
}
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page, search } = req.query;
  console.log(`Received request with page: ${page}, search: ${search}`);

  try {
    const variables = { page: Number(page) || 1, search: search || undefined };
    const data = await client.request(ANIME_QUERY, variables);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from Anilist API:", error);
    res.status(500).json({ error: "Failed to fetch anime data." });
  }
}
