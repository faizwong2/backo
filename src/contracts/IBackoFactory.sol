// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IBackoFactory {
  event BackoCreated(string _backoName, string _name, string _symbol, address _creator, address backo, uint256);
  event StoppedSet(bool _stopped);

  function allBackos(uint256) external view returns (address backo);
  function stopped() external view returns (bool);

  function createBacko(string memory _backoName, string memory _name, string memory _symbol, address _creator) external returns (address backo);
}