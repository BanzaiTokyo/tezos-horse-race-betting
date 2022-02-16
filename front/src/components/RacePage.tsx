import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch} from "react-redux";
import React, {useEffect} from "react";
import {readRaceContractStorage} from "../services/BeaconService";
import {raceActions} from "../store/race";
import PreviousLaps from "./PreviousLaps";
import AboutPage from "./AboutPage";


const RacePage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        readRaceContractStorage().then(contractStorage => {
            dispatch(raceActions.setRaceId(contractStorage.current_race.toNumber()));
            return contractStorage.races.get(contractStorage.current_race)
        }).then((race) => {
            //FIXME: do the conversion from Michelson objects here insead of the reducer
            // race.bet_amount = race.bet_amount.toNumber();
            dispatch(raceActions.setContractStorage(race));
        });
    }, []);


    return (<div>

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
        <Row>
            <Col>
                <p/>
                <PreviousLaps/>
            </Col>
        </Row>
        <Row>
            <Col>
                <p/>
                <AboutPage closeable/>
            </Col>
        </Row>
    </div>);
}

export default RacePage;
