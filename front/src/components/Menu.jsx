import React from 'react';
import { Nav, Navbar} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {ABOUT_PATH, HOME_PATH, RACE_PATH} from "../common/Constants";
import LoginBlock from "./Login";


const RaceMenu = () => {

    return (
        <Navbar bg="light" expand="lg">
                <Navbar.Brand href={HOME_PATH}>
                    <img width="40"
                         height="40"
                         src="/horse.svg"
                         className="d-inline-block"
                         style={{marginLeft: "10px", marginRight: "10px", marginBottom: "10px", marginTop:"0px"}}
                         alt={"BanzaiTokyo Race Logo"}/>
                    BanzaiTokyo Challenge</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="container-fluid"  style={{marginLeft: "30px"}}>
                        <Nav.Link href={RACE_PATH}>Race</Nav.Link>
                        <Nav.Link href={ABOUT_PATH}>About</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            <Nav.Item className="ml-auto"> <LoginBlock/></Nav.Item>

        </Navbar>
    );


}

RaceMenu.propTypes = {
    selectedItem: PropTypes.string
};

export default RaceMenu;
