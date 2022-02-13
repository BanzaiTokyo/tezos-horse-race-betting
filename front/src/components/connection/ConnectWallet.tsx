import React from "react";
import {Button} from "react-bootstrap";
import {playerActions} from "../../store/player";
import {useDispatch} from "react-redux";
import {getMyAddress} from "../../services/BeaconService";


const ConnectButton = (): JSX.Element => {
    const dispatch = useDispatch();

    const connectWallet = async () => {
        getMyAddress().then(address => {
            dispatch(playerActions.setConnetedWallet(address));
        }).catch(error => console.log(error));
    }

    return (
        <div className="buttons">
            <Button variant={"outline-info"} onClick={connectWallet}>
                Connect with wallet
            </Button>

        </div>
    );
};

export default ConnectButton;
