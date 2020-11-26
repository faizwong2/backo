// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

interface IBacko {
  event MemberAddedFund(address _member, uint256 _rounds, uint256 _levelId);
  event MemberRemovedFund(address _member);
  event CreatorWithdrewFund(address _creator);
  event CreatorChanged(address _oldCreator, address _newCreator);

  function name() external view returns (string memory);
  function symbol() external view returns (string memory);
  function decimals() external pure returns (uint8);

  function totalSupply() external view returns (uint256);
  function balanceOf(address account) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function levelInfos(uint) external view returns (uint256, uint256, uint256);
  function memberInfos(address) external view returns (uint256, uint256, uint256);
  function backoName() external view returns (string memory);
  function lastWithdrawBlock() external view returns (uint256);
  function minBlocksPerRound() external view returns (uint256);
  function roundsDone() external view returns (uint256);
  function creator() external view returns (address);
  function factory() external view returns (address);
  function ipfsDataHashes() external view returns (string memory, string memory);

  function claimReward() external;
  function addFund(uint256 _rounds, uint256 _levelId) external payable;
  function removeFund() external;
  function creatorWithdrawFund() external;
  function setCreatorAddress(address _newCreator) external;
  function setProfileImageHash(string memory _profileImageHash) external;
  function setBackoDetailsHash(string memory _backoDetailsHash) external;

  function creatorCanWithdrawFund() external view returns (bool);
  function isMember(address _address) external view returns (bool);
  function getNumberOfMembers() external view returns (uint256);
  function getWeiPerRound() external view returns (uint256);
  function getNumberOfLevels() external view returns (uint256);
  function getNextWithdrawBlock() external view returns (uint256);
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
  );
  function getMemberInfo(address _member) external view returns (
    MemberInfo memory,
    uint256,
    uint256,
    uint256
  );

  struct MemberInfo {
    uint256 levelId;
    uint256 roundsRemaining;
    uint256 lastClaimRound;
  }

  struct IpfsDataHashes {
    string profileImageHash;
    string backoDetailsHash;
  }

  function initialize(
    string memory _backoName,
    string memory _name,
    string memory _symbol,
    address _creator,
    uint256 _numberOfLevels,
    uint256[] memory _levelAmounts,
    uint256[] memory _levelRewards,
    IpfsDataHashes memory _ipfsDataHashes
  ) external;
}