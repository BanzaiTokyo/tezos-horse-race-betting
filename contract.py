import smartpy as sp
# https://github.com/asbjornenge/tezos-randomizer
Randomizer = sp.io.import_script_from_url("https://ipfs.infura.io/ipfs/QmPNkabMCpDmFE6GynfS9UAoQDLE6PyCLpRJQmceEp2oTv")
UUSD_CONTRACT = sp.address('KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3')

class TBet:
    def get_type():
        return sp.TRecord(horse = sp.TNat, amount = sp.TNat)

    def make(horse, amount):
        return sp.set_type_expr(sp.record(
            horse=horse,
            amount=amount), TBet.get_type())


class THorse:
    def get_type():
        return sp.TRecord(name = sp.TString, weight = sp.TNat)

    def make(name, weight):
        return sp.set_type_expr(sp.record(
            name=name,
            weight=weight), THorse.get_type())


class TRace:
    def get_type():
        return sp.TRecord(
            horses = sp.TList(THorse.get_type()),
            bets = sp.TMap(sp.TAddress, TBet.get_type()),
            total_bet = sp.TNat,
            section_results = sp.TList(sp.TList(sp.TNat)),
            winner = sp.TInt
        )

    def make(horses):
        return sp.set_type_expr(sp.record(
            horses = horses,
            bets = {},
            total_bet = 0,
            section_results = [],
            winner = -1,
        ), TRace.get_type())


