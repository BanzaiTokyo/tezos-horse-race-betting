import {configureStore} from '@reduxjs/toolkit';
import raceReducer from './race';
import statsReducer from './stats';


const store = configureStore({
    reducer: {
        race: raceReducer,
        stats: statsReducer,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>
