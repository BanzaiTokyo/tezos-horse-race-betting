import smartpy as sp


class Oracle(sp.Contract):
    def __init__(self):
        self.init(current_epoch=sp.nat(0), entropy=sp.bytes('0x00'))

    @sp.entry_point
    def inc_epoch(self):
        self.data.current_epoch = self.data.current_epoch + 1
        self.data.entropy = sp.pack(self.data.current_epoch)

    @sp.onchain_view()
    def get_current_epoch(self):
      res = self.data.current_epoch
      sp.result(res)

    @sp.onchain_view()
    def get_entropy(self, epoch):
      sp.set_type(epoch, sp.TNat)
      res = self.data.entropy
      sp.result(res)
