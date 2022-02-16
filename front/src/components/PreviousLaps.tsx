import React from "react";
import {Card} from "react-bootstrap";
import {useSelector} from "react-redux";
import {RootState} from "../store";

const RaceInfo = () => {
    const isRaceStarted: boolean = useSelector((state: RootState) => state.race.isStarted);

    const currentLap = useSelector((state: RootState) => state.race.currentLap);
    const totalBetAmount = useSelector((state: RootState) => state.race.info.totalBetAmount);
    const raceNumber = useSelector((state: RootState) => state.race.info.raceNumber);

    return (
        <Card>
            <Card.Header>Previous laps</Card.Header>
            <Card.Body>
                laps
            </Card.Body>
        </Card>

    );
}

export default RaceInfo;