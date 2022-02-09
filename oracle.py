import smartpy as sp


class Oracle(sp.Contract):
    def __init__(self):
        self.init(current_epoch=0, entropy=sp.bytes('0x00'))

    @sp.entry_point
    def inc_epoch(self):
        self.data.current_epoch = self.data.current_epoch + 1
        self.data.entropy = sp.pack(self.data.current_epoch)

    @sp.onchain_view()
    def get_current_epoch(self):
        sp.result(self.data.current_epoch)

    @sp.onchain_view()
    def get_entropy(self, params):
        sp.result(self.data.entropy)
