import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import {useEffect} from "react";
import {readContractStorage} from "../services/BeaconService";
import {raceActions} from "../store/race";


const RacePage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        readContractStorage().then(contractStorage => {
            return contractStorage.races.get(contractStorage.current_race)
        }).then((race) => {
            dispatch(raceActions.setContractStorage(race))
        });
    }, []);

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
