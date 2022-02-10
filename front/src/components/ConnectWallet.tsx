import React, {Dispatch, SetStateAction, useEffect} from "react";
import {TezosToolkit} from "@taquito/taquito";
import {BeaconWallet} from "@taquito/beacon-wallet";
import {BeaconEvent, defaultEventCallbacks, NetworkType} from "@airgap/beacon-sdk";
import {Button} from "react-bootstrap";
import {raceActions} from "../store/race";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";

type ButtonProps = {
    Tezos: TezosToolkit;
    setContract: Dispatch<SetStateAction<any>>;
    setWallet: Dispatch<SetStateAction<any>>;
    setUserAddress: Dispatch<SetStateAction<string>>;
    setUserBalance: Dispatch<SetStateAction<number>>;
    setStorage: Dispatch<SetStateAction<number>>;
    contractAddress: string;
    setBeaconConnection: Dispatch<SetStateAction<boolean>>;
    setPublicToken: Dispatch<SetStateAction<string | null>>;
    wallet: BeaconWallet;
};

const ConnectButton = ({
                           Tezos,
                           setContract,
                           setWallet,
                           setUserAddress,
                           setUserBalance,
                           setStorage,
                           contractAddress,
                           setBeaconConnection,
                           setPublicToken,
                           wallet
                       }: ButtonProps): JSX.Element => {
    const dispatch = useDispatch();

    const setup = async (userAddress: string): Promise<void> => {
        setUserAddress(userAddress);
        // updates balance
        const balance = await Tezos.tz.getBalance(userAddress);
        setUserBalance(balance.toNumber());
        // creates contract instance
        const contract = await Tezos.wallet.at(contractAddress);
        const storage: any = await contract.storage();
        setContract(contract);
        setStorage(storage.toNumber());
    };

    const connectWallet = async (): Promise<void> => {
        try {
            await wallet.requestPermissions({
                network: {
                    type: NetworkType.HANGZHOUNET,
                    rpcUrl: "https://hangzhounet.api.tez.ie"
                }
            });
            // gets user's address
            const userAddress = await wallet.getPKH();

            //FIXME: the wallet's address is retrieved but the connection is not really established
            console.log('------------------- user address: ', userAddress)
            dispatch(raceActions.setConnetedWallet(userAddress))
            await setup(userAddress);
            setBeaconConnection(true);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        (async () => {
            // creates a wallet instance
            const wallet = new BeaconWallet({
                name: "BanzaiTokyo Race",
                preferredNetwork: NetworkType.HANGZHOUNET,
                disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
                eventHandlers: {
                    // To keep the pairing alert, we have to add the following default event handlers back
                    [BeaconEvent.PAIR_INIT]: {
                        handler: defaultEventCallbacks.PAIR_INIT
                    },
                    [BeaconEvent.PAIR_SUCCESS]: {
                        handler: data => setPublicToken(data.publicKey)
                    }
                }
            });
            Tezos.setWalletProvider(wallet);
            setWallet(wallet);
            // checks if wallet was connected before
            const activeAccount = await wallet.client.getActiveAccount();
            if (activeAccount) {
                const userAddress = await wallet.getPKH();
                await setup(userAddress);
                dispatch(raceActions.setConnetedWallet(userAddress));
                setBeaconConnection(true);
            }
        })();
    }, []);

    return (
        <div className="buttons">
            <Button variant={"outline-info"} onClick={connectWallet}>
                Connect with wallet
            </Button>

        </div>
    );
};

export default ConnectButton;
