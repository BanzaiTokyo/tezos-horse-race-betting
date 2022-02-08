import Horse from "./Horse";

export default interface Bet {
    selectedHorse?: Horse;
    amount: number;
    isProcessing: boolean;
    isSubmitted: boolean;
}