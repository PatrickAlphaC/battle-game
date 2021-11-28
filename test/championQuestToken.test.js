const { networkConfig, developmentChains } = require("../hardhat-helper-config")
const { network, deployments, ethers } = require("hardhat")
const { expect } = require('chai')

describe('championQuestToken', async () => {
    let runTest = false
    let ufoSwapAmount = ethers.utils.parseEther('1')
    let championQuestToken, mockUFO, admin
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
            mockUFODeployment = await deployments.get("MockUFO")
            mockUFO = await ethers.getContractAt("MockUFO", mockUFODeployment.address, admin)

        }
    })
    it("swapUFOForCQT should be able to swap UFO token for CQT", async () => {
        if (runTest) {
            expect(await championQuestToken.balanceOf(admin.address)).to.eq(0)
            expect(await mockUFO.balanceOf(admin.address)).to.eq(networkConfig[network.name].ufoInitialSupply)
            await mockUFO.approve(championQuestToken.address, ufoSwapAmount)
            await championQuestToken.swapUFOForCQT(ufoSwapAmount)
            expect(await championQuestToken.balanceOf(admin.address)).to.eq(ufoSwapAmount)
        }
    })
    it("swapUFOForCQT should be able to swap CQT token for UFO", async () => {
        if (runTest) {
            await mockUFO.approve(championQuestToken.address, ufoSwapAmount)
            await championQuestToken.swapUFOForCQT(ufoSwapAmount)
            expect(await championQuestToken.totalSupply()).to.eq(ufoSwapAmount)
            await championQuestToken.swapCQTForUFO(ufoSwapAmount)
            expect(await championQuestToken.balanceOf(admin.address)).to.eq(0)
            expect(await championQuestToken.totalSupply()).to.eq(0)
        }
    })
})
