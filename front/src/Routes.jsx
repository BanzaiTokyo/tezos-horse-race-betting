import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {ABOUT_PATH, HOME_PATH, RACE_PATH} from "./common/Constants";
import RacePage from "./components/RacePage";
import AboutPage from "./components/AboutPage";

const RaceRoutes = () => {
    return (
        <Switch>
            <Route path={RACE_PATH}>
                <RacePage/>
            </Route>
            <Route path={ABOUT_PATH}>
                <AboutPage/>
            </Route>
            <Route path={HOME_PATH}>
                <RacePage/>
            </Route>
        </Switch>);
};

export default RaceRoutes;