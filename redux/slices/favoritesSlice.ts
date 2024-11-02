import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: [] as number[],
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.indexOf(action.payload);
      if (index !== -1) {
        state.splice(index, 1); // Remove from favorites
      } else {
        state.push(action.payload); // Add to favorites
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      const index = state.indexOf(action.payload);
      if (index !== -1) {
        state.splice(index, 1); // Remove from favorites
      }
    },
  },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
