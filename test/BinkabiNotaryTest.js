import 'chai'; // Needed for expectEvent
import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';
import expectEvent from 'openzeppelin-solidity/test/helpers/expectEvent';

const BinkabiNotary = artifacts.require('BinkabiNotary');

contract('BinkabiNotary', (accounts) => {
  it('Should run for owner', async () => {
    const notary = await BinkabiNotary.deployed();
    await expectEvent.inTransaction(
      notary.notarise(0x00, 0x00),
      'Notarise',
    );
  });

  it('Should not run for non-owner', async () => {
    const notary = await BinkabiNotary.deployed();
    await assertRevert(notary.notarise(0x00, 0x00, { from: accounts[1] }));
  });
});
