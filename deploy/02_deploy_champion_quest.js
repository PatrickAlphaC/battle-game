/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line node/no-missing-import

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../hardhat-helper-config")

const deployMocks = async function (hre) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()
    const ufoToken = await get("MockUFO")
    let vrfCoodinator, linkToken, championQuestToken, keyHash, fee, battleFee
    if (developmentChains.includes(network.name)) {
        vrfCoodinator = (await get("VRFCoordinatorMock")).address
        linkToken = (await get("LinkToken")).address

    } else {
        vrfCoodinator = networkConfig[network.name].vrfCoodinator
        linkToken = networkConfig[network.name].linkToken
    }
    championQuestToken = await get("ChampionQuestToken") // should use config actually.. but whatever
    keyHash = networkConfig[network.name].keyHash
    fee = networkConfig[network.name].fee
    battleFee = networkConfig[network.name].battleFee

    const championQuest = await deploy("ChampionQuest", {
        from: deployer,
        log: true,
        args: [vrfCoodinator, linkToken, championQuestToken.address, keyHash, fee, battleFee],
    })
}
module.exports = deployMocks
deployMocks.tags = ["all", "token"]
