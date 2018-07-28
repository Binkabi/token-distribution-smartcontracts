import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const BinkabiToken = artifacts.require('BinkabiToken');

contract('BinkabiToken', (accounts) => {
  it('Should have an initial balance of 100 000 000 * (10 ** 18)', async () => {
    const token = await BinkabiToken.deployed();

    assert.equal(
      (
        (await token.balanceOf.call(accounts[0]))).valueOf(),
      100000000 * (10 ** 18),
    );
  });

  it('Should freeze', async () => {
    const token = await BinkabiToken.deployed();

    await token.transfer(accounts[1], 888);
    await token.pause();

    assertRevert(token.transfer(accounts[1], 888));
  });
});
