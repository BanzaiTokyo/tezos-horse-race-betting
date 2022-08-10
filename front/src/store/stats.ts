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
        addRaceToStats(state, action: PayloadAction<any>) {
            let r: RaceInfo = {
                raceNumber: action.payload.raceNumber.toNumber(),
                lapNumber: action.payload.laps.size,
                totalBetAmount: action.payload.bet_amount.toNumber() / 1e12,
                winner: action.payload.horses[action.payload.winner.toNumber()].name,
                bets: [],
            }
            state.previousRaces.push(r);
        },
    },
});

export const statsActions = statsSlice.actions;

export default statsSlice.reducer;