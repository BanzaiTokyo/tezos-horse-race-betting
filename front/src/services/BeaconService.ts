import {BeaconWallet} from '@taquito/beacon-wallet'
import {TezosToolkit} from '@taquito/taquito'

import {NETWORK_TYPE, NODE_URL, RACE_CONTRACT, UUSD_CONTRACT} from '../common/Constants'

const Tezos = new TezosToolkit(NODE_URL)

export interface ContractStorage {
    [key: string]: any | Promise<any>;
}

let globalWallet: BeaconWallet | undefined

const getBeaconInstance = async () => {
    if (!globalWallet) {
        const wallet = new BeaconWallet({
            name: 'BanzaiTokyo Race'
        })

        Tezos.setWalletProvider(wallet)
        globalWallet = wallet
    }

    return globalWallet
}

export const connectToBeacon = async () => {
    console.log('CONNECTING TO BEACON')
    const wallet = await getBeaconInstance()

    if (await wallet.client.getActiveAccount()) {
        return wallet
    }

    await wallet.requestPermissions()

    return wallet
}

export const disconnectFromBeacon = async () => {
    const wallet = await getBeaconInstance()
    await wallet.clearActiveAccount()
}

export const readRaceContractStorage = async (): Promise<ContractStorage> => {
    const contract = await Tezos.contract.at(RACE_CONTRACT);

    return await contract.storage();
}


export const placeBet = async (amount: number, horseId: number | undefined, userAddress: string): Promise<any> => {
    console.log('amount: ', amount, ', horse id: ', horseId, ', wallet: ', userAddress)
    await connectToBeacon()
    const raceContract = await Tezos.wallet.at(RACE_CONTRACT);
    const uusdContract = await Tezos.wallet.at(UUSD_CONTRACT);
    const batchOp = await Tezos.wallet.batch()
        .withContractCall(uusdContract.methods.update_operators([
            {
                add_operator: {
                    owner: userAddress,
                    operator: RACE_CONTRACT,
                    token_id: 0
                }
            }
        ]))
        .withContractCall(raceContract.methods.place_bet(
            amount * 1e12,
            horseId
        ))
        .withContractCall(uusdContract.methods.update_operators([
            {
                remove_operator: {
                    owner: userAddress,
                    operator: RACE_CONTRACT,
                    token_id: 0
                }
            }
        ]))
        .send();
    return await batchOp.confirmation();
}

export const getMyAddress = async () => {
    const wallet = await getBeaconInstance()

    await wallet.requestPermissions({
        network: {
            type: NETWORK_TYPE,
            rpcUrl: NODE_URL
        }
    });

    const activeAccount = await wallet.client.getActiveAccount()

    return activeAccount?.address ?? ''
}

export const getUUSDBalance = async (wallet: string) => {
    const uusdContract = await Tezos.wallet.at(UUSD_CONTRACT);
    const uUSDStorage: ContractStorage = await uusdContract.storage();
    console.log('uUSD storage: ', uUSDStorage)
    return uUSDStorage.ledger.get({"owner": wallet, "token_id": 0}).then((balance: any) => balance.toNumber()).catch((e: any) => {
        console.log(e);
        return 0;
    })
}

export const getAmountPlayerCanWithdraw = async (contractStorage: ContractStorage, wallet: string) => {
    //TODO: not sure how it should be done, either at the time of readRaceContractStorage or with a separate call
    // but the idea is to get the amount of prize money that the player can withdraw
    return contractStorage.ledger.get(wallet)
            .then((balance: any) => {
               return  balance?.toNumber()  / 1e12 || 0
            }).catch((e: any) => {
        console.log(e);
        return 0;
    })
}

export const withdrawPrize = async (wallet: string) => {
    await connectToBeacon()
    return Tezos.wallet
        .at(RACE_CONTRACT)
        .then((contract) => {
           return contract.methods.withdraw().send()
        })
        .then((op) => {
            op.confirmation()
        })
        .then(() => {
            return wallet
        })
}
