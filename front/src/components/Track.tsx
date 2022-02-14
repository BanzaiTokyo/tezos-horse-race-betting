import React from "react";
import {Card, Col, ProgressBar, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import Horse from "../models/Horse";
import HorseImage from '../assets/HorseImage';
import TweenOne from 'rc-tween-one';
import {playerActions} from "../store/player";
import {ensure} from "../common/helpers";

const RaceInfo = () => {

    const dispatch = useDispatch();

    const horses: Horse[] = useSelector((state: RootState) => state.race.horses);
    const selectedHorseId = useSelector((state: RootState) => state.player.currentBet.selectedHorse?.id);
    const isRaceStarted = useSelector((state: RootState) => state.race.isStarted);
    const winningHorse = useSelector((state: RootState) => state.race.currentLap?.winner);

    function getRandomBetween(min: number, max: number) {
        return Math.random() * (max - min) + min;
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
                        height: "40px",
                        border: "1px dotted"
                    } : {height: "40px"};
                    let isHorseWinning = isRaceStarted && horse.id === winningHorse?.id;
                    const horseProgress = isHorseWinning ? getRandomBetween(70, 80) : getRandomBetween(10, 50);
                    return (
                        <Row key={horse.id} className="align-items-center" style={rowStyle}>
                            <Col sm={2}>
                                <span style={{color: horse.color}}
                                      onClick={() => onHorseSelected(horse.id)}>
                                    {horse.name}
                                </span>
                                <span
                                    style={{
                                        height: "40px",
                                        width: "40px",
                                        display: 'inline-block',
                                        paddingTop: "-5px"
                                    }}>
                                    <TweenOne animation={{x: horseProgress * 15}}> <HorseImage
                                        horseColor={horse.color}/></TweenOne>
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