import Horse from "./Horse";

export default interface Lap {
    lapNumber: number;
    winner?: Horse;
    positions: number[]
}