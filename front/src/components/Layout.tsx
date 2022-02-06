import React from 'react'
import {Col, Container, Row} from 'react-bootstrap';
import Footer from "./Footer";
import Menu from "./Menu";
import LoginBlock from "./Login";
import {Switch, Route} from "react-router-dom";
import RacePage from "./RacePage";
import AboutPage from "./AboutPage";

const Layout = () => {
    // const dispatch = useDispatch();
    return (
        <div>
            <Container fluid="md">
                {/*--------- header*/}
                <Row>
                    <Col color={'red'}>
                        <Menu selectedItem={'play'}/>
                    </Col>
                    <Col xs lg="2">
                        <LoginBlock/>
                    </Col>
                </Row>


                {/*--------- main content*/}
                here's the content:
                <Switch>
                    <Route path="/">
                        <RacePage />
                    </Route>
                    <Route path="/race">
                        <RacePage />
                    </Route>
                    <Route path="/about">
                        <AboutPage />
                    </Route>
                </Switch>                end of the content
            </Container>

            {/*Footer*/}
            <Footer/>
        </div>
    );
}

export default Layout;
