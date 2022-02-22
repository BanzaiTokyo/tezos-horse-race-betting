import smartpy as sp


UUSD_TOKEN_ID = 0
MAX_BETS = 1000
EPOCH_THRESHOLD = 2


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
        return sp.TRecord(player=sp.TAddress, horse=sp.TNat, amount=sp.TNat)

    def make(player, horse, amount):
        return sp.set_type_expr(sp.record(
            player=player,
            horse=horse,
            amount=amount), TBet.get_type())


class THorse:
    def get_type():
        return sp.TRecord(name = sp.TString, color = sp.TString)

    def make(name, color):
        return sp.set_type_expr(sp.record(
            name=name,
            color=color), THorse.get_type())


class TLap:
    def get_type():
        return sp.TRecord(
            started_at = sp.TTimestamp,
            epoch = sp.TNat,
            positions = sp.TList(sp.TNat),
        )

    def make(epoch, positions):
        return sp.set_type_expr(sp.record(
            started_at = sp.now,
            epoch = epoch,
            positions = positions,
        ), TLap.get_type())

class TRace:
    def get_type():
        return sp.TRecord(
            horses = sp.TList(THorse.get_type()),
            jackpot = sp.TNat,
            bets = sp.TList(TBet.get_type()),
            bet_amount = sp.TNat,
            last_bet_epoch = sp.TNat,
            laps = sp.TMap(sp.TInt, TLap.get_type()),
            winner = sp.TInt
        )

    def make(horses, jackpot):
        return sp.set_type_expr(sp.record(
            horses = horses,
            jackpot = jackpot,
            bets = [],
            bet_amount = 0,
            last_bet_epoch = 0,
            laps ={},
            winner = -1,
        ), TRace.get_type())


