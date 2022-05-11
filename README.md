# tezos-horse-race-betting
This is a smart contract for the Tezos blockchain to organise a betting game kind of horse races.

Depencencies:
1. external random number oracle provided by Ubinetics 
2. helper https://github.com/asbjornenge/tezos-randomizer

Entry points:
1. init_race(). Called manually only once after deployment. Creates a race.
2. next_lap(). End current lap, arrange racers, calculate the chance of the next lap to start, otherwise end current race and start another immediately.
3. place_bet(params). Place a bet on a horse. "Params" is a record of type {amount: nat, horse: nat}
4. withdraw(). Withdraw money from the in-game account.

Contract lifecycle
After deployment, init_race() must be called by the contract owner. 
Then next_lap() must be scheduled for periodic calls again by the contract owner. 
Users can place bets and attempt to withdraw the prize at any time.

Game flow
A race consists of minimum 2 laps. A lap is considered as finished when First lap does not accept bets, its goal is to emulate the race, place participants in a random order.
All game logic executes on a next_lap() call:
- racers are arranged by the featured algorithm
- probability of the next round is calculated
- if the race must continue, a new lap is created
- otherwise the prize amount is calculated and distributed among winners accounts
- if the winner has no bets then the entire bets amount become a jackpot and is added to the next race prize


Racers arrangement algorithm
The idea is to create an array kind of "AAAAAAAAAABBBBBCCCCCCCCCCDDDDDDDDDD..." where each racer is represented by 10-X characters.
So X is a handicap here, calculated as 5 * h / b where h is the amount of bet placed on this racer and b is the total amount of all bets in the race.
The trick is to slow down the racer who gained most bets.

Randomizer requirements
Random numbers are calculated using an entropy provided by the Ubinetic contract. The entropy is returned from on-chain view "get_entropy(epoch)".
"Epoch" is an integer returned from the "get_current_epoch" on-chain view.
To make sure the random number used for calculations is unpredictable, it must be calculated from an entropy for current_epoch+2.
1. Store current epoch
2. Wait 2 epochs
3. Fetch entropy for the stored on the first step epoch
4. Get random from the fetched entropy


Interaction with the front-end
There are no methods in the contract to return data, the front-end extracts contract information directly from the contract storage, particularly from the "races" big map.
An item is returned using storage.current_race key.

Race data structure
```
{
    horses: [{
        name: "Affirmed", 
        color: "#21325E"
    }, ...],
    jackpot: 0,
    bets = [{
        player: "tz1UZZnrre9H7KzAufFVm7ubuJh5cCfjGwam"
        horse=1,
        amount=12345
    }],
    bet_amount: 12345
    last_bet_epoch: 123
    laps: {
        0: {
            started_at: 1644022701,
            epoch = 121,
            positions: [1, 2, 3, 0, 5, 4]
        }
    }
    winner: -1
}
```
bet_amount - total amount of all "bets"

last_bet_epoch - used in next_lap() to make sure we are 2+ epochs ahead to get true random number

laps - is a dict in order to organise access to a lap by index

laps.positions - indexes of racers (horses) in the order they finished the lap. Since arrays in Tezos are stacks, lap winner is the rightmost item.

## Setup environment

```
./scipts/init-env.sh
source bin/activate
```

## Test

```
spy test tests.py output --html
```


## Compile & Deploy

```
./deploy-dev.sh
```
