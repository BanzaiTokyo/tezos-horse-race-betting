import {Alert, Button} from "react-bootstrap";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import {withdrawPrize} from "../services/BeaconService";
import {playerActions} from "../store/player";

const Withdraw = () => {
    const dispatch = useDispatch();

    const prizeAmount = useSelector((state: RootState) => state.player.prizeToWithdraw);
    const wallet = useSelector((state: RootState) => state.player.connectedWallet);

    const onWithdrawClick = async () => {
        wallet && withdrawPrize(wallet).then(walletAddress => {
            dispatch(playerActions.setPrizeToWithdraw(0));
        }).catch(error => console.log(error));
    }

    return (<div>
            <Alert variant="info">
                <Alert.Heading>Congrats!</Alert.Heading>
                <p>
                    You have won <strong>{prizeAmount}</strong> uUSD!</p>
                <Button onClick={onWithdrawClick}>Withdraw</Button>
            </Alert>
        </div>
    );
}

export default Withdraw;
