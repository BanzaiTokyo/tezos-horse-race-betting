import smartpy as sp


UUSD_TOKEN_ID = 0

class Batch_transfer:
    def get_transfer_type():
        tx_type = sp.TRecord(to_=sp.TAddress, token_id=sp.TNat, amount=sp.TNat)
        tx_type = tx_type.layout(("to_", ("token_id", "amount")))
        transfer_type = sp.TRecord(from_=sp.TAddress, txs=sp.TList(tx_type)).layout(("from_", "txs"))
        return transfer_type

    def get_type():
        return sp.TList(Batch_transfer.get_transfer_type())

    def item(from_, txs):
        v = sp.record(from_=from_, txs=txs)
        return sp.set_type_expr(v, Batch_transfer.get_transfer_type())


class Operator_param:
    def get_operator_type():
        t = sp.TRecord(owner=sp.TAddress, operator=sp.TAddress, token_id=sp.TNat)
        t = t.layout(("owner", ("operator", "token_id")))
        return t

    def get_type():
        return sp.TList(
            sp.TVariant(
                add_operator=Operator_param.get_operator_type(),
                remove_operator=Operator_param.get_operator_type()
            )
        )

    def make(owner, operator, token_id):
        r = sp.record(owner=owner, operator=operator, token_id=token_id)
        return sp.set_type_expr(r, Operator_param.get_operator_type())


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


class TLap:
    def get_type():
        return sp.TRecord(
            started_at = sp.TTimestamp,
            epoch = sp.TNat,
            positions = sp.TList(sp.TNat),
        )

    def make(epoch):
        return sp.set_type_expr(sp.record(
            started_at = sp.now,
            epoch = epoch,
            positions = [],
        ), TLap.get_type())

class TRace:
    def get_type():
        return sp.TRecord(
            horses = sp.TList(THorse.get_type()),
            bets = sp.TMap(sp.TAddress, TBet.get_type()),
            bet_amount = sp.TNat,
            laps = sp.TMap(sp.TNat, TLap.get_type()),
            winner = sp.TInt
        )

    def make(horses):
        return sp.set_type_expr(sp.record(
            horses = horses,
            bets = {},
            bet_amount = 0,
            laps ={},
            winner = -1,
        ), TRace.get_type())


