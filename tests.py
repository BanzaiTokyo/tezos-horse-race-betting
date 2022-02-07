import smartpy as sp

HorseRace = sp.io.import_script_from_url("file:contract.py")
Randomizer = sp.io.import_script_from_url("https://ipfs.infura.io/ipfs/QmPNkabMCpDmFE6GynfS9UAoQDLE6PyCLpRJQmceEp2oTv")


@sp.add_test(name="HorseRace")
def test():
    owner = sp.test_account("owner").address
    randomizer = Randomizer.Randomizer(
        admin=owner,
        metadata=sp.big_map({
            "": sp.utils.bytes_of_string("tezos-storage:content"),
            "content": sp.utils.bytes_of_string('{"name": "Randomizer"}')
        })
    )
    player1 = sp.test_account("player1").address
    c1 = HorseRace.HorseRace(owner=owner, randomizer=randomizer.address)
    scenario = sp.test_scenario()
    scenario += c1
    scenario += randomizer
    scenario.h4("Init race")
    scenario += c1.init_race().run(source=owner)
    scenario.h4("Place bet")
    scenario += c1.place_bet(horse=1, amount=100).run(source=player1)
    #sp.for i in sp.range(0, c1.data.max_sections):
    scenario.h4("Go to section 2")
    scenario += c1.next_section().run(source=owner)
    scenario.h4("Go to section 3")
    scenario += c1.next_section().run(source=owner)
    scenario.h4("Go to section 4")
    scenario += c1.next_section().run(source=owner)
    scenario.h4("Go to the race end")
    scenario += c1.next_section().run(source=owner)
    scenario.h4("Race info")
    scenario.show(c1.race_info())
    scenario.h4("Player balance")
    scenario.show(c1.balance_of(player1))
    #scenario.verify(c1.data.races[1].winner >= 0)
    #scenario.verify(c1.data.races[1].winner != 1)
    #scenario.verify(~c1.data.ledger.contains(player1))

#sp.add_compilation_target("HorseRace1", HorseRace(owner=))
