import React from "react";
import {Card, ListGroup} from "react-bootstrap";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import Lap from "../models/Lap";

const PreviousLaps = () => {
    const laps = useSelector((state: RootState) => state.race.info.laps);

    const isContractStorageLoaded = useSelector((state: RootState) => state.race.isContractStorageLoaded);

    //FIXME: this is for testing because the race currently has only one lap
    if (!isContractStorageLoaded || laps!.length < -1) return <div></div>;

    const previousLaps = laps!;// laps!.slice(0, -1);

    return (<div>
            {previousLaps.length > 0 && <Card>
                <Card.Header>Winners of the the previous laps</Card.Header>
                <Card.Body>
                    {previousLaps.map((lap: Lap) => {
                        return (<ListGroup horizontal key={lap.lapNumber}>
                                <ListGroup.Item>lap: <strong>#{lap.lapNumber + 1}</strong></ListGroup.Item>
                                <ListGroup.Item><strong style={{color: lap.winner?.color}}>{lap.winner?.name}</strong></ListGroup.Item>
                            </ListGroup>
                        )
                    })}
                </Card.Body>
            </Card>}
        </div>
    );
}

export default PreviousLaps;