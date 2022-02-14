import React from "react";
import {Button, ListGroup} from "react-bootstrap";
import {useSelector} from "react-redux";
import {RootState} from "../store";

const RaceInfo = () => {
    const isRaceStarted: boolean = useSelector((state: RootState) => state.race.isStarted);

    const totalLaps = 3;
    const currentLap = useSelector((state: RootState) => state.race.currentLap);
    const totalBidAmount = useSelector((state: RootState) => state.race.info.totalBidAmount);
    const raceNumber = useSelector((state: RootState) => state.race.info.raceNumber);

    return (
        (isRaceStarted) ?
            <ListGroup horizontal>
                <ListGroup.Item>race: <strong>#{raceNumber}</strong></ListGroup.Item>
                <ListGroup.Item>lap: <strong>{currentLap} / {totalLaps}</strong></ListGroup.Item>
                <ListGroup.Item>bids: <strong>{totalBidAmount}</strong> uUSD</ListGroup.Item>
            </ListGroup> :


            <Button className="float-end" variant="light" disabled>
                Place a bet to launch the race =&gt; &nbsp;
            </Button>
    );
}

export default RaceInfo;