import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Bet from "../models/Bet";
import Horse from "../models/Horse";


interface PlayerState {
    connectedWallet: string | null;
    currentBet: Bet;
}

const initialPlayerState: PlayerState = {
    connectedWallet: null,
    currentBet: {isProcessing: false, amount: 0, isSubmitted: false},

};


const playerSlice = createSlice({
    name: 'player',
    initialState: initialPlayerState,
    reducers: {

        setConnetedWallet(state, action: PayloadAction<string | null>) {
            state.connectedWallet = action.payload;
        },
        setHorseToBetOn(state, action: PayloadAction<Horse>) {
            state.currentBet.selectedHorse = action.payload;
        },

        setCurrentBet(state, action: PayloadAction<number>) {
            state.currentBet.amount = action.payload;
        },
    },
});

export const playerActions = playerSlice.actions;

export default playerSlice.reducer;