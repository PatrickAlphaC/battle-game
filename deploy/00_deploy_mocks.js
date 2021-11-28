/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line node/no-missing-import

// const hre = require("hardhat")
const { networkConfig } = require("../hardhat-helper-config")
const { network } = require("hardhat")

const deployMocks = async function (hre) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()
  if (chainId === "31337") {
    log("Local network detected! Deploying mocks...")
    const linkToken = await deploy("LinkToken", {
      from: deployer,
      log: true,
      args: [],
    })
    await deploy("VRFCoordinatorMock", {
      from: deployer,
      log: true,
      args: [linkToken.address],
    })
    await deploy("MockUFO", {
      from: deployer,
      log: true,
      args: [networkConfig[network.name].ufoInitialSupply],
    })
    log("Mocks Deployed!")
    log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    )
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contracts!"
    )
    log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  }
}
module.exports = deployMocks
deployMocks.tags = ["all", "mocks"]
