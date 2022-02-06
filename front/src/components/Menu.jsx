import React from 'react';
import {Button, Container, Nav, Navbar} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {ABOUT_PATH, RACE_PATH} from "../common/Constants";
import { LinkContainer } from 'react-router-bootstrap';


const RaceMenu = () => {
    // const [activeItem, setActiveItem] = useState();


    //     <Menu>
    //         <Menu.Item header>
    //             <Header> Illustrarium
    //                 <Label
    //                     as={Link}
    //                     to={RACE_PATH}
    //                     color='teal'
    //                     circular
    //                     content={'beta'}
    //                 />
    //             </Header>
    //         </Menu.Item>
    //         <Menu.Item
    //             name='play'
    //             to={ABOUT_PATH}
    //             as={Link}
    //             active={activeItem === 'play'}
    //             onClick={(item) => setActiveItem(item)}>
    //             Play
    //         </Menu.Item>
    //         <Menu.Item
    //             as={Link}
    //             name='leaderboards'
    //             to={RACE_PATH}
    //             active={activeItem === 'leaderboards'}
    //             onClick={(item) => setActiveItem(item)}
    //         >
    //             Leaderboards
    //         </Menu.Item>
    //     </Menu>
    // );

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">BanzaiTokyo Challenge</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href={RACE_PATH}>Race</Nav.Link>
                        <Nav.Link href={ABOUT_PATH}>About</Nav.Link>
                        <LinkContainer to="/about">
                            <Button>About</Button>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );


}

RaceMenu.propTypes = {
    selectedItem: PropTypes.string
};

export default RaceMenu;
