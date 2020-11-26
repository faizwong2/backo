# Design Pattern Decisions
## Contract Factory
Backo uses a factory contract `BackoFactory.sol` to create and deploy crowdfunding membership contracts based on the implementation contract `Backo.sol` that the creators themselves own and manage.

## Restricting access
Some functions in the `Backo.sol` smart contract has been access restricted to the  creator. Only the creator can call these functions.

Reference:
* `Backo.creatorWithdrawFund` function
* `Backo.setCreatorAddress` function

## Circuit Breaker
A circuit breaker has been implemented that allow certain contract functionality to be stopped. This would be desirable in situations in which a bug has been detected in a live contract.

Reference:
* `Backo.creatorWithdrawFund` function
* `Backo.addFund` function
* `BackoFactory.setStopped` function
* `Backo.stopInEmergency` modifier