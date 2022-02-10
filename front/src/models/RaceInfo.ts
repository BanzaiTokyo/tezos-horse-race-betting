import Lap from "./Lap";

export default interface RaceInfo {
    raceNumber?: number;
    lapNumber: number;
    totalBidAmount: number;
    winnerWallets?: string[];
    laps?: Lap[];
}