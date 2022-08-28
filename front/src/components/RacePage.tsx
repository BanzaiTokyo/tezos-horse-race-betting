import {Col, Row} from "react-bootstrap";
import RaceInfo from "./RaceInfo";
import Track from "./Track";
import PlaceBet from "./PlaceBet";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
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
    const isRefreshingStorage = useSelector((state: RootState) => state.race.isRefreshingStorage);
    const prevRaces = useSelector((state: RootState) => state.stats.previousRaces);
    const [timerToggle, setTimerToggle] = useState(false);

    async function updateContract() {
        if (!isRefreshingStorage) {
            console.log(new Date().toUTCString(), 'reading storage')
            dispatch(raceActions.setIsRefreshingStorage(true));
            const contractStorage = await readRaceContractStorage();
            const prev_race = contractStorage.current_race.toNumber() - 1;
            dispatch(raceActions.setRaceId(prev_race + 1));
            const promises = [
                contractStorage.races.get(contractStorage.current_race)
                    .then((race: any) => dispatch(raceActions.setContractStorage(race))),
            ]
            // @ts-ignore
            if ((prev_race >= 0) && (!prevRaces.length || (prevRaces[prevRaces.length-1].raceNumber < prev_race))) {
                promises.push(
                    contractStorage.races.get(prev_race)
                        .then((race: any) => {
                            race.raceNumber = prev_race
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
            Promise.all(promises).finally(() => {
                console.log(new Date().toUTCString(), 'reading finished')
                dispatch(raceActions.setIsRefreshingStorage(false))
            });
        } else {
            console.log(new Date().toUTCString(), 'reading storage is in progress, skipping update')
        }
        setTimerToggle(!timerToggle)
    }

    useEffect(() => {
        const runUpdate = async () => {await updateContract()}
        runUpdate().catch(console.error)
    }, []);

    useEffect(() => {
        const timer = setTimeout(updateContract, 30_000);

        return () => {
            clearTimeout(timer);
        };
    }, [timerToggle]);


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
