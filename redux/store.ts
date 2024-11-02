import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";
import animeReducer from "./slices/animeSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    anime: animeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
