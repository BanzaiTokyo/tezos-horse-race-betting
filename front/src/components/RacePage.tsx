import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect} from "react";
import {getAmountPlayerCanWithdraw, readRaceContractStorage} from "../services/BeaconService";
import {raceActions} from "../store/race";
import PreviousLaps from "./PreviousLaps";
import AboutPage from "./AboutPage";
import {RootState} from "../store";
import {playerActions} from "../store/player";
import Withdraw from "./Withdraw";


const RacePage = () => {
    const dispatch = useDispatch();
    const connectedWallet = useSelector((state: RootState) => state.player.connectedWallet);
    const prizeToWithdraw = useSelector((state: RootState) => state.player.prizeToWithdraw);


    useEffect(() => {
        readRaceContractStorage().then(contractStorage => {
            dispatch(raceActions.setRaceId(contractStorage.current_race.toNumber()));
            return contractStorage.races.get(contractStorage.current_race)
        }).then((race) => {
            dispatch(raceActions.setContractStorage(race));
        });
    }, []);

    useEffect(() => {
        connectedWallet && getAmountPlayerCanWithdraw(connectedWallet).then(prize => {
            dispatch(playerActions.setPrizeToWithdraw(prize));
        });
    }, [connectedWallet]);

    console.log('prize: ', prizeToWithdraw)

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
            {prizeToWithdraw > 0 && <Col>
                <p/>
                <Withdraw/>
            </Col>}
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
