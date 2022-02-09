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
    now = sp.timestamp(1644220006)
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
    scenario += c1.place_bet(horse=4, amount=100).run(source=player1)
    scenario.h4("Go to section 2")
    scenario += oracle.inc_epoch().run()
    scenario += oracle.inc_epoch().run()
    scenario += c1.next_section().run(source=owner, now=now.add_minutes(1))
    scenario.h4("Go to section 3")
    scenario += oracle.inc_epoch().run()
    scenario += oracle.inc_epoch().run()
    scenario += c1.next_section().run(source=owner, now=now.add_minutes(2))
    scenario.h4("Go to section 4")
    scenario += oracle.inc_epoch().run()
    scenario += oracle.inc_epoch().run()
    scenario += c1.next_section().run(source=owner, now=now.add_minutes(3))
    scenario.h4("Go to the race end")
    scenario += oracle.inc_epoch().run()
    scenario += oracle.inc_epoch().run()
    scenario += c1.next_section().run(source=owner, now=now.add_minutes(4))
    scenario.h4("Race info")
    scenario.show(c1.race_info())
    scenario.h4("Player balance")
    scenario.show(c1.balance_of(player1))
    #scenario += c1.withdraw().run(source=player1)
    #scenario.verify(c1.data.races[1].winner >= 0)
    #scenario.verify(c1.data.races[1].winner != 1)
    #scenario.verify(~c1.data.ledger.contains(player1))

#sp.add_compilation_target("HorseRace1", HorseRace(owner=))
