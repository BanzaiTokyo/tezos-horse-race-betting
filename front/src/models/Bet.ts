import Horse from "./Horse";

export default interface Bet {
    selectedHorse?: Horse;
    amount: number;
    player?: string;
    isProcessing?: boolean;
    isSubmitted?: boolean;
}