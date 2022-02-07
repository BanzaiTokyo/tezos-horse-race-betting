import React from 'react'
import {Col, Container, Row} from 'react-bootstrap';
import Footer from "./Footer";
import Menu from "./Menu";
import Routes from "../Routes";

const Layout = () => {
    // const dispatch = useDispatch();
    return (
        <div>
            <Container fluid="md">
                {/*--------- header*/}
                <Row >
                    <Col >
                        <Menu/>
                    </Col>

                </Row>

                <Row>
                    <Col>
                        {/*--------- main content*/}
                        <Routes/>
                    </Col>
                </Row>


            </Container>

            {/*Footer*/}
            <Footer/>
        </div>
    );
}

export default Layout;
