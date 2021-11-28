const networkConfig = {
    hardhat: {
        id: 31337,
        linkToken: "0xa36085F69e2889c224210F603D836748e7dC0088",
        oracle: "0xc57b33452b4f7bb189bb5afae9cc4aba1f7a4fd8",
        jobId: "d5270d1c311941d0b08bead21fea7747",
        fundAmount: "1000000000000000000",
        keyHash: '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
        fee: '100000000000000000',
        battleFee: '100000000000000000',
        ufoInitialSupply: '5000000000000000000000'
    }
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains
}
