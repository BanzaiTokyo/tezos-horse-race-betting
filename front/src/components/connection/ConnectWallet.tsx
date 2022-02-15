import React from "react";
import {Button} from "react-bootstrap";
import {playerActions} from "../../store/player";
import {useDispatch} from "react-redux";
import {getMyAddress, getUUSDBalance} from "../../services/BeaconService";


const ConnectButton = (): JSX.Element => {
    const dispatch = useDispatch();

    const connectWallet = async () => {
        getMyAddress().then(walletAddress => {
            dispatch(playerActions.setConnetedWallet(walletAddress));
            getUUSDBalance(walletAddress).then((balance: number) => {dispatch(playerActions.setBalance(balance))})
        }).catch(error => console.log(error));


    }

    return (
        <div className="buttons">
            <Button variant={"outline-info"} onClick={connectWallet}>
                Connect wallet
            </Button>

        </div>
    );
};

export default ConnectButton;
