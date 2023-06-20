const barterMarket = artifacts.require("barterMarket");

module.exports = function(deployer) {
  deployer.deploy(barterMarket);
};
