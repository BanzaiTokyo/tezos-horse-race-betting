import React from "react";
import {Card, ListGroup} from "react-bootstrap";
import {useSelector} from "react-redux";
import {RootState} from "../store";

const PrevRaceInfo = () => {
    const isRaceStarted: boolean = useSelector((state: RootState) => state.race.isStarted);
    const prevRaces = useSelector((state: RootState) => state.stats.previousRaces);
    const race = prevRaces[prevRaces.length - 1];
    const _ = useSelector((state: RootState) => state.stats.previousRaces.length);

    return (<div>
        {!isRaceStarted && race && <Card>
            <Card.Header>Previous race #{race.raceNumber}</Card.Header>
            <Card.Body>
                <ListGroup horizontal>
                    <ListGroup.Item>winner: <strong>{race.winner}</strong></ListGroup.Item>
                    <ListGroup.Item>ended in: <strong>{race.lapNumber}</strong> lap(s)</ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>}
    </div>);
}

export default PrevRaceInfo;