import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const OrderPerformanceBond = artifacts.require('OrderPerformanceBond');
const BinkabiToken = artifacts.require('BinkabiToken');

contract('OrderPerformanceBond', (accounts) => {
  it('Make full process: create order, payment and refund', async () => {
    const token = await BinkabiToken.new();
    const order = await OrderPerformanceBond.new(token.address);
    await order.setApiAddress(accounts[0], { from: accounts[0] });

    // Transfer BKB token 2 accounts
    await token.transfer(accounts[1], 1000);
    await token.transfer(accounts[2], 1000);

    // Make order
    const orderId = 1;
    await order.createOrderBond(orderId, accounts[1], accounts[2], 100, 200, { from: accounts[0] });

    // Make sure order status: isBuyerDeposited = false, isSellerDeposited = false, isRefunded = false
    const orderDetail = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail[0], false);
    assert.equal(orderDetail[1], false);
    assert.equal(orderDetail[2], false);

    // Make payment
    await token.transfer(order.address, 100, { from: accounts[1] });
    await token.transfer(order.address, 200, { from: accounts[2] });

    // Check balance of order
    assert.equal((await token.balanceOf.call(order.address)).valueOf(), 300);
    assert.equal((await order.balanceOf.call(orderId, accounts[1])).valueOf(), 100);
    assert.equal((await order.balanceOf.call(orderId, accounts[2])).valueOf(), 200);

    // Make sure buyer & seller is payment
    const orderDetail2 = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail2[0], true);
    assert.equal(orderDetail2[1], true);
    assert.equal(orderDetail2[2], false);

    // Refund order
    await order.refund(orderId, { from: accounts[0] });

    // Check balance again
    assert.equal((await token.balanceOf.call(order.address)).valueOf(), 0);
    assert.equal((await token.balanceOf.call(accounts[1])).valueOf(), 1000);
    assert.equal((await token.balanceOf.call(accounts[2])).valueOf(), 1000);
    assert.equal((await order.balanceOf.call(orderId, accounts[1])).valueOf(), 0);
    assert.equal((await order.balanceOf.call(orderId, accounts[2])).valueOf(), 0);

    const orderDetail3 = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail3[0], true);
    assert.equal(orderDetail3[1], true);
    assert.equal(orderDetail3[2], true);
  });

  it('Transfer exactly amount to payment', async () => {
    const token = await BinkabiToken.new();
    const order = await OrderPerformanceBond.new(token.address);
    await order.setApiAddress(accounts[0], { from: accounts[0] });

    // Transfer BKB token 2 accounts
    await token.transfer(accounts[1], 1000);
    await token.transfer(accounts[2], 1000);

    // Make order
    const orderId = 1;
    await order.createOrderBond(orderId, accounts[1], accounts[2], 100, 200, { from: accounts[0] });

    // Make sure order status: isBuyerDeposited = false, isSellerDeposited = false, isRefunded = false
    const orderDetail = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail[0], false);
    assert.equal(orderDetail[1], false);
    assert.equal(orderDetail[2], false);

    // Make payment
    await token.transfer(order.address, 100, { from: accounts[1] });
    await token.transfer(order.address, 300, { from: accounts[2] });

    // Make sure buyer & seller is payment
    const orderDetail2 = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail2[0], true);
    assert.equal(orderDetail2[1], false);
    assert.equal(orderDetail2[2], false);
  });

  it('Only Api Backend can create order', async () => {
    const token = await BinkabiToken.new();
    const order = await OrderPerformanceBond.new(token.address);
    await order.setApiAddress(accounts[0], { from: accounts[0] });

    // Make order
    const orderId = 1;
    assertRevert(order.createOrderBond(orderId, accounts[1], accounts[2], 100, 200, { from: accounts[1] }));
  });

  it('Only Api Backend can refund', async () => {
    const token = await BinkabiToken.new();
    const order = await OrderPerformanceBond.new(token.address);
    await order.setApiAddress(accounts[0], { from: accounts[0] });

    // Transfer BKB token 2 accounts
    await token.transfer(accounts[1], 1000);
    await token.transfer(accounts[2], 1000);

    // Make order
    const orderId = 1;
    await order.createOrderBond(orderId, accounts[1], accounts[2], 100, 200, { from: accounts[0] });

    // Make sure order status: isBuyerDeposited = false, isSellerDeposited = false, isRefunded = false
    const orderDetail = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail[0], false);
    assert.equal(orderDetail[1], false);
    assert.equal(orderDetail[2], false);

    // Make payment
    await token.transfer(order.address, 100, { from: accounts[1] });
    await token.transfer(order.address, 200, { from: accounts[2] });

    // Check balance of order
    assert.equal((await token.balanceOf.call(order.address)).valueOf(), 300);
    assert.equal((await order.balanceOf.call(orderId, accounts[1])).valueOf(), 100);
    assert.equal((await order.balanceOf.call(orderId, accounts[2])).valueOf(), 200);

    // Make sure buyer & seller is payment
    const orderDetail2 = (await order.orderDetail.call(orderId)).valueOf();
    assert.equal(orderDetail2[0], true);
    assert.equal(orderDetail2[1], true);
    assert.equal(orderDetail2[2], false);

    // Refund order
    assertRevert(order.refund(orderId, { from: accounts[1] }));
  });
});
