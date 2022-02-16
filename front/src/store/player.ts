import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Bet from "../models/Bet";
import Horse from "../models/Horse";


interface PlayerState {
    connectedWallet: string | null;
    currentBet: Bet;
    balance: number;
}

const initialBet = {isProcessing: false, amount: 0, isSubmitted: false};

const initialPlayerState: PlayerState = {
    connectedWallet: null,
    currentBet: initialBet,
    balance: 0
};


const playerSlice = createSlice({
    name: 'player',
    initialState: initialPlayerState,
    reducers: {

        setConnetedWallet(state, action: PayloadAction<string | null>) {
            state.connectedWallet = action.payload;
        },
        clearBet(state, _action: PayloadAction<void>) {
            state.currentBet = initialBet;
        },
        setHorseToBetOn(state, action: PayloadAction<Horse>) {
            state.currentBet.selectedHorse = action.payload;
        },
        setCurrentBet(state, action: PayloadAction<number>) {
            state.currentBet.amount = action.payload;
        },
        setBalance(state, action: PayloadAction<number>) {
            state.balance = action.payload;
        }
    },
});

export const playerActions = playerSlice.actions;

export default playerSlice.reducer;