import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Horse from "../models/Horse";
import RaceInfo from "../models/RaceInfo";
import Lap from "../models/Lap";

interface RaceState {
    isContractStorageLoaded: boolean,
    isStarted: boolean
    horses: Horse[];
    info: RaceInfo;
    currentLap: Lap | null;
    totalLaps: number | null;
}


const initialRaceState: RaceState = {
    isContractStorageLoaded: false,
    isStarted: false,
    horses: [],
    info: {
        lapNumber: 0,
        totalBidAmount: 0,
        bets: []
    },
    currentLap: null,
    totalLaps: null,
};


const raceSlice = createSlice({
    name: 'race',
    initialState: initialRaceState,
    reducers: {

        updateHorses(state, action: PayloadAction<Horse[]>) {
            state.horses = action.payload;
        },

        setContractStorage(state, action: PayloadAction<any>) {
            console.log('--------- bets: ', action.payload.bets)
            const horses = action.payload.horses.map((h: any, i: number) => {
                let horse: Horse = {
                    id: i,
                    name: h.name,
                    color: h.color
                }
                return horse
            })
            let laps = [];
            for (let i = 0; i < action.payload.laps.size - 2; i++) {
                let lapSrc = action.payload.laps.get(i.toString())
                let horseIdx = lapSrc.positions[0]
                let lap: Lap = {lapNumber: i, winner: horses[horseIdx]}
                laps.push(lap)
            }
            // state.isStarted = action.payload.laps.size > 2;
            state.info = {
                lapNumber: action.payload.laps.size - 1,
                totalBidAmount: action.payload.bet_amount.toNumber(),
                bets: action.payload.bets, // fixme: check if the betsare read correctly
                laps: laps
            };
            state.horses = horses;
            state.totalLaps = 5;

            let currentLap = action.payload.laps.get(action.payload.laps.size - 1);
            state.currentLap = currentLap;

            console.log('---------------- contract storage: ', action.payload)
            console.log('---------------- bets: ', action.payload.bets)

            state.isContractStorageLoaded = true;
        }
    },
});

export const raceActions = raceSlice.actions;

export default raceSlice.reducer;