import 'chai'; // Needed for expectEvent
import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const BinkabiNotary = artifacts.require('BinkabiNotary');
const BinkabiToken = artifacts.require('BinkabiToken');

contract('BinkabiNotary', (accounts) => {
  // it('Should run for BKB holder', async () => {
  //   const notary = await BinkabiNotary.deployed();
  //   await expectEvent.inTransaction(
  //     notary.notarise(0x00, [0x00], true),
  //     'Notarise',
  //   );
  // });
  //
  // it('Should not run for non-BKB holder', async () => {
  //   const notary = await BinkabiNotary.deployed();
  //   await assertRevert(notary.notarise(0x00, [0x00], true, { from: accounts[1] }));
  // });

  it('should get notary of an order', async () => {
    const token = await BinkabiToken.new();
    const notary = await BinkabiNotary.new(token.address);

    const orderId = 1;
    notary.setApiAddress(accounts[0], { from: accounts[0] });

    await notary.notarise(orderId, [0, 1], true, { from: accounts[0] });
    await notary.notarise(orderId, [1, 0], false, { from: accounts[0] });

    const listNotaries = (await notary.getNotaries.call(orderId)).valueOf();

    const byte0 = 0x0000000000000000000000000000000000000000000000000000000000000000;
    const byte1 = 0x1000000000000000000000000000000000000000000000000000000000000000;

    assert.equal(listNotaries[0][0], byte0);
    assert.equal(listNotaries[0][1], byte1);
    assert.equal(listNotaries[1][0], byte1);
    assert.equal(listNotaries[1][1], byte0);
  });

  it('Only Api Backend can create notary', async () => {
    const token = await BinkabiToken.new();
    const notary = await BinkabiNotary.new(token.address);

    const orderId = 1;
    notary.setApiAddress(accounts[0], { from: accounts[0] });

    assertRevert(notary.notarise(orderId, [0, 1], true, { from: accounts[1] }));
  });
});
