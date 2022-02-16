import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {readRaceContractStorage} from "../services/BeaconService";
import {raceActions} from "../store/race";


const RacePage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        readRaceContractStorage().then(contractStorage => {
            dispatch(raceActions.setRaceId(contractStorage.current_race.toNumber()));
            return contractStorage.races.get(contractStorage.current_race)
        }).then((race) => {
            //FIXME: do the conversion from Michelson objects here
            // race.bet_amount = race.bet_amount.toNumber();
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
