# Avoiding Common Attacks
## Reentrancy attacks
Any operation that involves calling an external contract are subject to a reentrancy attack. This has been mitigated by finishing all internal work (ie. state changes) first, and then calling the external function.

Reference:
* `Backo.addFund` function
* `Backo.removeFund` function
* `Backo.creatorWithdrawFund` function

## Integer Overflow and Underflow
All arithmetic operations in the smart contracts are done using the SafeMath library by OpenZeppelin to avoid integer overflow and underflow.