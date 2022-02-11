import {BeaconWallet} from '@taquito/beacon-wallet'
import {OpKind, TezosToolkit} from '@taquito/taquito'
import {BigNumber} from 'bignumber.js'

import {NODE_URL, RACE_CONTRACT} from '../common/Constants'
import {NetworkType} from "@airgap/beacon-sdk";

const Tezos = new TezosToolkit(NODE_URL)

export interface ContractStorage {
  countdown_milliseconds: BigNumber
  leader: string
  leadership_start_timestamp: number
}

let globalWallet: BeaconWallet | undefined

const getBeaconInstance = async () => {
  if (!globalWallet) {
    // Create a new BeaconWallet instance. The options will be passed to the DAppClient constructor.
    const wallet = new BeaconWallet({
      name: 'BanzaiTokyo Race',
      preferredNetwork: NetworkType.HANGZHOUNET,
    })

    // Setting the wallet as the wallet provider for Taquito.
    Tezos.setWalletProvider(wallet)
    globalWallet = wallet
  }

  return globalWallet
}

export const connectToBeacon = async () => {
  console.log('CONNECTING TO BEACON')
  const wallet = await getBeaconInstance()


  if (await wallet.client.getActiveAccount()) {
    // Check if we already have an account connected, so we can skip requestPermissions.
    return wallet
  }

  // Send permission request to the connected wallet. This will either be the browser extension, or a wallet over the P2P network.
  await wallet.requestPermissions()

  return wallet
}

export const disconnectFromBeacon = async () => {
  const wallet = await getBeaconInstance()
  await wallet.clearActiveAccount()
}

export const withdraw = async (): Promise<string> => {
  await connectToBeacon()

  // Connect to a specific contract on the tezos blockchain.
  // Make sure the contract is deployed on the network you requested permissions for.
  const contract = await Tezos.wallet.at(RACE_CONTRACT)
  // Call a method on a contract. In this case, we use the transfer entrypoint.
  // Taquito will automatically check if the entrypoint exists and if we call it with the right parameters.
  // In this case the parameters are [from, to, amount].
  // This will prepare the contract call and send the request to the connected wallet.
  const result = await contract.methods.withdraw('').send()

  // As soon as the operation is broadcast, you will receive the operation hash
  return result.opHash
}

export const readStateFromContract = async (): Promise<ContractStorage> => {
  const contract = await Tezos.contract.at(RACE_CONTRACT);

  return await contract.storage();
}

let lastUpdatedBlockHash: string = ''

export const checkRecentBlockForUpdates = async () => {
  console.log('checking for updates')
  const block = await Tezos.rpc.getBlock()

  const newRelevantBlock =
      block.hash !== lastUpdatedBlockHash &&
      block.operations[3].some((ops) =>
          ops.contents.some(
              (op) =>
                  op.kind === OpKind.TRANSACTION && op.destination === RACE_CONTRACT
          )
      )

  lastUpdatedBlockHash = block.hash

  return newRelevantBlock
}

export const getTezBlockLinkForAddress = (
    address: string = RACE_CONTRACT
) => {
  return `https://tezblock.io/account/${address}`
}

export const openTezBlock = async () => {
  window.open(getTezBlockLinkForAddress(), '_blank')
}

export const getPotAmount = async () => {
  return (await Tezos.tz.getBalance(RACE_CONTRACT)).shiftedBy(-6).toString()
}

export const getMyAddress = async () => {
  const wallet = await getBeaconInstance()

  await wallet.requestPermissions({
    network: {
      type: NetworkType.HANGZHOUNET,
      rpcUrl: "https://hangzhounet.api.tez.ie"
    }
  });

  const activeAccount = await wallet.client.getActiveAccount()
  console.log('------------- wallet: ', wallet)

  return activeAccount?.address ?? ''
}
