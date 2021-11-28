/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line node/no-missing-import

const hre = require("hardhat")

const deployMocks = async function (hre) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()
    const ufoToken = await get("MockUFO")
    const championQuestToken = await deploy("ChampionQuestToken", {
        from: deployer,
        log: true,
        args: [ufoToken.address],
    })
}
module.exports = deployMocks
deployMocks.tags = ["all", "token"]
