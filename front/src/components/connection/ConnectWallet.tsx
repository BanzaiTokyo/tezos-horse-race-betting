import React from "react";
import {Button} from "react-bootstrap";
import {raceActions} from "../../store/race";
import {useDispatch} from "react-redux";
import {connectToBeacon, getMyAddress} from "../../services/BeaconService";


const ConnectButton = (): JSX.Element => {
    const dispatch = useDispatch();

    const connectWallet = async () => {
        console.log('connecting to wallet')
        getMyAddress().then(address => {
            console.log('---------------------- address: ', address);
            dispatch(raceActions.setConnetedWallet(address));
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
