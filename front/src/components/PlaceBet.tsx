import React, {ChangeEvent} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import {raceActions} from "../store/race";
import Horse from "../models/Horse";
import {placeBet} from "../services/BeaconService";

const PlaceBet = () => {
    const dispatch = useDispatch();

    const horses = useSelector((state: RootState) => state.race.horses);
    const currentBetAmount: number = useSelector((state: RootState) => state.race.currentBet.amount);
    const selectedHorse = useSelector((state: RootState) => state.race.currentBet.selectedHorse);


    function ensure<T>(argument: T | undefined | null, message: string = 'This value was promised to be there.'): T {
        if (argument === undefined || argument === null) {
            throw new TypeError(message);
        }
        return argument;
    }

    function onHorseSelected(event: any) {

        const horse: Horse = ensure<Horse>(horses.find(horse => horse.id === parseInt(event.target.value)));
        dispatch(raceActions.setHorseToBetOn(horse));
    }

    const onPlaceBetClicked = async (event: any) => {
        event.preventDefault();

        placeBet(currentBetAmount, selectedHorse?.id).then(r => {
                console.log('------------- the bet was successfully placed: ', r)
            }
        ).catch(e => console.log(e));

    }

    const onAmountChanged = (event: ChangeEvent<HTMLSelectElement>) => {
        dispatch(raceActions.setCurrentBet(event.target.value ? parseFloat(event.target.value) : 0));
        return;
    }

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
                            placeholder="Choose your horse"
                            onChange={onHorseSelected}
                        >

                            {horses.map((horse) => {
                                return <option key={horse.id} value={horse.id}>{horse.name}</option>
                            })}
                        </Form.Select>
                    </Col>
                    <Col sm={2}>
                        <div className="d-grid">
                            <Button variant="info" type="submit">
                                Bet
                            </Button>
                        </div>
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );

}

export default PlaceBet;