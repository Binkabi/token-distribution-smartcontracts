import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const SimpleMemberDeposit = artifacts.require('SimpleMemberDeposit');
const BinkabiToken = artifacts.require('BinkabiToken');

contract('SimpleMemberDeposit', (accounts) => {
  it('Should accept BKB tokens', async () => {
    const membership = await SimpleMemberDeposit.deployed();
    const token = await BinkabiToken.deployed();

    await token.transfer(membership.address, 5);
    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 5);
    const amount = await (membership.getAmount.call(accounts[0])).valueOf();
    assert.equal(amount[0], 5);
  });

  it('Should refund BKB tokens', async () => {
    const token = await BinkabiToken.new();
    const membership = await SimpleMemberDeposit.new(token.address);
    membership.setApiAddress(accounts[0], { from: accounts[0] });

    await token.transfer(membership.address, 5);
    await token.transfer(accounts[1], 5);
    await token.transfer(membership.address, 5, { from: accounts[1] });

    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 10);
    assert.equal((await membership.getAmount.call(accounts[0])).valueOf()[0], 5);
    assert.equal((await membership.getAmount.call(accounts[1])).valueOf()[0], 5);
    //
    await membership.memberWithdrawal(accounts[1], 5, { from: accounts[0] });

    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 5);
    assert.equal((await membership.getAmount.call(accounts[0])).valueOf()[0], 5);
    assert.equal((await membership.getAmount.call(accounts[1])).valueOf()[0], 0);

    await membership.memberWithdrawal(accounts[0], 5, { from: accounts[0] });

    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 0);
    assert.equal((await membership.getAmount.call(accounts[0])).valueOf()[0], 0);
    assert.equal((await token.balanceOf.call(accounts[0])).valueOf(), 10 ** 26);
  });

  it('Check a user is membership', async () => {
    const token = await BinkabiToken.new();
    const membership = await SimpleMemberDeposit.new(token.address);

    await token.transfer(membership.address, 5);

    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 5);
    assert.equal((await membership.getAmount.call(accounts[0])).valueOf()[0], 5);

    // user is not membership because it does not have 5 block confirmations
    assert.equal((await membership.isMembership.call(accounts[0])).valueOf()[0], false);
  });


  it('Only Api Backend can refund', async () => {
    const token = await BinkabiToken.new();
    const membership = await SimpleMemberDeposit.new(token.address);
    membership.setApiAddress(accounts[0], { from: accounts[0] });

    await token.transfer(membership.address, 5);
    await token.transfer(accounts[1], 5);
    await token.transfer(membership.address, 5, { from: accounts[1] });
    assertRevert(membership.memberWithdrawal(accounts[0], 5, { from: accounts[1] }));
    await membership.memberWithdrawal(accounts[0], 5, { from: accounts[0] });

    assert.equal((await token.balanceOf.call(membership.address)).valueOf(), 5);
    assert.equal((await membership.getAmount.call(accounts[0])).valueOf()[0], 0);
  });

  it('Add more token accept', async () => {
    const token = await BinkabiToken.new();
    const membership = await SimpleMemberDeposit.new(token.address);
    membership.setApiAddress(accounts[0], { from: accounts[0] });

    assertRevert(membership.addTokenToListAccept(accounts[1], { from: accounts[1] }));
    assertRevert(membership.addTokenToListAccept(accounts[1], { from: accounts[0] }));

    const isAdd = (await membership.addTokenToListAccept.call(membership.address, { from: accounts[0] }));
    assert.equal(isAdd.valueOf(), true);
  });
});
