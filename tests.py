import smartpy as sp

HorseRace = sp.io.import_script_from_url("file:contract.py")
# https://github.com/asbjornenge/tezos-randomizer
#Randomizer = sp.io.import_script_from_url("https://ipfs.infura.io/ipfs/QmPNkabMCpDmFE6GynfS9UAoQDLE6PyCLpRJQmceEp2oTv")
Randomizer = sp.io.import_script_from_url("file:tezos-randomizer/randomizer.py")
Uusd = sp.io.import_script_from_url("file:uusd.py")
Oracle = sp.io.import_script_from_url("file:oracle.py")

@sp.add_test(name="HorseRace")
def test():
    scenario = sp.test_scenario()
    now = sp.timestamp(1644220005)
    owner = sp.test_account("owner").address
    player1 = sp.test_account("player1").address
    randomizer = Randomizer.Randomizer(
        admin=owner,
        metadata=sp.big_map({
            "": sp.utils.bytes_of_string("tezos-storage:content"),
            "content": sp.utils.bytes_of_string('{"name": "Randomizer"}')
        })
    )
    uusd = Uusd.Uusd()
    oracle = Oracle.Oracle()
    c1 = HorseRace.HorseRace(owner=owner, randomizer=randomizer.address, oracle=oracle.address, uusd=uusd.address)
    scenario += c1
    scenario += randomizer
    scenario += uusd
    scenario += oracle
    scenario.h4("Init race")
    scenario += c1.init_race().run(source=owner, now=now)
    scenario.h4("Place bet")
    race = c1.data.races[0]
    scenario.verify(sp.len(race.laps) == 0)
    scenario += c1.place_bet(horse=0, amount=100).run(source=player1)
    scenario.verify(sp.len(race.laps) == 1)
    for h in range(1, 6):
        scenario += c1.place_bet(horse=h, amount=100).run(source=player1)
    for l in range(1, 5):
        scenario.h4(f"Go to lap {l}")
        scenario += oracle.inc_epoch().run()
        scenario += oracle.inc_epoch().run()
        scenario += c1.next_lap().run(source=owner, now=now.add_minutes(l))
    scenario.h4(f"Mustn't go to next lap, new race is not started")
    scenario += oracle.inc_epoch().run()
    scenario += oracle.inc_epoch().run()
    scenario += c1.next_lap().run(source=owner, now=now.add_minutes(31), valid=False, exception='Race is not started')
    scenario.h4("Player balance")
    scenario.show(c1.balance_of(player1))
    scenario.verify(c1.data.ledger[player1] == sp.len(race.horses)*90)
    scenario += c1.withdraw().run(source=player1)
    scenario.verify(~c1.data.ledger.contains(player1))

#sp.add_compilation_target("HorseRace1", HorseRace(owner=))
