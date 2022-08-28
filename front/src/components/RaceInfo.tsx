import React from "react";
import {Button, ListGroup} from "react-bootstrap";
import {useSelector} from "react-redux";
import {RootState} from "../store";

const RaceInfo = () => {
    const isRaceStarted: boolean = useSelector((state: RootState) => state.race.isStarted);

    const currentLap = useSelector((state: RootState) => state.race.currentLap);
    const totalBetAmount = useSelector((state: RootState) => state.race.info.totalBetAmount);
    const raceNumber = useSelector((state: RootState) => state.race.info.raceNumber);

    return (
        (isRaceStarted) ?
            <ListGroup horizontal>
                <ListGroup.Item>race: <strong>#{raceNumber}</strong></ListGroup.Item>
                <ListGroup.Item>lap: <strong>#{currentLap?.lapNumber ?? 1}</strong></ListGroup.Item>
                <ListGroup.Item>total bet: <strong>{totalBetAmount}</strong> uUSD</ListGroup.Item>
            </ListGroup> :


            <Button className="float-end" variant="light" disabled>
                Place a bet to launch the race =&gt; &nbsp;
            </Button>
    );
}

export default RaceInfo;