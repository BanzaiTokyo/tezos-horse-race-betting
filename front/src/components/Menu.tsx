import React, {useState} from 'react';
import {Badge, Nav, Navbar} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {ABOUT_PATH, RACE_PATH} from "../common/Constants";
import ConnectButton from "./ConnectWallet";
import {TezosToolkit} from "@taquito/taquito";


const RaceMenu = () => {

    const [Tezos, setTezos] = useState<TezosToolkit>(
        new TezosToolkit("https://hangzhounet.api.tez.ie")
    );
    const [contract, setContract] = useState<any>(undefined);
    const [publicToken, setPublicToken] = useState<string | null>("");
    const [wallet, setWallet] = useState<any>(null);
    const [userAddress, setUserAddress] = useState<string>("");
    const [userBalance, setUserBalance] = useState<number>(0);
    const [storage, setStorage] = useState<number>(0);
    const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
    const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("transfer");
    const contractAddress: string = "KT1WiPWNcBMcXJButkkvroRGkzs45n3iZ13c";


    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand>
                <img width="40"
                     height="40"
                     src="/horse.svg"
                     className="d-inline-block"
                     style={{marginLeft: "10px", marginRight: "10px", marginBottom: "10px", marginTop: "0px"}}
                     alt={"BanzaiTokyo Race Logo"}/>
                BanzaiTokyo {' '}
                <a href={ABOUT_PATH}><Badge pill bg="info">
                    DeFi Racing
                </Badge>
                </a></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="container-fluid" style={{marginLeft: "30px"}}>
                    <Nav.Link href={RACE_PATH}>Race</Nav.Link>
                    <Nav.Link href={ABOUT_PATH}>About</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            <Nav.Item className="ml-auto">

                <ConnectButton
                Tezos={Tezos}
                setContract={setContract}
                setPublicToken={setPublicToken}
                setWallet={setWallet}
                setUserAddress={setUserAddress}
                setUserBalance={setUserBalance}
                setStorage={setStorage}
                contractAddress={contractAddress}
                setBeaconConnection={setBeaconConnection}
                wallet={wallet}
            /></Nav.Item>

        </Navbar>
    );


}

RaceMenu.propTypes = {
    selectedItem: PropTypes.string
};

export default RaceMenu;