const BinkabiToken = artifacts.require('BinkabiToken');

module.exports = (deployer) => {
  deployer.deploy(BinkabiToken);
};
