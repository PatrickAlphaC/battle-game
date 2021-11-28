const { networkConfig, developmentChains } = require("../hardhat-helper-config")
const { network, deployments, ethers, run } = require("hardhat")
const { expect } = require('chai')

describe('championQuest', async () => {
    let runTest = false
    const ufoSwapAmount = '1000000000000000000'
    const randomNumber = '777'
    const randomNumber2 = '222'
    const championName = "champ"
    const championName2 = "champ2"
    let championQuest, championQuestToken, vrfCoordinator, UFO, admin, linkToken
    beforeEach(async () => {
        if (developmentChains.includes(network.name)) {
            runTest = true
        }
        accounts = await ethers.getSigners()
        admin = accounts[0]
        if (runTest) {
            await deployments.fixture(["all"])
            let championQuestTokenDeployment = await deployments.get("ChampionQuestToken")
            championQuestToken = await ethers.getContractAt("ChampionQuestToken", championQuestTokenDeployment.address, admin)
            let championQuestDeployment = await deployments.get("ChampionQuest")
            championQuest = await ethers.getContractAt("ChampionQuest", championQuestDeployment.address, admin)
            linkToken = await deployments.get("LinkToken")
            let vrfCoordinatorDeployment = await deployments.get("VRFCoordinatorMock")
            vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", vrfCoordinatorDeployment.address, admin)
            let ufoDeployment = await deployments.get("MockUFO")
            ufo = await ethers.getContractAt("MockUFO", ufoDeployment.address, admin)

        }
    })
    it("should be able to request a new random champion", async () => {
        if (runTest) {
            await expect(championQuest.requestNewRandomChampion(championName)).to.be.revertedWith("Not enough LINK")
            await run("fund-link", { contract: championQuest.address, linkaddress: linkToken.address })
            let champRequestTransactionResponse = await championQuest.requestNewRandomChampion(championName)
            let champRequestTransactionReceipt = await champRequestTransactionResponse.wait()
            let requestId = champRequestTransactionReceipt.events[3].topics[1]
            vrfCoordinator.callBackWithRandomness(requestId, randomNumber, championQuest.address)
            expect((await championQuest.s_champions(0)).name).to.equal(championName)
            expect((await championQuest.s_champions(0)).attack).to.equal(77)
            expect((await championQuest.s_champions(0)).defense).to.equal(86)
            expect((await championQuest.s_champions(0)).experience).to.equal(0)
        }
    })
    it("should be able to battle with each other", async () => {
        if (runTest) {
            await run("fund-link", { contract: championQuest.address, linkaddress: linkToken.address })
            let champRequestTransactionResponse = await championQuest.requestNewRandomChampion(championName)
            let champRequestTransactionReceipt = await champRequestTransactionResponse.wait()
            let requestId = champRequestTransactionReceipt.events[3].topics[1]
            vrfCoordinator.callBackWithRandomness(requestId, randomNumber, championQuest.address)

            let champRequestTransactionResponse2 = await championQuest.requestNewRandomChampion(championName2)
            let champRequestTransactionReceipt2 = await champRequestTransactionResponse2.wait()
            let requestId2 = champRequestTransactionReceipt2.events[3].topics[1]
            vrfCoordinator.callBackWithRandomness(requestId2, randomNumber2, championQuest.address)
            expect((await championQuest.s_champions(1)).name).to.equal(championName2)

            // need to mint CQT to fight
            await ufo.approve(championQuestToken.address, ufoSwapAmount)
            await championQuestToken.swapUFOForCQT(ufoSwapAmount)
            await championQuestToken.approve(championQuest.address, ufoSwapAmount)


            // time to fight
            let transactionBattleResponse = await championQuest.requestBattle(0, 1)
            let transactionBattleReceipt = await transactionBattleResponse.wait()
            let battleRequestId = transactionBattleReceipt.events[5].topics[1]
            await vrfCoordinator.callBackWithRandomness(battleRequestId, randomNumber, championQuest.address)
            // console.log((await championQuest.s_champions(0)).experience.toString())
            // console.log((await championQuest.s_champions(1)).experience.toString())
            // console.log((await championQuest.requestToFulfillmentFunction(battleRequestId)).toString())
            expect((await championQuest.s_champions(0)).experience).to.eq(2)
        }
    })
})
