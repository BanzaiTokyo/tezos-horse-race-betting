import smartpy as sp

class TTransfer:
    def get_type():
        return sp.TRecord(
            from_ = sp.TAddress,
            txs = sp.TList(t = sp.TRecord(
                to_ = sp.TAddress,
                token_id = sp.TNat,
                amount = sp.TString,
            )))
    def string_of_nat(params):
        c   = sp.map({x : str(x) for x in range(0, 10)})
        x   = sp.local('x_son', params)
        res = sp.local('res_son', [])
        sp.if x.value == 0:
            res.value.push('0')
        sp.while 0 < x.value:
            res.value.push(c[x.value % 10])
            x.value //= 10
        return sp.concat(res.value)

    def make(from_, to_, amount):
        amt_str = TTransfer.string_of_nat(amount)
        return sp.set_type_expr(sp.record(
            from_=from_,
            txs=[sp.record(to_=to_, token_id=0, amount=amt_str)]), TTransfer.get_type())


class Uusd(sp.Contract):
    def __init__(self):
        self.init(x=0)

    @sp.entry_point
    def transfer(self, params):
        sp.set_type(params, TTransfer.get_type())
        self.data.x = self.data.x + 1
