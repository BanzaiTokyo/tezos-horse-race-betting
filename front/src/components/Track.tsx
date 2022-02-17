import React, {useEffect, useState} from "react";
import {Card, Col, Container, ProgressBar, Row, Spinner} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import Horse from "../models/Horse";
import {playerActions} from "../store/player";
import {ensure} from "../common/helpers";
import TweenOne from "rc-tween-one";
import HorseImage from "../assets/HorseImage";
import Bet from "../models/Bet";
import {raceActions} from "../store/race";

const HORSE_ZERO_POSITION = 30;
const TRACK_LENGTH = 670;
const MARGIN = 30;
const HORSE_EM = 2.5

const RaceInfo = () => {

    const dispatch = useDispatch();

    const horses: Horse[] = useSelector((state: RootState) => state.race.horses);
    const selectedHorseId = useSelector((state: RootState) => state.player.currentBet.selectedHorse?.id);
    const isRaceStarted = useSelector((state: RootState) => state.race.isStarted);
    const bets = useSelector((state: RootState) => state.race.info.bets);
    const currentLap = useSelector((state: RootState) => state.race.currentLap);
    const isContractStorageLoaded = useSelector((state: RootState) => state.race.isContractStorageLoaded);
    const updateTicker = useSelector((state: RootState) => state.race.updateHorsePositionsTicker);


    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(raceActions.setUpdateHorsePositionsTicker(!updateTicker));
            }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [updateTicker]);

    function getPositionForHorse(horse: Horse) {
        const position: any = currentLap?.positions.findIndex((position) => position === horse.id);
        const percentage = position / (currentLap?.positions.length ?? 1) * 100;
        const min = TRACK_LENGTH / 100 * percentage - MARGIN;
        const max = TRACK_LENGTH / 100 * percentage + MARGIN;
        const result = Math.random() * (max - min) + min;
        return HORSE_ZERO_POSITION + HORSE_ZERO_POSITION + Math.floor(result);
    }


    function onHorseSelected(horseId: number) {

        const horse: Horse = ensure<Horse>(horses.find(horse => horse.id === horseId));
        dispatch(playerActions.setHorseToBetOn(horse));
    }

    function getLoader() {
        return (
            <Container className="text-center justify-content-center align-self-center">
                <div style={{height: "100px"}}/>
                <Spinner animation="border" variant="info"/>
                <div style={{height: "100px"}}/>
            </Container>
        );
    }

    return (
        <Card>
            <Card.Body>
                {isContractStorageLoaded ?
                    horses.map(horse => {
                        const rowStyle = (selectedHorseId === horse.id) ? {
                            height: `${HORSE_EM}em`,
                            border: "1px dotted",
                        } : {height: `${HORSE_EM}em`};
                        const runningClass = isRaceStarted ? "running" : ""

                        const horseProgress = isRaceStarted ? getPositionForHorse(horse) : HORSE_ZERO_POSITION;
                        const horseBets: number = bets.filter((bet: Bet) => bet?.selectedHorse?.id === horse.id).reduce((acc, bet) => acc + bet.amount, 0);

                        const className = "align-items-center " + runningClass
                        return (
                            <Row key={horse.id} className={className} style={rowStyle}>
                                <Col sm={3} style={{marginRight: '-50px'}}>
                                    <Row>
                                        <Col sm={6}>
                                        <strong style={{color: horse.color}}
                                              onClick={() => onHorseSelected(horse.id)}>
                                        {horse.name}
                                        </strong>
                                        </Col>
                                        <Col sm={3}>{isRaceStarted && horseBets}</Col>
                                        <Col sm={1}>
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
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={9}><ProgressBar striped variant="success" now={0} animated/></Col>
                            </Row>)
                    }) : getLoader()}
            </Card.Body>
        </Card>
    );

}

export default RaceInfo;