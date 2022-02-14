import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {readContractStorage} from "../services/BeaconService";
import {raceActions} from "../store/race";


const RacePage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        readContractStorage().then(contractStorage => {
            dispatch(raceActions.setRaceId(contractStorage.current_race));
            return contractStorage.races.get(contractStorage.current_race)
        }).then((race) => {
            console.log('--------------------- unformatted race: ', race)
            dispatch(raceActions.setContractStorage(race));
        });
    }, []);


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
            <Col>
                <Track/>
            </Col>
        </Row>
    </div>);
}

export default RacePage;
