import React from "react";
import {Card, Col, ProgressBar, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import Horse from "../models/Horse";
import HorseImage from '../assets/HorseImage';
import TweenOne from 'rc-tween-one';
import {playerActions} from "../store/player";
import {ensure} from "../common/helpers";

const HORSE_ZERO_POSITION = 200;
const TRACK_LENGTH = 800;
const MARGIN = 30;
const HORSE_EM = 2.5

const RaceInfo = () => {

    const dispatch = useDispatch();

    const horses: Horse[] = useSelector((state: RootState) => state.race.horses);
    const selectedHorseId = useSelector((state: RootState) => state.player.currentBet.selectedHorse?.id);
    const isRaceStarted = useSelector((state: RootState) => state.race.isStarted);
    const currentLap = useSelector((state: RootState) => state.race.currentLap);

     function getPositionForHorse(horse: Horse) {
        const position: any = currentLap?.positions.findIndex((position) => position === horse.id);
        const percentage = position / (currentLap?.positions.length ?? 1) * 100;
        const min = TRACK_LENGTH / 100 * percentage - MARGIN;
        const max = TRACK_LENGTH / 100 * percentage + MARGIN;
        const result = Math.random() * (max - min) + min;
        return HORSE_ZERO_POSITION + HORSE_ZERO_POSITION + Math.floor( result);
    }


    function onHorseSelected(horseId: number) {

        const horse: Horse = ensure<Horse>(horses.find(horse => horse.id === horseId));
        dispatch(playerActions.setHorseToBetOn(horse));
    }

    return (
        <Card>
            <Card.Body>
                {horses.map(horse => {
                    const rowStyle = (selectedHorseId === horse.id) ? {
                        height: `${HORSE_EM}em`,
                        border: "1px dotted"
                    } : {height: `${HORSE_EM}em`};

                    const horseProgress = isRaceStarted ? getPositionForHorse(horse) : HORSE_ZERO_POSITION;

                    return (
                        <Row key={horse.id} className="align-items-center" style={rowStyle}>
                            <Col sm={2}>
                                <span
                                    style={{
                                        height: `${HORSE_EM}em`,
                                        width: `${HORSE_EM}em`,
                                        display: 'inline-block',
                                        paddingTop: "-5px",
                                    }}>
                                <TweenOne animation={{x: `${horseProgress / 16}em`}}>
                                    <HorseImage horseColor={horse.color}/>
                                </TweenOne>
                                                                </span>

                                <span style={{color: horse.color}}
                                      onClick={() => onHorseSelected(horse.id)}>
                                    {horse.name}
                                </span>

                            </Col>
                            <Col sm={10}><ProgressBar striped variant="success" now={0} animated/></Col>
                        </Row>)
                })}
            </Card.Body>
        </Card>
    );

}

export default RaceInfo;