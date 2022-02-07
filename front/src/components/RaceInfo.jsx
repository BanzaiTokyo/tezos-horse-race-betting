import React from "react";
import {ListGroup} from "react-bootstrap";

const RaceInfo = () => {

    return (
                    <ListGroup horizontal >
                        <ListGroup.Item>race: <strong>#5</strong></ListGroup.Item>
                        <ListGroup.Item>lap: <strong>3</strong></ListGroup.Item>
                        <ListGroup.Item>bids: <strong>35</strong> uUSD</ListGroup.Item>
                    </ListGroup>
    );
}

export default RaceInfo;