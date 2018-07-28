const SandboxMembership = artifacts.require('SimpleMemberDeposit');
const BinkabiToken = artifacts.require('BinkabiToken');
const BinkabiNotary = artifacts.require('BinkabiNotary');
const OrderPerformanceBond = artifacts.require('OrderPerformanceBond');

// const apiAddress = process.env.APIADDRESS;
const apiAddress = '0xD9C69E9E6949BDbf900d3A1639041069fA73C44f';

module.exports = (deployer) => {
  deployer.deploy(SandboxMembership, BinkabiToken.address).then(function () {
    return SandboxMembership.deployed().then(function (sm) {
      return sm.setApiAddress(apiAddress);
    });
  });
  deployer.deploy(BinkabiNotary, BinkabiToken.address).then(function () {
    return BinkabiNotary.deployed().then(function (bn) {
      return bn.setApiAddress(apiAddress);
    });
  });
  deployer.deploy(OrderPerformanceBond, BinkabiToken.address).then(function () {
    return OrderPerformanceBond.deployed().then(function (opb) {
      return opb.setApiAddress(apiAddress);
    });
  });
};