class HorseRace(sp.Contract):
    def __init__(self, owner, randomizer, oracle, uusd):
        self.init(
            data_pool={
                'names': ['Horse 1', 'Horse 2', 'Horse 3', 'Horse 4', 'Horse 5', 'Horse 6', 'Horse 7', 'Horse 8', 'Horse 9', 'Horse 10'],
                'bet_types': ['winner', 'loser', 'top3'],
            },
            owner=owner,
            randomizer=randomizer,
            oracle=oracle,
            uusd=uusd,
            entropy=sp.bytes('0xFF'),
            last_random=sp.nat(0),
            max_laps=4,
            num_horses=6,
            lap_time=60,  # in seconds
            commission=10,  # (in per cent, e.g. 5%)
            ledger=sp.big_map({}, tkey = sp.TAddress, tvalue = sp.TNat),
            current_race=0,
            races=sp.big_map({}, tkey = sp.TNat, tvalue = TRace.get_type()),
            temp=sp.map(l={}, tkey=sp.TNat, tvalue=sp.TNat)
        )

    def get_epoch(self):
        return sp.view("get_current_epoch", self.data.oracle, sp.unit, sp.TNat).open_some()

    def get_entropy(self, epoch):
        self.data.entropy = sp.view("get_entropy", self.data.oracle, epoch, sp.TBytes).open_some()
        entropy_request = sp.record(
            _from=sp.nat(0), _to=abs(sp.now - sp.timestamp(0)) // 2,
            entropy=self.data.entropy, includeRandomizerEntropy=True
        )
        self.data.last_random = sp.view("getRandomBetweenEntropyBytes", self.data.randomizer, entropy_request, sp.TNat).open_some()

    def _random(self, max_, seed):
        rnum = abs(abs(abs(sp.now - sp.timestamp(0)) - self.data.last_random) - seed) % max_
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
            random_bh.value = self._random(num_names.value, i)
            horse_name.value = available_names.value[random_bh.value]
            num_names.value = abs(num_names.value - 1)
            available_names.value[random_bh.value] = available_names.value[num_names.value]
            del available_names.value[num_names.value]
            random_bh.value = self._random(3, abs(n-i)) + 1
            horse = THorse.make(name=horse_name.value, weight=random_bh.value)
            result_bh.value.push(horse)
        return result_bh.value

    def _build_winning_probability(self, race):
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

        sp.for hh in sp.range(0, sp.len(race.horses)):
            horse_bet.value[hh] = 0
            handicap.value[hh] = 0
        sp.for bet_wp in race.bets.values():
            n.value = horse_bet.value.get(bet_wp.horse, 0)
            horse_bet.value[bet_wp.horse] = n.value + bet_wp.amount
        sp.if race.bet_amount > 0:
            sp.for hb in horse_bet.value.items():
                handicap.value[hb.key] = (5*hb.value/race.bet_amount)
        n.value = 0
        sp.for hp in handicap.value.items():
            win_probability.value = abs(10 - hp.value)
            self.data.temp[60 + hp.key] = hp.value
            sp.for k in sp.range(0, win_probability.value):
                randomiser_data.value[n.value+k] = hp.key
            n.value = n.value + win_probability.value
        return randomiser_data

    def _arrange_racers(self, chances):
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
            p = self._random(chances_left.value, i_for)
            participant = chances.value[p]
            self.data.temp[90+i_for] = participant
            run_order.value.push(participant)
            i_ah.value = 0
            sp.for chance in chances.value.values():
                sp.if chance != participant:
                    chances_tmp.value[i_ah.value] = chance
                    i_ah.value = i_ah.value + 1
            chances.value = chances_tmp.value
            chances_tmp.value = {}
        return run_order.value

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
            share = sp.snd(win_bet) + abs(race.bet_amount-total_win_bets.value)*sp.snd(win_bet)/total_win_bets.value
            self.data.ledger[sp.fst(win_bet)] = self.data.ledger.get(sp.fst(win_bet), 0) + share

    @sp.entry_point
    def init_race(self):
        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.if self.data.races.contains(self.data.current_race):
            race = self.data.races[self.data.current_race]
            sp.verify(race.winner < 0, 'There is another race in progress')
        epoch = abs(self.get_epoch() - 2)
        self.get_entropy(epoch)
        horses = self._build_horses(self.data.num_horses)
        self.data.current_race = self.data.current_race + 1
        race_num = self.data.current_race
        self.data.races[race_num] = TRace.make(horses=horses)
        race = self.data.races[race_num]

        # 1st lap, results calculated immediately
        chances = self._build_winning_probability(race)
        run_order = self._arrange_racers(chances)
        lap = sp.local('lap_ir', TLap.make(epoch=epoch))
        lap.value.positions = run_order
        race.laps[0] = lap.value
        race.laps[1] = TLap.make(epoch=epoch)

    @sp.entry_point
    def next_lap(self):
        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.verify(self.data.races.contains(self.data.current_race), 'No races started')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0, 'No race is running')

        last_id = abs(sp.len(race.laps) - 1)
        lap = race.laps[last_id]
        lap_time = abs(sp.now - lap.started_at)
        lap_timed_out = lap_time >= self.data.lap_time
        # I compelled to do this nasty hack with abs(X - 0) otherwise "epoch" would be of type IntOrNat
        epoch = abs(self.get_epoch() - 0)
        sp.if (epoch - lap.epoch >= 2) & lap_timed_out:
            self.data.temp = {}
            self.get_entropy(lap.epoch)
            chances = self._build_winning_probability(race)
            run_order = self._arrange_racers(chances)
            lap.positions = run_order
            sp.if sp.len(race.laps) <= self.data.max_laps:
                race.laps[last_id+1] = TLap.make(epoch=epoch)
            sp.else:
                sp.for p in run_order:
                    race.winner = sp.to_int(p)
                self._distribute_prize()

    @sp.entry_point
    def place_bet(self, params):
        sp.verify(self.data.races.contains(self.data.current_race), 'There is no open race')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0, 'There is no open race')
        sp.verify(sp.len(race.laps) < self.data.max_laps,
                  'Last lap is running, bets not accepted')
        sp.verify(~race.bets.contains(sp.source), 'You have already placed a bet')
        amount = params.amount*abs(100 - self.data.commission)/100
        bet = TBet.make(horse=params.horse, amount=amount)
        sp.verify(bet.amount > 0, 'Bet is too small')
        sp.verify(bet.horse < sp.len(race.horses), 'Horse number is invalid')

        args = [Batch_transfer.item(
            from_ = sp.source,
            txs = [
                sp.record(to_ = sp.self_address, amount = params.amount, token_id = sp.nat(UUSD_TOKEN_ID))
            ]
        )]
        c = sp.contract(Batch_transfer.get_type(), self.data.uusd, entry_point="transfer").open_some('transfer failed')
        sp.transfer(args, sp.mutez(0), c)

        race.bets[sp.source] = bet
        race.bet_amount += bet.amount

    @sp.entry_point
    def withdraw(self):
        sp.verify(self.data.ledger.contains(sp.source), 'Nothing to withdraw')
        ops = [sp.variant("add_operator", Operator_param.make(
                owner=sp.self_address, operator=sp.source, token_id=sp.nat(UUSD_TOKEN_ID))
        )]
        c = sp.contract(Operator_param.get_type(), self.data.uusd, entry_point="update_operators").open_some()
        sp.transfer(ops, sp.mutez(0), c)

        args = [Batch_transfer.item(
            from_ = sp.self_address,
            txs = [
                sp.record(to_ = sp.source, amount = self.data.ledger[sp.source], token_id = sp.nat(UUSD_TOKEN_ID))
            ]
        )]
        c = sp.contract(Batch_transfer.get_type(), self.data.uusd, entry_point="transfer").open_some('transfer failed')
        sp.transfer(args, sp.mutez(0), c)

        ops = [sp.variant("remove_operator", Operator_param.make(
            owner=sp.self_address, operator=sp.source, token_id=sp.nat(UUSD_TOKEN_ID))
        )]
        c = sp.contract(Operator_param.get_type(), self.data.uusd, entry_point="update_operators").open_some()
        sp.transfer(ops, sp.mutez(0), c)

        del self.data.ledger[sp.source]

    @sp.onchain_view()
    def balance_of(self, address):
        sp.result(self.data.ledger.get(address, 0))

