// slices/animeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Anime } from "../../types/anime";

interface AnimeState {
  animes: Anime[];
}

const initialState: AnimeState = {
  animes: [],
};

const animeSlice = createSlice({
  name: "anime",
  initialState,
  reducers: {
    saveAnimes: (state, action: PayloadAction<Anime[]>) => {
      state.animes = action.payload;
    },
    clearAnimes: (state) => {
      state.animes = [];
    },
  },
});

export const { saveAnimes, clearAnimes } = animeSlice.actions;
export default animeSlice.reducer;
