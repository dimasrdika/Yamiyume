import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [] as number[],
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.indexOf(action.payload)
      if (index !== -1) {
        state.splice(index, 1)
      } else {
        state.push(action.payload)
      }
    },
  },
})

export const { toggleFavorite } = favoritesSlice.actions
export default favoritesSlice.reducer