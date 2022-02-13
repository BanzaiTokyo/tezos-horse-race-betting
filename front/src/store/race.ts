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
        totalBidAmount: 0
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
            const horses = action.payload.horses.map((h: any, i: number) => {
                let horse: Horse = {
                    id: i,
                    name: h.name
                }
                return horse
            })
            let laps = [];
            let currentLap = null;
            for (let i=0; i < action.payload.laps.size - 2; i++ ) {
                let lapSrc = action.payload.laps.get(i.toString())
                let horseIdx = lapSrc.positions[0]
                let lap:Lap = {lapNumber: i, winner: horses[horseIdx]}
                currentLap = lap;
                laps.push(lap)
            }
                // state.isStarted = action.payload.laps.size > 2;
                state.info = {
                        lapNumber: action.payload.laps.size - 1,
                        totalBidAmount: action.payload.bet_amount.toNumber(),
                        laps: laps
                      };
                state.horses =  horses;
                state.currentLap =  currentLap;
                state.totalLaps = 5;
            console.log('---------------- contract storage: ', action.payload)
            console.log('---------------- currentLap: ', currentLap)

            state.isContractStorageLoaded = true;
        }
    },
});

export const raceActions = raceSlice.actions;

export default raceSlice.reducer;