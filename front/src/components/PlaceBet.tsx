import React, {ChangeEvent} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import {playerActions} from "../store/player";
import Horse from "../models/Horse";
import {placeBet} from "../services/BeaconService";
import {ensure} from "../common/helpers";
import ConnectButton from "./connection/ConnectWallet";

const PlaceBet = () => {
    const dispatch = useDispatch();

    const horses = useSelector((state: RootState) => state.race.horses);
    const currentBetAmount: number = useSelector((state: RootState) => state.player.currentBet.amount);
    const selectedHorse = useSelector((state: RootState) => state.player.currentBet.selectedHorse);
    const userWallet = useSelector((state: RootState) => state.player.connectedWallet);
    const balance = useSelector((state: RootState) => state.player.balance);
    const isBetReady: boolean = selectedHorse! && currentBetAmount > 0;

    function onHorseSelected(event: any) {

        const horse: Horse = ensure<Horse>(horses.find(horse => horse.id === parseInt(event.target.value)));
        dispatch(playerActions.setHorseToBetOn(horse));
    }

    const onPlaceBetClicked = async (event: any) => {
        event.preventDefault();

        placeBet(currentBetAmount, selectedHorse?.id, userWallet!).then(r => {
         dispatch(playerActions.clearBet());
                console.log('------------- the bet was successfully placed: ', r)
            }
        ).catch(e => console.log(e));

    }

    const onAmountChanged = (event: ChangeEvent<HTMLSelectElement>) => {
        dispatch(playerActions.setCurrentBet(event.target.value ? parseFloat(event.target.value) : 0));
        return;
    }

    //we might want to use {balance} to limit the maximum bet the player can place.
    return (<div>
            <Form onSubmit={onPlaceBetClicked}>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                    <Form.Group as={Col} md="4" controlId="validationFormikUsername2">

                        <InputGroup hasValidation>
                            <InputGroup.Text>uUSD</InputGroup.Text>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.1"
                                name={"amount"}
                                onChange={(e) => onAmountChanged(e as any)}
                                value={currentBetAmount}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Incorrect amount.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Col>
                        <Form.Select
                            name={"horse"}
                            aria-label="Default select example"
                            onChange={onHorseSelected}
                            value={selectedHorse?.id}
                        >

                            {horses.map((horse) => {
                                return <option key={horse.id} value={horse.id}>{horse.name}</option>
                            })}
                        </Form.Select>
                    </Col>
                    <Col sm={3}>
                        <div className="d-grid">
                            {userWallet ? <Button variant="info" type="submit" disabled={!isBetReady}>
                                    place bet
                                </Button>
                                :

                                <ConnectButton/>}

                        </div>
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );

}

export default PlaceBet;