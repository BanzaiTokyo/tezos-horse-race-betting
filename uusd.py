import smartpy as sp

class Batch_transfer:
    def get_transfer_type():
        tx_type = sp.TRecord(to_=sp.TAddress,
                             token_id=sp.TNat,
                             amount=sp.TNat
                             ).layout(("to_", ("token_id", "amount")))
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


class Uusd(sp.Contract):
    def __init__(self):
        self.init(x=0)

    @sp.entry_point
    def transfer(self, params):
        sp.set_type(params, Batch_transfer.get_type())
        self.data.x = self.data.x + 1

    @sp.entry_point
    def update_operators(self, params):
        sp.set_type(params, Operator_param.get_type())
        self.data.x = self.data.x + 1
