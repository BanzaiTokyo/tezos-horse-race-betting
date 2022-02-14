import Lap from "./Lap";
import Bet from "./Bet";

export default interface RaceInfo {
    raceNumber?: number;
    lapNumber: number;
    totalBidAmount: number;
    bets: Bet[]
    winnerWallets?: string[];
    laps?: Lap[];
}