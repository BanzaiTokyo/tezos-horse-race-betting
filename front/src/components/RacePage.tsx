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
    const refreshStorageIn = useSelector((state: RootState) => state.race.refreshStorageIn);
    const isRefreshingStorage = useSelector((state: RootState) => state.race.isRefreshingStorage);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (refreshStorageIn <= 0 && !isRefreshingStorage) {
                dispatch(raceActions.setRefreshStorageIn(60_000))
                dispatch(raceActions.setIsRefreshingStorage(true));
                readRaceContractStorage().then(contractStorage => {
                    dispatch(raceActions.setRaceId(contractStorage.current_race.toNumber()));
                    return contractStorage.races.get(contractStorage.current_race)
                }).then((race) => {
                    dispatch(raceActions.setContractStorage(race));
                }).finally(() => dispatch(raceActions.setIsRefreshingStorage(false)));
            } else {
                dispatch(raceActions.setRefreshStorageIn(refreshStorageIn - 1_000))
            }
        }, 1_000);

        return () => {
            clearTimeout(timer);
        };
    }, [refreshStorageIn]);


    useEffect(() => {
        connectedWallet && getAmountPlayerCanWithdraw(connectedWallet).then((prize: number) => {
                dispatch(playerActions.setPrizeToWithdraw(prize));
        });
    }, [connectedWallet]);

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
