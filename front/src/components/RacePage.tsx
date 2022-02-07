import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";


const RacePage = () => {
    return (<div>
        {/* spacer */}
        <div style={{height: "100px"}}/>

        <Row>
            <Col md={6}>
                <RaceInfo/>
            </Col>
            <Col md={6}><PlaceBet/></Col>
        </Row>
        <Row>
            {/*/!* spacer *!/*/}
            {/*<div style={{height: "30px"}}/>*/}
        </Row>
        <Row>
            <Col>
                <Track/>
            </Col>
        </Row>
    </div>);
}

export default RacePage;
