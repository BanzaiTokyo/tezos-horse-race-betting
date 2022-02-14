import React from "react";
import {Button} from "react-bootstrap";
import {disconnectFromBeacon} from "../../services/BeaconService";
import {useDispatch} from "react-redux";
import {playerActions} from "../../store/player";

const DisconnectButton = (): JSX.Element => {
    const dispatch = useDispatch();

    const disconnectWallet = async (): Promise<void> => {
        disconnectFromBeacon().then(() => dispatch(playerActions.setConnetedWallet(null))).catch(error => console.log(error));
    }

    return (
        <Button variant={"outline-info"} onClick={disconnectWallet}>
            Disconnect
        </Button>
    );
};

export default DisconnectButton;
