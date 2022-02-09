import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Horse from "../models/Horse";
import RaceInfo from "../models/RaceInfo";
import Player from "../models/Player";
import Bet from "../models/Bet";

interface RaceState {
    isStarted: boolean
    horses: Horse[];
    info: RaceInfo;
    currentLap: number;
    connectedPlayer?: Player;
    totalLaps: number | null;
    currentBet: Bet;
}

function getFakeHorses() {
    const fakeInitialHorses: Horse[] = [];
    fakeInitialHorses.push({id: 0, name: "Secretariat", numberOfBids: 0, totalBidAmount: 0})
    fakeInitialHorses.push({id: 1, name: "Noble Fair", numberOfBids: 0, totalBidAmount: 0})
    fakeInitialHorses.push({id: 2, name: "Desert Orchid", numberOfBids: 0, totalBidAmount: 0})
    fakeInitialHorses.push({id: 3, name: "American Pharaoh", numberOfBids: 0, totalBidAmount: 0})
    fakeInitialHorses.push({id: 4, name: "Desert Orchid", numberOfBids: 0, totalBidAmount: 0})
    fakeInitialHorses.push({id: 5, name: "Seattle Slew", numberOfBids: 0, totalBidAmount: 0})
    return fakeInitialHorses;
}

const initialRaceState: RaceState = {
    isStarted: true,
    horses: getFakeHorses(),
    info: {
        lapNumber: 0,
        totalBidAmount: 0
    },
    currentLap: 0,
    totalLaps: null,
    currentBet: {isProcessing: false, amount: 0, isSubmitted: false},
};


const raceSlice = createSlice({
    name: 'race',
    initialState: initialRaceState,
    reducers: {

        updateHorses(state, action: PayloadAction<Horse[]>) {
            state.horses = action.payload;
        },

        selectHorseToBetOn(state, action: PayloadAction<Horse>){
            state.currentBet.selectedHorse = action.payload;
        }
    },
});

export const raceActions = raceSlice.actions;

export default raceSlice.reducer;