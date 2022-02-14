import ConnectButton from "./ConnectWallet";
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import DisconnectButton from "./DisconnectWallet";


const WalletConnection = () => {
    const connectedWallet = useSelector((state: RootState) => state.player.connectedWallet);


    return (!connectedWallet ?

            <ConnectButton/> : <span> {connectedWallet} {' '}
            <DisconnectButton/></span>
    );
}

export default WalletConnection;