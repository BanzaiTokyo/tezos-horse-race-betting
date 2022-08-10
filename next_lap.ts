import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import BigNumber from 'bignumber.js'
const acc = require('./acc.json')
const RPC_URL = 'https://rpc.ghostnet.teztnets.xyz/'
const CONTRACT = 'KT1SCKG9Mny892PGLA6Jhyfve5mJAqVpRqEB'
const ORACLE = 'KT1LaEXLm2UgCKSu3kZemCVJ3CD1vhatq7XH'

async function main(): Promise<void> {
    const tezos = new TezosToolkit(RPC_URL)
    tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))
    const contract = await tezos.contract.at(CONTRACT)
    const contract_storage: any = await contract.storage()
    const oracle = await tezos.contract.at(ORACLE)
    console.log('Incrementing oracle epoch...');
    await oracle.methods.default().send().then((op) => {
	console.log(`Awaiting for ${op.hash} to be confirmed...`)
	return op.confirmation(1).then(() => op.hash)
    })
    const oracle_storage = await oracle.storage()
    const race_number = contract_storage.current_race.toNumber()
    if (race_number < 0) {
	console.log(`Calling init_race()...`)
	const op_hash = await contract.methods.init_race().send()
	.then((op) => {
	    console.log(`Awaiting for ${op.hash} to be confirmed...`)
	    return op.confirmation(1).then(() => op.hash)
	})
	console.log('init_race operation:', op_hash)
    }
    const races = await contract_storage.races
    const race = await races.get(race_number)
    if (race.hasOwnProperty('laps') && race.laps.size > 0 && race.winner.toNumber() < 0) {
        const lap_epoch = race.laps.get((race.laps.size - 1).toString()).epoch.toNumber()
        const last_bet_epoch = race.last_bet_epoch.toNumber()
        const oracle_epoch = await oracle_storage.current_epoch.toNumber()
        console.log('Epoch in the lap', lap_epoch, 'in the oracle', oracle_epoch)
        if (oracle_epoch - lap_epoch > 0 && (oracle_epoch - last_bet_epoch) > 1) {
           console.log(`Calling next_lap()...`)
           await contract.methods.next_lap().send()
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