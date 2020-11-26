// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "./BackoERC20.sol";
import "./IBackoFactory.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Backo is BackoERC20 {

  using SafeMath for uint256;

  struct LevelInfo {
    uint256 amountPerRound; // amount in ETH per round
    uint256 rewardPerRound; // amount in reward token per round
    uint256 numberOfMembers;
  }

  struct MemberInfo {
    uint256 levelId;
    uint256 roundsRemaining;
    uint256 lastClaimRound;
  }

  struct IpfsDataHashes {
    string profileImageHash;
    string backoDetailsHash;
  }

  /// @notice Returns the level information of the given id
  LevelInfo[] public levelInfos;
  /// @notice Returns the member information of the given address
  mapping (address => MemberInfo) public memberInfos;

  /// @notice Returns the name of this backo
  string public backoName;

  /// @notice Returns the block of which the creator withdrew fund last
  uint256 public lastWithdrawBlock;
  /// @notice Returns the minimum amount of blocks per withdraw by the creator
  /// @dev 172800 is the estimated number of blocks of 30 days with the assumption that one block interval is 15 seconds
  uint256 constant public minBlocksPerRound = 172800;
  /// @notice Returns the number of rounds done by the backo. One round is done when the creator withdraws funds
  uint256 public roundsDone;

  /// @notice Returns the creator address
  address payable public creator;
  /// @notice Returns the factory contract address
  address public factory;

  /// @notice Returns the hash addresses of the profile image and backo details stored on IPFS
  IpfsDataHashes public ipfsDataHashes;

  /// @notice Event of which a member adds funds to the backo to subscribe
  event MemberAddedFund(address _member, uint256 _rounds, uint256 _levelId);
  /// @notice Event of which a member removes funds to the backo to unsubscribe
  event MemberRemovedFund(address _member);
  /// @notice Event of which the creator collects funds and ends the round
  event CreatorWithdrewFund(address _creator);
  /// @notice Event of which the creator updates their address
  event CreatorChanged(address _oldCreator, address _newCreator);

  modifier onlyCreator() {
    require(msg.sender == creator, "onlyCreator: caller is not the creator");
    _;
  }

  modifier stopInEmergency() {
    bool stopped = IBackoFactory(factory).stopped();
    require(!stopped, 'stopInEmergency: emergency stop');
    _;
  }

  constructor() public {
    factory = msg.sender;
  }

  /// @notice Initialize the state of this backo contract
  function initialize(
    string memory _backoName,
    string memory _name,
    string memory _symbol,
    address payable _creator,
    uint256 _numberOfLevels,
    uint256[] memory _levelAmounts,
    uint256[] memory _levelRewards,
    IpfsDataHashes memory _ipfsDataHashes
  ) external {
    require(msg.sender == factory, 'initialize: forbidden');
    require(_levelAmounts.length == _numberOfLevels, "initialize: level amounts and number of levels do not match");
    require(_levelRewards.length == _numberOfLevels, "initialize: level rewards and number of levels do not match");

    backoName = _backoName;
    name = _name;
    symbol = _symbol;
    creator = _creator;

    for (uint256 i = 0; i < _numberOfLevels; i++) {
      levelInfos.push(LevelInfo(_levelAmounts[i], _levelRewards[i], 0));
    }

    lastWithdrawBlock = block.number;
    ipfsDataHashes = _ipfsDataHashes;
  }

  function _claimReward() private {
    MemberInfo storage memberInfo = memberInfos[msg.sender];
    LevelInfo storage levelInfo = levelInfos[memberInfo.levelId];

    if (memberInfo.lastClaimRound == roundsDone) {
      return;
    }
    uint256 roundsSinceLastClaim = roundsDone.sub(memberInfo.lastClaimRound);
    uint256 roundsToClaim;
    if (roundsSinceLastClaim < memberInfo.roundsRemaining) {
      roundsToClaim = roundsSinceLastClaim;
      memberInfo.roundsRemaining = memberInfo.roundsRemaining.sub(roundsToClaim);
    } else if (roundsSinceLastClaim == memberInfo.roundsRemaining) {
      roundsToClaim = roundsSinceLastClaim;
      memberInfo.roundsRemaining = 0;
      levelInfo.numberOfMembers = levelInfo.numberOfMembers.sub(1);
    } else if (roundsSinceLastClaim > memberInfo.roundsRemaining) {
      roundsToClaim = memberInfo.roundsRemaining;
      memberInfo.roundsRemaining = 0;
      levelInfo.numberOfMembers = levelInfo.numberOfMembers.sub(1);
    }
    memberInfo.lastClaimRound = roundsDone;
    _mint(msg.sender, roundsToClaim.mul(levelInfo.rewardPerRound));
  }

  /// @notice Claim your pending reward
  function claimReward() public {
    _claimReward();
  }

  /// @notice Add funds according to the membership level `_levelId` for `_rounds` rounds
  function addFund(uint256 _rounds, uint256 _levelId)
    public
    payable
    stopInEmergency
  {
    require(msg.sender != creator);
    uint256 price = _rounds.mul(levelInfos[_levelId].amountPerRound);
    require(msg.value >= price, 'addFund: Not enough value');
    LevelInfo storage levelInfo = levelInfos[_levelId];
    MemberInfo storage memberInfo = memberInfos[msg.sender];
    if (memberInfo.roundsRemaining > 0) {
      require(memberInfo.levelId == _levelId, 'addFund: wrong level');
    } else {
      memberInfo.levelId = _levelId;
      memberInfo.lastClaimRound = roundsDone;
      levelInfo.numberOfMembers = levelInfo.numberOfMembers.add(1);
    }
    memberInfo.roundsRemaining = memberInfo.roundsRemaining.add(_rounds);
    _claimReward();
    uint256 amountToRefund = msg.value.sub(price);
    (bool success, ) = msg.sender.call.value(amountToRefund)("");
    require(success);
    emit MemberAddedFund(msg.sender, _rounds, _levelId);
  }

  /// @notice Remove funds and unsubscribe from this backo
  function removeFund() public {
    MemberInfo storage memberInfo = memberInfos[msg.sender];
    LevelInfo storage levelInfo = levelInfos[memberInfo.levelId];
    _claimReward();
    if (memberInfo.roundsRemaining > 0) {
      uint256 amountToReturn = memberInfo.roundsRemaining.mul(levelInfo.amountPerRound);
      memberInfo.roundsRemaining = 0;
      levelInfo.numberOfMembers = levelInfo.numberOfMembers.sub(1);
      (bool success, ) = msg.sender.call.value(amountToReturn)("");
      require(success);
      emit MemberRemovedFund(msg.sender);
    }
  }

  /// @notice Collect funds from your members and end the round
  function creatorWithdrawFund() public stopInEmergency onlyCreator {
    require(block.number >= lastWithdrawBlock.add(minBlocksPerRound), 'creatorWithdrawFund: round not done');
    uint amountToWithdraw = 0;
    for (uint256 i = 0; i < levelInfos.length; i++) {
      LevelInfo storage levelInfo = levelInfos[i];
      uint256 currentAmountToWithdraw = levelInfo.numberOfMembers.mul(levelInfo.amountPerRound);
      amountToWithdraw = amountToWithdraw.add(currentAmountToWithdraw);
    }
    roundsDone = roundsDone.add(1);
    lastWithdrawBlock = block.number;
    (bool success, ) = creator.call.value(amountToWithdraw)("");
    require(success);
    emit CreatorWithdrewFund(creator);
  }

  /// @notice Set the creator address to be `_newCreator`
  function setCreatorAddress(address payable _newCreator) public onlyCreator {
    require(_newCreator != address(0), "setCreatorAddress: new creator is the zero address");
    address oldCreator = creator;
    creator = _newCreator;
    emit CreatorChanged(oldCreator, _newCreator);
  }

  /// @notice Set the profile image hash address to be `_profileImageHash`
  function setProfileImageHash(string memory _profileImageHash) public onlyCreator {
    ipfsDataHashes.profileImageHash = _profileImageHash;
  }

  /// @notice Set the profile backo details address to be `_backoDetailsHash`
  function setBackoDetailsHash(string memory _backoDetailsHash) public onlyCreator {
    ipfsDataHashes.backoDetailsHash = _backoDetailsHash;
  }

  /// @notice Returns true if creator can withdraw funds, false otherwise
  function creatorCanWithdrawFund() external view returns (bool) {
    bool stopped = IBackoFactory(factory).stopped();
    return block.number >= lastWithdrawBlock.add(minBlocksPerRound) && !stopped;
  }

  /// @notice Returns true if `_address` is a member, false otherwise
  function isMember(address _address) external view returns (bool) {
    MemberInfo storage memberInfo = memberInfos[_address];
    return memberInfo.roundsRemaining > 0;
  }

  /// @notice Returns the number of members subscribed to this backo
  function getNumberOfMembers() external view returns (uint256) {
    uint256 numberOfMembers = 0;
    for (uint256 i = 0; i < levelInfos.length; i++) {
      LevelInfo storage levelInfo = levelInfos[i];
      numberOfMembers = numberOfMembers.add(levelInfo.numberOfMembers);
    }
    return numberOfMembers;
  }

  /// @notice Returns the wei per round to this backo for the current round
  function getWeiPerRound() external view returns (uint256) {
    uint256 weiAmount = 0;
    for (uint256 i = 0; i < levelInfos.length; i++) {
      LevelInfo storage levelInfo = levelInfos[i];
      uint256 currentWeiAmount = levelInfo.numberOfMembers.mul(levelInfo.amountPerRound);
      weiAmount = weiAmount.add(currentWeiAmount);
    }
    return weiAmount;
  }

  /// @notice Returns the number of membership levels for this backo
  function getNumberOfLevels() external view returns (uint256) {
    return levelInfos.length;
  }

  /// @notice Returns the block number of which the creator can end the round and collect funds
  function getNextWithdrawBlock() external view returns (uint256) {
    return lastWithdrawBlock.add(minBlocksPerRound);
  }

  /// @dev Returns relevant information about this backo to show in frontend
  function getBackoInfo() external view returns (
    string memory,
    string memory,
    string memory,
    address,
    uint256,
    uint256,
    uint256,
    uint256,
    uint256,
    uint256,
    uint256,
    IpfsDataHashes memory
  ) {

    uint nextWithdrawBlock = lastWithdrawBlock.add(minBlocksPerRound);

    uint256 weiPerRound = 0;
    for (uint256 i = 0; i < levelInfos.length; i++) {
      LevelInfo storage levelInfo = levelInfos[i];
      uint256 currentWeiAmount = levelInfo.numberOfMembers.mul(levelInfo.amountPerRound);
      weiPerRound = weiPerRound.add(currentWeiAmount);
    }

    uint256 numberOfLevels = levelInfos.length;

    uint256 numberOfMembers = 0;
    for (uint256 i = 0; i < levelInfos.length; i++) {
      LevelInfo storage levelInfo = levelInfos[i];
      numberOfMembers = numberOfMembers.add(levelInfo.numberOfMembers);
    }

    return (
      backoName,
      name,
      symbol,
      creator,
      lastWithdrawBlock,
      minBlocksPerRound,
      roundsDone,
      nextWithdrawBlock,
      weiPerRound,
      numberOfLevels,
      numberOfMembers,
      ipfsDataHashes
    );
  }

  /// @dev Returns relevant information about a member to show in frontend
  function getMemberInfo(address _member) external view returns (
    MemberInfo memory,
    uint256,
    uint256,
    uint256
  ) {

    MemberInfo storage memberInfo = memberInfos[_member];
    LevelInfo storage levelInfo = levelInfos[memberInfo.levelId];

    uint256 depositBalance;
    uint256 pendingReward;
    if (memberInfo.lastClaimRound == roundsDone) {
      depositBalance = memberInfo.roundsRemaining.mul(levelInfo.amountPerRound);
      pendingReward = 0;
    } else {
      uint256 roundsSinceLastClaim = roundsDone.sub(memberInfo.lastClaimRound);
      uint256 roundsToClaim;
      if (roundsSinceLastClaim < memberInfo.roundsRemaining) {
        roundsToClaim = roundsSinceLastClaim;
      } else if (roundsSinceLastClaim == memberInfo.roundsRemaining) {
        roundsToClaim = roundsSinceLastClaim;
      } else if (roundsSinceLastClaim > memberInfo.roundsRemaining) {
        roundsToClaim = memberInfo.roundsRemaining;
      }
      pendingReward = roundsToClaim.mul(levelInfo.rewardPerRound);
      depositBalance = memberInfo.roundsRemaining.sub(roundsToClaim).mul(levelInfo.amountPerRound);
    }

    uint256 tokenBalance = balanceOf(_member);

    return (
      memberInfo,
      depositBalance,
      pendingReward,
      tokenBalance
    );
  }


}