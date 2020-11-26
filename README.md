# Backo - Decentralized Crowdfunding Membership Platform
Backo is a decentralized crowdfunding membership platform that rewards contributors with custom ERC20 tokens.

Learn more about Backo [here](docs/about.md).

Watch a video demonstration [here](https://youtu.be/c2jcrlDq5Bk).

## Setup
### Build and run project locally
Backo smart contracts are developed using Truffle. The frontend client is using React. The following steps assume you have Node, npm/yarn, truffle and ganache-cli installed.

#### Install all the dependencies of the project
```
yarn install
```

#### Run a local blockchain
```
ganache-cli --blockTime 15
```
Specifying the blockTime is important as Backo smart contracts contain time-dependent logic

#### Compile smart contracts
```
truffle compile
```

#### Run migrations
```
truffle migrate --reset --network development
```

#### Start local frontend client server
```
yarn start
```

### Testing

Tests can be run with the command
```
truffle test
```
It is recommended to adjust the `minBlocksPerRound` constant in the `Backo.sol` contract to a lower number (e.g: 50). Advancing too many blocks may cause the tests to be slow.


## Project Directory
```
backo
├── docs
├── migrations
├── public
├── src
│   ├── build
│   └── contracts
├── test
├── package.json
└── truffle-config.js
```

* docs: Documentations
* migrations: Migration scripts
* public: React public folder
* src: React code
* build: Smart contract build artifacts
* contracts: Smart contract code
* test: Smart contract tests
* `package.json`: Project metadata
* `truffle-config.js`: Truffle configuration

## Checklist
+ Be a Truffle project
  + `truffle compile` should successfully compile contracts
  + `truffle migrate` should successfully migrate contracts to a locally running ganache-cli test blockchain in port 8545
  + `truffle test` should migrate contracts and run your tests
+ Smart Contract code should be commented according to the NatSpec format
+ Create at least 5 tests for each smart contract
  + Write a sentence or two explaining what the tests are covering, and explain why you wrote those tests
+ A development server to serve the frontend interface of the application
  + App recognized current account
  + Sign transactions using MetaMask or uPort
  + Contract state is updated
  + Updated reflected in UI
+ A document called `design_pattern_decisions.md` that explains why you chose to use the design patterns that you did
  + Implement a circuit breaker (emergency stop) pattern
+ A document called `avoiding_common_attacks.md` that explains what measures you took to ensure that your contracts are not susceptible to common attacks
+ Implement/use a library or an EthPM package in your project
+ Record your screen as you demo the application, showing and explaining how you included the required components
+ Deploy your smart contract(s) onto one of the test networks. Include a document called `deployed_addresses.txt` that describes where your contracts live (which testnet and address)
  + Verify source code using Etherscan for the appropriate testnet
+ Stretch requirements
  + Integrate with an additional service (IPFS)