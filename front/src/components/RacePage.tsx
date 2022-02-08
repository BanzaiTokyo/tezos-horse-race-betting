import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useSelector} from "react-redux";
import {RootState} from "../store";


const RacePage = () => {
    const isRaceStarted = useSelector((state: RootState) => state.race.isStarted);

    return (<div>
        {/* spacer */}
        <div style={{height: "100px"}}/>

        <Row>
            <Col md={6}>
                {isRaceStarted && <RaceInfo/>}
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