class HorseRace(sp.Contract):
    def __init__(self, owner, randomizer):
        self.init(
            data_pool={
                'names': ['Horse 1', 'Horse 2', 'Horse 3', 'Horse 4', 'Horse 5', 'Horse 6'],
                'bet_types': ['winner', 'loser', 'top3'],
            },
            owner=owner,
            randomizer=randomizer,#sp.address('tz1000000000000000000000000000000000'),
            entropy=0,
            last_random=0,
            max_sections=4,
            num_horses=6,
            commission=10,  # (in per cent, e.g. 5%)
            ledger=sp.big_map({}, tkey = sp.TAddress, tvalue = sp.TNat),
            current_race=0,
            races=sp.big_map({}, tkey = sp.TNat, tvalue = TRace.get_type()),
            temp=sp.map(l={}, tkey=sp.TNat, tvalue=sp.TNat)
        )

    @sp.entry_point
    def set_last_random(self, params):
        sp.set_type(params, sp.TNat)
        sp.verify(sp.sender == self.data.randomizer,
                  'Only Randomizer can call this entrypoint')
        self.data.last_random = params

    def _random_as_callback(self, max_):
        t = sp.TRecord(_from=sp.TNat, _to=sp.TNat, entropy=sp.TNat, callback_address=sp.TAddress)
        c = sp.contract(t, self.data.randomizer, entry_point="getRandomBetweenEntropy").open_some()
        callback_address = sp.self_entry_point_address(entry_point="set_last_random")
        params = sp.record(_from=0, _to=abs(max_-1), entropy=self.data.entropy, callback_address=callback_address)
        sp.transfer(params, sp.mutez(0), c)
        return self.data.last_random

    def _random(self, max_):
        sp.set_type(max_, sp.TNat)
        arg =  sp.record(_from=0, _to=abs(max_-1), entropy=self.data.last_random)
        rnum = sp.view("getRandomBetweenEntropy", self.data.randomizer, arg, sp.TNat).open_some("Invalid view")
        self.data.last_random = rnum
        return self.data.last_random

    def _build_horses(self, n):
        num_names = sp.local('num_names', 0)
        random_bh = sp.local('random_bh', 0)
        horse_name = sp.local('horse_name', '')
        result_bh = sp.local('result_bh', sp.list(l=[], t=THorse.get_type()))
        available_names = sp.local('available_names', sp.map(tkey=sp.TNat, tvalue = sp.TString))
        sp.for name in self.data.data_pool['names']:
            available_names.value[num_names.value] = name
            num_names.value = num_names.value + 1
        sp.verify(n <= num_names.value, 'not enough horses in the mews')
        sp.for i in sp.range(0, n):
            random_bh.value = self._random(num_names.value)
            horse_name.value = available_names.value[random_bh.value]
            num_names.value = abs(num_names.value - 1)
            available_names.value[random_bh.value] = available_names.value[num_names.value]
            del available_names.value[num_names.value]
            random_bh.value = self._random(3) + 1
            horse = THorse.make(name=horse_name.value, weight=random_bh.value)
            result_bh.value.push(horse)
        return result_bh.value

    def _build_winning_probability(self):
        """
        build a list like 00011111222233333333 where numbers are horse indexes
        and their quantity is the chance to get on the 1st position
        :return: {0: 0, 1: 0, 2: 0, 3: 1, 4: 1, ...} for random access
        """
        horse_bet = sp.local('horse_bet', sp.map(l={0: 0}))
        handicap = sp.local('handicap', sp.map(l={0: 0}))
        randomiser_data = sp.local('randomiser_data', sp.map(l={0: 0}))
        n = sp.local('n', 0)
        win_probability = sp.local('win_probability', 0)
        race = self.data.races[self.data.current_race]

        sp.for hh in sp.range(0, sp.len(race.horses)):
            horse_bet.value[hh] = 0
            handicap.value[hh] = 0
        sp.for bet_wp in race.bets.values():
            n.value = horse_bet.value.get(bet_wp.horse, 0)
            horse_bet.value[bet_wp.horse] = n.value + bet_wp.amount
        sp.if race.total_bet > 0:
            sp.for hb in horse_bet.value.items():
                handicap.value[hb.key] = (5*hb.value/race.total_bet)
        n.value = 0
        sp.for hp in handicap.value.items():
            win_probability.value = abs(10 - hp.value)
            self.data.temp[60 + hp.key] = hp.value
            sp.for k in sp.range(0, win_probability.value):
                randomiser_data.value[n.value+k] = hp.key
            n.value = n.value + win_probability.value
        return randomiser_data

    def _arrange_horses(self, chances):
        """
        order horses in the run using results of _build_winning_probability
        """
        chances_left = sp.local('chances_left', 0)
        chances_tmp = sp.local('chances_tmp', sp.map(l={0: 0}))
        run_order = sp.local('run_order', sp.list(l=[], t=sp.TNat))
        i_ah = sp.local('i_ah', 0)
        race = self.data.races[self.data.current_race]
        sp.for c in chances.value.items():
            self.data.temp[c.key] = c.value
        #sp.while sp.len(chances.value.keys()) > 0:
        sp.for i_for in sp.range(0, sp.len(race.horses)):
            chances_left.value = sp.len(chances.value.keys())
            self.data.temp[70+i_for] = chances_left.value
            p = self._random(chances_left.value)
            participant = chances.value[p]
            self.data.temp[90+i_for] = p
            run_order.value.push(participant)
            i_ah.value = 0
            sp.for chance in chances.value.values():
                sp.if chance != participant:
                    chances_tmp.value[i_ah.value] = chance
                    i_ah.value = i_ah.value + 1
            chances.value = chances_tmp.value
            chances_tmp.value = {}

        run_order.value.rev()
        race.section_results.rev()
        race.section_results.push(run_order.value)
        race.section_results.rev()

    def _distribute_prize(self):
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner >= 0, 'Race is not finished')
        total_win_bets = sp.local('total_win_bets', 0)
        win_bets = sp.local('win_bets', sp.list(t=sp.TPair(sp.TAddress, sp.TNat)))
        sp.for bet_dp in race.bets.items():
            sp.if bet_dp.value.horse == abs(race.winner):
                total_win_bets.value += bet_dp.value.amount
                win_bets.value.push(sp.pair(bet_dp.key, bet_dp.value.amount))
        sp.for win_bet in win_bets.value:
            share = sp.snd(win_bet) + abs(race.total_bet-total_win_bets.value)*sp.snd(win_bet)/total_win_bets.value
            self.data.ledger[sp.fst(win_bet)] = self.data.ledger.get(sp.fst(win_bet), 0) + share

    @sp.entry_point
    def init_race(self):
        sp.if self.data.randomizer == sp.address('tz1000000000000000000000000000000000'):
            rnd = Randomizer.Randomizer(admin=sp.source, metadata={})
            self.data.randomizer = rnd.address

        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.if self.data.races.contains(self.data.current_race):
            race = self.data.races[self.data.current_race]
            sp.verify(race.winner < 0, 'There is another race in progress')
        race_num = self.data.current_race + 1
        self.data.races[race_num] = TRace.make(
            horses=self._build_horses(self.data.num_horses),
        )
        self.data.current_race = race_num
        self.next_section()

    @sp.entry_point
    def next_section(self):
        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.verify(self.data.races.contains(self.data.current_race), 'No races started')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0,  'No race is running')
        self.data.temp = {}
        chances = self._build_winning_probability()
        self._arrange_horses(chances)
        sp.if sp.len(race.section_results) > self.data.max_sections:
            with sp.match_cons(race.section_results) as last_section:
                with sp.match_cons(last_section.tail) as last_results:
                    with sp.match_cons(last_results.head) as lr:
                        w = lr.head
                        race.winner = sp.to_int(w)
            self._distribute_prize()

    @sp.entry_point
    def place_bet(self, params):
        sp.verify(self.data.races.contains(self.data.current_race), 'There is no open race')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0, 'There is no open race')
        sp.verify(sp.len(race.section_results) < self.data.max_sections,
                  'Last section is running, bets not accepted')
        sp.verify(~race.bets.contains(sp.source), 'You have already placed a bet')
        amount = params.amount*abs(100 - self.data.commission)/100
        bet = TBet.make(horse=params.horse, amount=amount)
        sp.verify(bet.amount > 0, 'Bet is too small')
        sp.verify(bet.horse < sp.len(race.horses), 'Horse number is invalid')
        # uusd_contract.transfer(sp.self_address, bet.amount)
        race.bets[sp.source] = bet
        race.total_bet += bet.amount

    @sp.offchain_view()
    def race_info(self):
        sp.verify(self.data.races.contains(self.data.current_race), 'No races started')
        race = self.data.races[self.data.current_race]
        sp.result(race)

    @sp.onchain_view()
    def balance_of(self, address):
        sp.result(self.data.ledger.get(address, 0))

    @sp.entry_point
    def withdraw(self):
        sp.verify(self.data.ledger.contains(sp.source), 'Nothing to withdraw')
        # uusd_contract.transfer(sp.source, self.data.ledger[sp.source])
        del self.data.ledger[sp.source]
