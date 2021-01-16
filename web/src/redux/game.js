import { createSlice } from '@reduxjs/toolkit'

const gameSlice = createSlice({
    name: 'game',
    initialState: {},
    reducers: {
        join: (state, action) => (state = action.payload),
        quit: (state) => (state = {}),
    },
})

export const { join, quit } = gameSlice.actions
export default gameSlice.reducer
