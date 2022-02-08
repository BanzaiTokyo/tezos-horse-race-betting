import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import RaceInfo from "../models/RaceInfo";


interface StatsState {
    previousRaces: RaceInfo[]
}

const initialStatsState: StatsState = {
    previousRaces: [],
};


const statsSlice = createSlice({
    name: 'stats',
    initialState: initialStatsState,
    reducers: {

        updatePreviousRaces(state, action: PayloadAction<RaceInfo[]>) {
            state.previousRaces = action.payload;
        },

        addRaceToStats(state, action: PayloadAction<RaceInfo>) {
            state.previousRaces.push(action.payload);
        },
    },
});

export const statsActions = statsSlice.actions;

export default statsSlice.reducer;