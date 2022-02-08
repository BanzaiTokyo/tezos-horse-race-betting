import Player from "./Player";
import Lap from "./Lap";

export default interface RaceInfo {
    raceNumber?: number;
    lapNumber: number;
    totalBidAmount: number;
    winners?: Player[];
    laps?: Lap[];
}