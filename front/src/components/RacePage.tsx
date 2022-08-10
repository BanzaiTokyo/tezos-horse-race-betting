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
import {statsActions} from "../store/stats";
import Withdraw from "./Withdraw";
import PrevRaceInfo from "./PrevRaceInfo";


const RacePage = () => {
    const dispatch = useDispatch();
    const connectedWallet = useSelector((state: RootState) => state.player.connectedWallet);
    const prizeToWithdraw = useSelector((state: RootState) => state.player.prizeToWithdraw);
    const refreshStorageIn = useSelector((state: RootState) => state.race.refreshStorageIn);
    const isRefreshingStorage = useSelector((state: RootState) => state.race.isRefreshingStorage);

    useEffect(() => {
        if (isRefreshingStorage)
            return
        const timer = setTimeout(async () => {
            dispatch(raceActions.setIsRefreshingStorage(true));
            const contractStorage = await readRaceContractStorage();
            dispatch(raceActions.setRaceId(contractStorage.current_race.toNumber()));
            const promises = [
                contractStorage.races.get(contractStorage.current_race)
                .then((race: any) => dispatch(raceActions.setContractStorage(race))),
            ]
            if (contractStorage.current_race) {
                promises.push(
                    contractStorage.races.get(contractStorage.current_race-1)
                        .then((race: any) => {
                            race.raceNumber = contractStorage.current_race
                            dispatch(statsActions.addRaceToStats(race))
                        }),
                )
            }
            if (connectedWallet) {
                promises.push(
                    getAmountPlayerCanWithdraw(contractStorage, connectedWallet)
                    .then((prize: number) => dispatch(playerActions.setPrizeToWithdraw(prize)))
                )
            }
            Promise.all(promises).finally(() => dispatch(raceActions.setIsRefreshingStorage(false)));
        }, 60_000);

        return () => {
            clearTimeout(timer);
        };
    }, [isRefreshingStorage]);


    useEffect(() => {
        if (connectedWallet) {
            readRaceContractStorage()
                .then(contractStorage => getAmountPlayerCanWithdraw(contractStorage, connectedWallet))
                .then((prize: number) => dispatch(playerActions.setPrizeToWithdraw(prize)))
        }
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
                <PrevRaceInfo />
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
