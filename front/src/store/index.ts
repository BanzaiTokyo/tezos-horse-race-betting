import {configureStore} from '@reduxjs/toolkit';
import raceReducer from './race';
import statsReducer from './stats';
import playerReducer from './player';


const store = configureStore({
    reducer: {
        race: raceReducer,
        stats: statsReducer,
        player: playerReducer,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>
