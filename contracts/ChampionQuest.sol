// contracts/DungeonsAndDragonsCharacter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract ChampionQuest is ERC721URIStorage, VRFConsumerBase, Ownable {
    bytes32 internal s_keyHash;
    uint256 internal s_fee;
    IERC20 public s_championQuestToken;
    uint256 public s_battleFee;

    struct Champion {
        uint256 attack;
        uint256 defense;
        uint256 experience;
        string name;
    }

    struct NewChampionRequest {
        string championName;
        address sender;
    }

    struct BattleRequest {
        uint256 championTokenIdOne;
        uint256 championTokenIdTwo;
    }

    // also known as "callback"
    enum RandomNumberFulfillmentFunction {
        ChampionCreation,
        ChampionBattle
    }

    Champion[] public s_champions;

    mapping(bytes32 => NewChampionRequest) public requestToNewChampionRequest;
    mapping(bytes32 => BattleRequest) public requestToBattleRequest;
    mapping(bytes32 => RandomNumberFulfillmentFunction) public requestToFulfillmentFunction;

    event requestedChampion(bytes32 indexed requestId);
    event requestedBattle(bytes32 indexed requestId);
    event battleDone(uint256 indexed winnerTokenId);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        address _championQuestToken,
        bytes32 _keyhash,
        uint256 _fee,
        uint256 _battleFee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) ERC721("ChampionQuest", "CQ") {
        s_keyHash = _keyhash;
        s_fee = _fee;
        s_championQuestToken = IERC20(_championQuestToken);
        s_battleFee = _battleFee;
    }

    function requestNewRandomChampion(string memory name) public returns (bytes32) {
        require(LINK.balanceOf(address(this)) >= s_fee, "Not enough LINK");
        bytes32 requestId = requestRandomness(s_keyHash, s_fee);
        requestToFulfillmentFunction[requestId] = RandomNumberFulfillmentFunction.ChampionCreation;
        requestToNewChampionRequest[requestId] = NewChampionRequest(name, msg.sender);
        emit requestedChampion(requestId);
        return requestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        if (requestToFulfillmentFunction[requestId] == RandomNumberFulfillmentFunction.ChampionCreation) {
            characterCreationFulfillment(requestId, randomNumber);
        } else {
            battleFulfillment(requestId, randomNumber);
        }
    }

    function getLevel(uint256 tokenId) public view returns (uint256) {
        return sqrt(s_champions[tokenId].experience);
    }

    function getNumberOfCharacters() public view returns (uint256) {
        return s_champions.length;
    }

    function getCharacterStats(uint256 tokenId)
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (s_champions[tokenId].attack, s_champions[tokenId].defense, s_champions[tokenId].experience);
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function characterCreationFulfillment(bytes32 requestId, uint256 randomNumber) internal {
        uint256 newId = s_champions.length;
        uint256 attack = randomNumber % 100;
        uint256 defense = uint256(keccak256(abi.encode(randomNumber, 1))) % 100;
        uint256 experience = 0;
        NewChampionRequest memory champRequest = requestToNewChampionRequest[requestId];
        Champion memory character = Champion(attack, defense, experience, champRequest.championName);
        s_champions.push(character);
        _safeMint(champRequest.sender, newId);
    }

    function requestBattle(uint256 championOneId, uint256 championTwoId) public returns (bytes32 requestId) {
        require(_isApprovedOrOwner(msg.sender, championOneId), "You don't own champion one!");
        require(LINK.balanceOf(address(this)) >= s_fee, "Not enough LINK");
        s_championQuestToken.transferFrom(msg.sender, address(this), s_battleFee);
        requestId = requestRandomness(s_keyHash, s_fee);
        requestToFulfillmentFunction[requestId] = RandomNumberFulfillmentFunction(1);
        requestToBattleRequest[requestId] = BattleRequest(championOneId, championTwoId);
        emit requestedBattle(requestId);
    }

    // Winner gets +2
    // Loser gets -1

    // NFT A has attack of 50 and B has defense of 25
    // A's chance of winning is going to be 50 / 75

    function battleFulfillment(bytes32 requestId, uint256 randomness) internal {
        BattleRequest memory battleRequest = requestToBattleRequest[requestId];
        uint256 attack = s_champions[battleRequest.championTokenIdOne].attack;
        uint256 defense = s_champions[battleRequest.championTokenIdTwo].defense;
        uint256 probabilityTotal = attack + defense;
        uint256 winningNumber = randomness % probabilityTotal;
        console.log(winningNumber);
        console.log(attack);
        console.log(defense);
        if (winningNumber >= attack) {
            s_champions[battleRequest.championTokenIdOne].experience += 2;
            if (s_champions[battleRequest.championTokenIdTwo].experience >= 10) {
                s_champions[battleRequest.championTokenIdTwo].experience -= 1;
            }
            emit battleDone(battleRequest.championTokenIdOne);
        } else {
            s_champions[battleRequest.championTokenIdTwo].experience += 2;
            if (s_champions[battleRequest.championTokenIdOne].experience >= 10) {
                s_champions[battleRequest.championTokenIdOne].experience -= 1;
            }
            emit battleDone(battleRequest.championTokenIdTwo);
        }
    }

    function useExperienceOnAttack(uint256 tokenId, uint256 amount) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "You don't own this character!");
        require(s_champions[tokenId].experience >= amount, "Not enough experience");
        s_champions[tokenId].attack += amount;
        s_champions[tokenId].experience -= amount;
    }

    function useExperienceOnDefense(uint256 tokenId, uint256 amount) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "You don't own this character!");
        require(s_champions[tokenId].experience >= amount, "Not enough experience");
        s_champions[tokenId].defense += amount;
        s_champions[tokenId].experience -= amount;
    }
}
