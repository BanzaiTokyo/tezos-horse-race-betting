import smartpy as sp
import os
env = os.environ

HorseRace = sp.io.import_script_from_url("file:contract.py")
owner = sp.address(env['OWNER'])
randomizer = sp.address(env['RANDOMIZER'])
oracle = sp.address(env['ORACLE'])
uusd = sp.address(env['UUSD'])

contract = HorseRace.HorseRace(owner=owner, randomizer=randomizer, oracle=oracle, uusd=uusd)
sp.add_compilation_target("horserace", contract)
