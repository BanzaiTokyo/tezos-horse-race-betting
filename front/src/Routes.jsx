import React from 'react';
import {Route, Routes} from 'react-router-dom';
import {ABOUT_PATH, HOME_PATH, RACE_PATH} from "./common/Constants";
import RacePage from "./components/RacePage";
import AboutPage from "./components/AboutPage";

const RaceRoutes = () => {
    return (
        <Routes>
            <Route path={HOME_PATH}
                   element={<RacePage/>}
                   exact
            />
            <Route
                path={RACE_PATH}
                element={<RacePage/>}
                exact
            />
            <Route
                path={ABOUT_PATH}
                element={<AboutPage/>}
            />
        </Routes>);
};

export default RaceRoutes;