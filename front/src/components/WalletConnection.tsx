import ConnectButton from "./ConnectWallet";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import {TezosToolkit} from "@taquito/taquito";
import DisconnectButton from "./DisconnectWallet";


const WalletConnection = () => {
    const connectedWallet = useSelector((state: RootState) => state.race.connectedWallet);

    const [Tezos, setTezos] = useState<any>(
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

    return (!connectedWallet ?

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
            /> : <span> {connectedWallet} {' '}
            <DisconnectButton
                wallet={wallet}
                setPublicToken={setPublicToken}
                setUserAddress={setUserAddress}
                setUserBalance={setUserBalance}
                setWallet={setWallet}
                setTezos={setTezos}
                setBeaconConnection={setBeaconConnection}/></span>
    );
}

export default WalletConnection;