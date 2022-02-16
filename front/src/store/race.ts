import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Horse from "../models/Horse";
import RaceInfo from "../models/RaceInfo";
import Lap from "../models/Lap";
import {ensure} from "../common/helpers";

interface RaceState {
    isContractStorageLoaded: boolean;
    isStarted: boolean;
    horses: Horse[];
    info: RaceInfo;
    currentLap: Lap | null;
}


const initialRaceState: RaceState = {
    isContractStorageLoaded: false,
    isStarted: false,
    horses: [],
    info: {
        lapNumber: 0,
        totalBetAmount: 0,
        bets: []
    },
    currentLap: null,
};


const raceSlice = createSlice({
    name: 'race',
    initialState: initialRaceState,
    reducers: {

        setRaceId(state, action: PayloadAction<number>) {
            state.info.raceNumber = action.payload;
        },
        updateHorses(state, action: PayloadAction<Horse[]>) {
            state.horses = action.payload;
        },

        setContractStorage(state, action: PayloadAction<any>) {
            const horses = action.payload.horses.map((h: any, i: number) => {
                let horse: Horse = {
                    id: i,
                    name: h.name,
                    color: h.color
                }
                return horse
            })
            let laps: Lap[] = [];
            for (let i = 0; i < action.payload.laps.size; i++) {
                let lapSrc = action.payload.laps.get(i.toString());
                let horseIdx = lapSrc.positions[0];

                //FIXME: tested on the single lap. The winner is actually the last horse
                let lap: Lap = {lapNumber: i, winner: horses[horseIdx], positions: lapSrc.positions.map((position:any) => position.toNumber())};
                laps.push(lap);
            }

            function transformToFrontBet(bet: any) {
                const selectedHorse: Horse = ensure<Horse>(horses.find((horse: Horse) => horse.id === bet.horse.toNumber()));
                return {amount: (bet.amount.toNumber() / 1e12), selectedHorse, player: bet.player.toString()};
            }

            state.info = {
                raceNumber: state.info.raceNumber,
                lapNumber: laps.length - 1,
                totalBetAmount: action.payload.bet_amount.toNumber() / 1e12,
                bets: action.payload.bets.map((bet: any) => transformToFrontBet(bet)),
                laps
            };

            state.horses = horses;
            state.currentLap = laps[(action.payload.laps.size - 1)];
            state.isStarted = laps.length > 0;
            state.isContractStorageLoaded = true;
        }
    },
});

export const raceActions = raceSlice.actions;

export default raceSlice.reducer;