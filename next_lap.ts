import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import BigNumber from 'bignumber.js'
const acc = require('./acc.json')
const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz/'
const CONTRACT = 'KT1GLHoohNd5eRoyjU2c2vcERovsXrEai855'
const ORACLE = 'KT1DMrr8pgcdrPnqxkfqwXSQuVg9mP8v5ShV'

async function main(): Promise<void> {
    let tezos = new TezosToolkit(RPC_URL)
    tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))
    let contract = tezos.contract.at(CONTRACT)
    let contract_storage: any = await contract
            .then((contract) => {
                return contract.storage()
            })
    let race_number = contract_storage.current_race.toNumber()
    let races = await contract_storage.races
    let race = await races.get(race_number)
    if (race.laps.size > 0 && race.winner.toNumber() < 0) {
        let lap_epoch = race.laps.get((race.laps.size - 1).toString()).epoch.toNumber()
        let last_bet_epoch = race.last_bet_epoch.toNumber()
        let oracle_storage: any = await tezos.contract
            .at(ORACLE)
            .then((oracle) => {
                return oracle.storage()
            })
        let oracle_epoch = await oracle_storage.current_epoch.toNumber()
        console.log('Epoch in the lap', lap_epoch, 'in the oracle', oracle_epoch)
        if (oracle_epoch - lap_epoch > 0 && (oracle_epoch - last_bet_epoch) > 1) {
            contract.then((contract) => {
                console.log(`Calling next_lap()...`)
                return contract.methods.next_lap().send()
            })
                .then((op) => {
                    console.log(`Awaiting for ${op.hash} to be confirmed...`)
                    return op.confirmation(1).then(() => op.hash)
                })
                .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
        } else {
            console.log('Epoch was not incremented enough')
        }
    } else {
        console.log('Race is not started')
    }
}
main()