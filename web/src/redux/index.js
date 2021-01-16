import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './game'

const store = configureStore({
    reducer: {
        game: gameReducer,
    },
})

export default store