class HorseRace(sp.Contract):
    def __init__(self, owner, randomizer, oracle, uusd):
        self.init(
            all_horses=sp.big_map({
                0: sp.record(name='Affirmed', color='#21325E'),
                1: sp.record(name='Black Caviar', color='#F1D00A'),
                2: sp.record(name='Citation', color='#6A5495'),
                3: sp.record(name='Dr. Fager', color='#ED5EDD'),
                4: sp.record(name='Eclipse', color='#8BDB81'),
                5: sp.record(name='Foolish Pleasure', color='#E7ED9B'),
                6: sp.record(name='Graydar', color='#00B4D8'),
                7: sp.record(name='Hail to Reason', color='#F76E11'),
                8: sp.record(name='I\'ll Have Another', color='#464E2E'),
                9: sp.record(name='John Henry', color='#FFE4C0'),
                10: sp.record(name='Kelso', color='#B33030'),
                11: sp.record(name='Lost in the Fog', color='#A1B57D'),
                12: sp.record(name='Man o\' War', color='#FA4EAB'),
                13: sp.record(name='Native Dancer', color='#2EB086'),
                14: sp.record(name='Omaha Beach', color='#C8F2EF'),
                15: sp.record(name='Phar Lap', color='#2C3333')
            }, tvalue=THorse.get_type()),
            num_all_horses=16,
            owner=owner,
            randomizer=randomizer,
            oracle=oracle,
            uusd=uusd,
            entropy=sp.bytes('0xFF'),
            last_random=sp.nat(0),
            num_horses=6,
            new_lap_probability=60,  # per cent, e.g. 60%
            commission=10,  # (in per cent, e.g. 5%)
            ledger=sp.big_map({}, tkey=sp.TAddress, tvalue=sp.TNat),
            current_race=-1,
            races=sp.big_map({}, tkey=sp.TInt, tvalue=TRace.get_type()),
        )

    def get_epoch(self):
        return sp.view("get_current_epoch", self.data.oracle, sp.unit, sp.TNat).open_some()

    def get_entropy(self, epoch):
        self.data.entropy = sp.view("get_entropy", self.data.oracle, epoch, sp.TBytes).open_some()
        entropy_request = sp.record(
            _from=sp.nat(0), _to=abs(sp.now - sp.timestamp(0)) // 2,  # just a big number
            entropy=self.data.entropy, includeRandomizerEntropy=True
        )
        self.data.last_random = sp.view("getRandomBetweenEntropyBytes", self.data.randomizer, entropy_request, sp.TNat).open_some()

    def random(self, max_, seed):
        rnum = abs(abs(abs(sp.now - sp.timestamp(0)) - self.data.last_random) - seed) % max_
        self.data.last_random = rnum
        return self.data.last_random

    def build_horses(self, n):
        sp.verify(n <= self.data.num_all_horses, 'not enough horses in the mews')
        num_horses = sp.local('num_horses', self.data.num_all_horses)
        random_bh = sp.local('random_bh', 0)
        horse_bh = sp.local('horse_bh', THorse.make('dummy', 'dummy'))
        result_bh = sp.local('result_bh', sp.list(l=[], t=THorse.get_type()))
        available_horses = sp.local('available_horses', sp.map(tkey=sp.TNat, tvalue = THorse.get_type()))
        sp.for h in sp.range(0, self.data.num_all_horses):
            available_horses.value[h] = self.data.all_horses[h]
        sp.for i in sp.range(0, n):
            random_bh.value = self.random(max_=num_horses.value, seed=i)
            horse_bh.value = sp.compute(available_horses.value[random_bh.value])
            num_horses.value = abs(num_horses.value - 1)
            available_horses.value[random_bh.value] = available_horses.value[num_horses.value]
            del available_horses.value[num_horses.value]
            result_bh.value.push(horse_bh.value)
        return result_bh.value

    def build_winning_probability(self, race):
        """
        build a list like 00011111222233333333 where numbers are horse indexes
        and their quantity is the chance (from 1 to 10) to get on the 1st position
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

        sp.for bet in race.bets:
            n.value = horse_bet.value.get(bet.horse, 0)
            horse_bet.value[bet.horse] = n.value + bet.amount
        sp.if race.bet_amount > 0:
            sp.for hb in horse_bet.value.items():
                handicap.value[hb.key] = (5*hb.value/race.bet_amount)
        n.value = 0
        sp.for hp in handicap.value.items():
            win_probability.value = abs(10 - hp.value)
            sp.for k in sp.range(0, win_probability.value):
                randomiser_data.value[n.value+k] = hp.key
            n.value = n.value + win_probability.value
        return randomiser_data

    def arrange_racers(self, chances):
        """
        order horses in the run using results of build_winning_probability
        """
        chances_left = sp.local('chances_left', 0)
        chances_tmp = sp.local('chances_tmp', sp.map(l={0: 0}))
        run_order = sp.local('run_order', sp.list(l=[], t=sp.TNat))
        i = sp.local('i', 0)
        race = self.data.races[self.data.current_race]

        sp.for i_for in sp.range(0, sp.len(race.horses)):
            chances_left.value = sp.len(chances.value.keys())
            p = self.random(max_=chances_left.value, seed=i_for)
            participant = chances.value[p]
            run_order.value.push(participant)
            i.value = 0
            sp.for chance in chances.value.values():
                sp.if chance != participant:
                    chances_tmp.value[i.value] = chance
                    i.value = i.value + 1
            chances.value = chances_tmp.value
            chances_tmp.value = {}
        return run_order.value

    def race_continues(self, last_id):
        rnd = self.random(max_=100, seed=0)
        sp.if last_id < self.data.new_lap_probability:
            return rnd < abs(self.data.new_lap_probability - last_id)
        return False

    def distribute_prize(self, race):
        """
        calculate prize amount for each winning bet
        :return: jackpot amount for the next race
        """
        sp.verify(race.winner >= 0, 'Race is not finished')
        total_win_bets = sp.local('total_win_bets', 0)
        win_bets = sp.local('win_bets', sp.list(t=sp.TPair(sp.TAddress, sp.TNat)))
        sp.for bet in race.bets:
            sp.if bet.horse == abs(race.winner):
                total_win_bets.value += bet.amount
                win_bets.value.push(sp.pair(bet.player, bet.amount))
        sp.for win_bet in win_bets.value:
            ratio = sp.snd(win_bet)/total_win_bets.value
            prize = sp.snd(win_bet) + (abs(race.bet_amount-total_win_bets.value) + race.jackpot) * ratio
            self.data.ledger[sp.fst(win_bet)] = self.data.ledger.get(sp.fst(win_bet), 0) + prize
        jackpot = sp.local('jackpot', total_win_bets.value)
        sp.if total_win_bets.value == sp.nat(0):
            jackpot.value = race.bet_amount + race.jackpot
        return jackpot.value

    def make_lap(self, race, epoch):
        chances = self.build_winning_probability(race)
        run_order = self.arrange_racers(chances)
        return TLap.make(epoch=epoch, positions=run_order)

    def make_race(self, jackpot):
        horses = self.build_horses(self.data.num_horses)
        self.data.current_race = self.data.current_race + 1
        race_num = self.data.current_race
        self.data.races[race_num] = TRace.make(horses=horses, jackpot=jackpot)

    @sp.entry_point
    def init_race(self):
        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.if self.data.races.contains(self.data.current_race):
            race = self.data.races[self.data.current_race]
            sp.verify(race.winner < 0, 'There is another race in progress')
        epoch = abs(self.get_epoch() - 1)  # -1 from current epoch to make sure entropy exists
        self.get_entropy(epoch)
        self.make_race(jackpot=0)

    @sp.entry_point
    def next_lap(self):
        sp.verify(sp.source == self.data.owner, 'Not an admin')
        sp.verify(self.data.races.contains(self.data.current_race), 'init_race must be called after deploy')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0, 'No race is running')

        last_id = sp.len(race.laps) - 1
        sp.verify(last_id >= 0, 'Race is not started')
        lap = race.laps[last_id]
        # I compelled to do this nasty hack with abs(X - 0) otherwise "epoch" would be of type IntOrNat
        epoch = abs(self.get_epoch() - 0)
        sp.verify(epoch - race.last_bet_epoch >= EPOCH_THRESHOLD, 'Epoch is not advanced since last bet')
        self.get_entropy(lap.epoch)
        sp.if self.race_continues(last_id):
            race.laps[last_id + 1] = self.make_lap(race, epoch)
        sp.else:
            sp.for p in lap.positions:
                race.winner = sp.to_int(p)
            jackpot = self.distribute_prize(race)
            self.make_race(jackpot)

    @sp.entry_point
    def place_bet(self, params):
        sp.verify(self.data.races.contains(self.data.current_race), 'There is no open race')
        race = self.data.races[self.data.current_race]
        sp.verify(race.winner < 0, 'There is no open race')
        sp.verify(sp.len(race.bets) < MAX_BETS, 'Too many bets, please wait for another race')
        amount = params.amount*abs(100 - self.data.commission)/100
        sp.verify(amount > 0, 'Bet is too small')
        sp.verify(params.horse < sp.len(race.horses), 'Horse number is invalid')

        epoch = abs(self.get_epoch() - 0)
        last_id = sp.len(race.laps) - 1
        sp.if last_id < 0:
            race.laps[0] = self.make_lap(race, epoch)

        args = [Batch_transfer.item(
            from_ = sp.source,
            txs = [
                sp.record(to_ = sp.self_address, amount = params.amount, token_id = sp.nat(UUSD_TOKEN_ID))
            ]
        )]
        c = sp.contract(Batch_transfer.get_type(), self.data.uusd, entry_point="transfer").open_some('transfer failed')
        sp.transfer(args, sp.mutez(0), c)

        race.last_bet_epoch = epoch
        race.bets.push(TBet.make(player=sp.source, horse=params.horse, amount=amount))
        race.bet_amount += amount

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
