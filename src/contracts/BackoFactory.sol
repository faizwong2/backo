// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Backo.sol";
import "./IBacko.sol";

contract BackoFactory is Ownable {

  /// Returns the address of the backo contract of the given id
  address[] public allBackos;
  /// Returns true if an emergency stop is ongoing, false otherwise
  bool public stopped = false;

  /// @notice Event of which a backo has been created
  event BackoCreated(string _backoName, string _name, string _symbol, address _creator, address backo, uint256);
  /// @notice Event of which the admin has toggled the emergency stop
  event StoppedSet(bool _stopped);

  /// @notice Creates a backo contract, deploys it and returns the address of the backo
  function createBacko(
    string memory _backoName,
    string memory _name,
    string memory _symbol,
    uint256 _numberOfLevels,
    uint256[] memory _levelAmounts,
    uint256[] memory _levelRewards,
    IBacko.IpfsDataHashes memory _ipfsDataHashes
  ) external returns (address backo) {

    require(_levelAmounts.length == _numberOfLevels, "createBacko: level amounts and number of levels do not match");
    require(_levelRewards.length == _numberOfLevels, "createBacko: level rewards and number of levels do not match");

    bytes memory bytecode = type(Backo).creationCode;
    bytes32 salt = keccak256(abi.encodePacked(allBackos.length));
    assembly {
      backo := create2(0, add(bytecode, 32), mload(bytecode), salt)
    }
    IBacko(backo).initialize(
      _backoName,
      _name,
      _symbol,
      msg.sender,
      _numberOfLevels,
      _levelAmounts,
      _levelRewards,
      _ipfsDataHashes
    );
    allBackos.push(backo);
    emit BackoCreated(_backoName, _name, _symbol, msg.sender, backo, allBackos.length);
  }

  /// @notice Triggers emergency stop if `_stopped` is true, undo emergency stop otherwise
  function setStopped(bool _stopped) external onlyOwner {
    stopped = _stopped;
    emit StoppedSet(_stopped);
  }

}