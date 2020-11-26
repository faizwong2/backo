const { expectRevert, time } = require('@openzeppelin/test-helpers');
const Backo = artifacts.require("./Backo.sol");
const BackoFactory = artifacts.require("./BackoFactory.sol");
const BN = require('bn.js');

/**
  * These tests check the contract states after interaction of multiple actors
  * in a typical scenario involving members subscribing and unsubscribing,
  * creator collecting funds and ending a round as well as edge cases such
  * as creator trying to collect funds prematurely before a round has ended
  */
contract('Backo', (accounts) => {

  let backo;
  let backoFactory;

  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];
  const creator = accounts[4];

  const toWei = (n) => {
    // n must be string
    return web3.utils.toWei(n, 'Ether');
  };

  before(async () => {
    backoFactory = await BackoFactory.new({ from: owner });
    const backoCreation = await backoFactory.createBacko(
      'Test Backo',
      'TestToken',
      'TEST',
      2,
      [toWei('0.1'), toWei('1')],
      [toWei('1'), toWei('12')],
      {
        profileImageHash: 'abc',
        backoDetailsHash: 'xyz'
      },
      { from: creator }
    );
    backo = await Backo.at(backoCreation.logs[0].args.backo);
  });

  it('should have the correct initial state', async () => {
    const backoInfo = await backo.getBackoInfo();

    const backoName = backoInfo[0];
    const tokenName = backoInfo[1];
    const tokenSymbol = backoInfo[2];
    const creatorAddress = backoInfo[3];
    const lastWithdrawBlock = backoInfo[4];
    const minBlocksPerRound = backoInfo[5];
    const roundsDone = backoInfo[6];
    const nextWithdrawBlock = backoInfo[7];
    const weiPerRound = backoInfo[8];
    const numberOfLevels = backoInfo[9];
    const numberOfMembers = backoInfo[10];
    const ipfsDataHashes = backoInfo[11];

    const {
      profileImageHash,
      backoDetailsHash
    } = ipfsDataHashes;

    assert.equal(backoName, 'Test Backo');
    assert.equal(tokenName, 'TestToken');
    assert.equal(tokenSymbol, 'TEST');
    assert.equal(roundsDone, '0');
    assert.equal(
      nextWithdrawBlock.toString(),
      lastWithdrawBlock.add(minBlocksPerRound).toString()
    );
    assert.equal(weiPerRound, '0');
    assert.equal(numberOfLevels, '2');
    assert.equal(numberOfMembers, '0');
    assert.equal(profileImageHash, 'abc');
    assert.equal(backoDetailsHash, 'xyz');
  });

  it('should let members add funds to subscribe', async () => {

    const backoBalanceBefore = await web3.eth.getBalance(backo.address);

    assert.equal(backoBalanceBefore, toWei('0'));

    // Alice tries to add fund with not enough value
    await expectRevert(
      backo.addFund(2, 1, { from: alice, value: toWei('0.1') }),
      'addFund: Not enough value'
    );

    await backo.addFund(5, 1, { from: alice, value: toWei('5') });
    await backo.addFund(3, 1, { from: bob, value: toWei('6') });
    await backo.addFund(2, 0, { from: carol, value: toWei('1') });

    // Carol tries to add more fund with wrong level id
    await expectRevert(
      backo.addFund(2, 1, { from: carol, value: toWei('2') }),
      'addFund: wrong level'
    );

    // Check backo

    const backoBalanceAfter = await web3.eth.getBalance(backo.address);

    assert.equal(backoBalanceAfter, toWei('8.2'));

    const backoInfo = await backo.getBackoInfo();

    const weiPerRound = backoInfo[8];
    const numberOfMembers = backoInfo[10];

    assert.equal(weiPerRound, toWei('2.1'));
    assert.equal(numberOfMembers, '3');

    // Check Alice

    const aliceGetMemberInfo = await backo.getMemberInfo(alice, { from: owner });

    const aliceMemberInfo = aliceGetMemberInfo[0];
    const aliceDepositBalance = aliceGetMemberInfo[1];
    const alicePendingReward = aliceGetMemberInfo[2];
    const aliceTokenBalance = aliceGetMemberInfo[3];
    const aliceLevelId = aliceMemberInfo.levelId;
    const aliceRoundsRemaining = aliceMemberInfo.roundsRemaining;
    const aliceLastClaimRound = aliceMemberInfo.lastClaimRound;

    assert.equal(aliceDepositBalance, toWei('5'));
    assert.equal(alicePendingReward, toWei('0'));
    assert.equal(aliceTokenBalance, toWei('0'));
    assert.equal(aliceLevelId, '1');
    assert.equal(aliceRoundsRemaining, '5');
    assert.equal(aliceLastClaimRound, '0');

    // Check Bob

    const bobGetMemberInfo = await backo.getMemberInfo(bob, { from: owner });

    const bobMemberInfo = bobGetMemberInfo[0];
    const bobDepositBalance = bobGetMemberInfo[1];
    const bobPendingReward = bobGetMemberInfo[2];
    const bobTokenBalance = bobGetMemberInfo[3];
    const bobLevelId = bobMemberInfo.levelId;
    const bobRoundsRemaining = bobMemberInfo.roundsRemaining;
    const bobLastClaimRound = bobMemberInfo.lastClaimRound;

    assert.equal(bobDepositBalance, toWei('3'));
    assert.equal(bobPendingReward, toWei('0'));
    assert.equal(bobTokenBalance, toWei('0'));
    assert.equal(bobLevelId, '1');
    assert.equal(bobRoundsRemaining, '3');
    assert.equal(bobLastClaimRound, '0');

    // Check Carol

    const carolGetMemberInfo = await backo.getMemberInfo(carol, { from: owner });

    const carolMemberInfo = carolGetMemberInfo[0];
    const carolDepositBalance = carolGetMemberInfo[1];
    const carolPendingReward = carolGetMemberInfo[2];
    const carolTokenBalance = carolGetMemberInfo[3];
    const carolLevelId = carolMemberInfo.levelId;
    const carolRoundsRemaining = carolMemberInfo.roundsRemaining;
    const carolLastClaimRound = carolMemberInfo.lastClaimRound;

    assert.equal(carolDepositBalance, toWei('0.2'));
    assert.equal(carolPendingReward, toWei('0'));
    assert.equal(carolTokenBalance, toWei('0'));
    assert.equal(carolLevelId, '0');
    assert.equal(carolRoundsRemaining, '2');
    assert.equal(carolLastClaimRound, '0');

    // Check levels

    const levelInfo0 = await backo.levelInfos('0', { from: owner });
    const levelInfo1 = await backo.levelInfos('1', { from: owner });

    assert.equal(levelInfo0.numberOfMembers, '1');
    assert.equal(levelInfo1.numberOfMembers, '2');
  });

  it('should allow creator to collect fund when time is right', async () => {
    
    // Creator tries to withdraw fund prematurely

    await expectRevert(
      backo.creatorWithdrawFund({ from: creator }),
      'creatorWithdrawFund: round not done'
    );

    const creatorCanWithdrawFundBefore = await backo.creatorCanWithdrawFund({ from: owner });
    assert.equal(creatorCanWithdrawFundBefore, false);

    const backoInfoBeforeCreatorWithdraw = await backo.getBackoInfo();
    const lastWithdrawBlockBeforeCreatorWithdraw = backoInfoBeforeCreatorWithdraw[4];
    const minBlocksPerRound = backoInfoBeforeCreatorWithdraw[5];

    // Creator tries to withdraw fund after minimum time

    const allowedWithdrawBlock = lastWithdrawBlockBeforeCreatorWithdraw.add(minBlocksPerRound);
    await time.advanceBlockTo(allowedWithdrawBlock.toString());

    const creatorCanWithdrawFundAfter = await backo.creatorCanWithdrawFund({ from: owner });
    assert.equal(creatorCanWithdrawFundAfter, true);

    await backo.creatorWithdrawFund({ from: creator });

    // Check backo state after creator withdraw funds

    const backoBalanceAfterCreatorWithdraw = await web3.eth.getBalance(backo.address);
    assert.equal(backoBalanceAfterCreatorWithdraw, toWei('6.1'));

    const backoInfoAfterCreatorWithdraw = await backo.getBackoInfo();
    const lastWithdrawBlockAfterCreatorWithdraw = backoInfoAfterCreatorWithdraw[4];
    const roundsDoneAfterCreatorWithdraw = backoInfoAfterCreatorWithdraw[6];

    assert.equal(
      lastWithdrawBlockAfterCreatorWithdraw.toString(),
      allowedWithdrawBlock.add(new BN('1')).toString()
    );
    assert.equal(roundsDoneAfterCreatorWithdraw, '1');

  });

  it('should reward the members tokens once round is done', async () => {

    // Check member infos before claim reward

    const aliceGetMemberInfoBeforeClaim = await backo.getMemberInfo(alice, { from: owner });

    const aliceMemberInfoBeforeClaim = aliceGetMemberInfoBeforeClaim[0];
    const aliceDepositBalanceBeforeClaim = aliceGetMemberInfoBeforeClaim[1];
    const alicePendingRewardBeforeClaim = aliceGetMemberInfoBeforeClaim[2];
    const aliceTokenBalanceBeforeClaim = aliceGetMemberInfoBeforeClaim[3];
    const aliceLevelIdBeforeClaim = aliceMemberInfoBeforeClaim.levelId;
    const aliceRoundsRemainingBeforeClaim = aliceMemberInfoBeforeClaim.roundsRemaining;
    const aliceLastClaimRoundBeforeClaim = aliceMemberInfoBeforeClaim.lastClaimRound;

    assert.equal(aliceDepositBalanceBeforeClaim.toString(), toWei('4'));
    assert.equal(alicePendingRewardBeforeClaim.toString(), toWei('12'));
    assert.equal(aliceTokenBalanceBeforeClaim, toWei('0'));
    assert.equal(aliceLevelIdBeforeClaim, '1');
    assert.equal(aliceRoundsRemainingBeforeClaim, '5');
    assert.equal(aliceLastClaimRoundBeforeClaim, '0');

    const bobGetMemberInfoBeforeClaim = await backo.getMemberInfo(bob, { from: owner });

    const bobMemberInfoBeforeClaim = bobGetMemberInfoBeforeClaim[0];
    const bobDepositBalanceBeforeClaim = bobGetMemberInfoBeforeClaim[1];
    const bobPendingRewardBeforeClaim = bobGetMemberInfoBeforeClaim[2];
    const bobTokenBalanceBeforeClaim = bobGetMemberInfoBeforeClaim[3];
    const bobLevelIdBeforeClaim = bobMemberInfoBeforeClaim.levelId;
    const bobRoundsRemainingBeforeClaim = bobMemberInfoBeforeClaim.roundsRemaining;
    const bobLastClaimRoundBeforeClaim = bobMemberInfoBeforeClaim.lastClaimRound;

    assert.equal(bobDepositBalanceBeforeClaim.toString(), toWei('2'));
    assert.equal(bobPendingRewardBeforeClaim.toString(), toWei('12'));
    assert.equal(bobTokenBalanceBeforeClaim, toWei('0'));
    assert.equal(bobLevelIdBeforeClaim, '1');
    assert.equal(bobRoundsRemainingBeforeClaim, '3');
    assert.equal(bobLastClaimRoundBeforeClaim, '0');

    const carolGetMemberInfoBeforeClaim = await backo.getMemberInfo(carol, { from: owner });

    const carolMemberInfoBeforeClaim = carolGetMemberInfoBeforeClaim[0];
    const carolDepositBalanceBeforeClaim = carolGetMemberInfoBeforeClaim[1];
    const carolPendingRewardBeforeClaim = carolGetMemberInfoBeforeClaim[2];
    const carolTokenBalanceBeforeClaim = carolGetMemberInfoBeforeClaim[3];
    const carolLevelIdBeforeClaim = carolMemberInfoBeforeClaim.levelId;
    const carolRoundsRemainingBeforeClaim = carolMemberInfoBeforeClaim.roundsRemaining;
    const carolLastClaimRoundBeforeClaim = carolMemberInfoBeforeClaim.lastClaimRound;

    assert.equal(carolDepositBalanceBeforeClaim.toString(), toWei('0.1'));
    assert.equal(carolPendingRewardBeforeClaim.toString(), toWei('1'));
    assert.equal(carolTokenBalanceBeforeClaim, toWei('0'));
    assert.equal(carolLevelIdBeforeClaim, '0');
    assert.equal(carolRoundsRemainingBeforeClaim, '2');
    assert.equal(carolLastClaimRoundBeforeClaim, '0');

    // Check member infos after claim reward

    await backo.claimReward({ from: alice });

    const aliceGetMemberInfoAfterClaim = await backo.getMemberInfo(alice, { from: owner });

    const aliceMemberInfoAfterClaim = aliceGetMemberInfoAfterClaim[0];
    const aliceDepositBalanceAfterClaim = aliceGetMemberInfoAfterClaim[1];
    const alicePendingRewardAfterClaim = aliceGetMemberInfoAfterClaim[2];
    const aliceTokenBalanceAfterClaim = aliceGetMemberInfoAfterClaim[3];
    const aliceLevelIdAfterClaim = aliceMemberInfoAfterClaim.levelId;
    const aliceRoundsRemainingAfterClaim = aliceMemberInfoAfterClaim.roundsRemaining;
    const aliceLastClaimRoundAfterClaim = aliceMemberInfoAfterClaim.lastClaimRound;

    assert.equal(aliceDepositBalanceAfterClaim.toString(), toWei('4'));
    assert.equal(alicePendingRewardAfterClaim.toString(), toWei('0'));
    assert.equal(aliceTokenBalanceAfterClaim, toWei('12'));
    assert.equal(aliceLevelIdAfterClaim, '1');
    assert.equal(aliceRoundsRemainingAfterClaim, '4');
    assert.equal(aliceLastClaimRoundAfterClaim, '1');

    await backo.claimReward({ from: bob });

    const bobGetMemberInfoAfterClaim = await backo.getMemberInfo(bob, { from: owner });

    const bobMemberInfoAfterClaim = bobGetMemberInfoAfterClaim[0];
    const bobDepositBalanceAfterClaim = bobGetMemberInfoAfterClaim[1];
    const bobPendingRewardAfterClaim = bobGetMemberInfoAfterClaim[2];
    const bobTokenBalanceAfterClaim = bobGetMemberInfoAfterClaim[3];
    const bobLevelIdAfterClaim = bobMemberInfoAfterClaim.levelId;
    const bobRoundsRemainingAfterClaim = bobMemberInfoAfterClaim.roundsRemaining;
    const bobLastClaimRoundAfterClaim = bobMemberInfoAfterClaim.lastClaimRound;

    assert.equal(bobDepositBalanceAfterClaim.toString(), toWei('2'));
    assert.equal(bobPendingRewardAfterClaim.toString(), toWei('0'));
    assert.equal(bobTokenBalanceAfterClaim, toWei('12'));
    assert.equal(bobLevelIdAfterClaim, '1');
    assert.equal(bobRoundsRemainingAfterClaim, '2');
    assert.equal(bobLastClaimRoundAfterClaim, '1');

    await backo.claimReward({ from: carol });

    const carolGetMemberInfoAfterClaim = await backo.getMemberInfo(carol, { from: owner });

    const carolMemberInfoAfterClaim = carolGetMemberInfoAfterClaim[0];
    const carolDepositBalanceAfterClaim = carolGetMemberInfoAfterClaim[1];
    const carolPendingRewardAfterClaim = carolGetMemberInfoAfterClaim[2];
    const carolTokenBalanceAfterClaim = carolGetMemberInfoAfterClaim[3];
    const carolLevelIdAfterClaim = carolMemberInfoAfterClaim.levelId;
    const carolRoundsRemainingAfterClaim = carolMemberInfoAfterClaim.roundsRemaining;
    const carolLastClaimRoundAfterClaim = carolMemberInfoAfterClaim.lastClaimRound;

    assert.equal(carolDepositBalanceAfterClaim.toString(), toWei('0.1'));
    assert.equal(carolPendingRewardAfterClaim.toString(), toWei('0'));
    assert.equal(carolTokenBalanceAfterClaim, toWei('1'));
    assert.equal(carolLevelIdAfterClaim, '0');
    assert.equal(carolRoundsRemainingAfterClaim, '1');
    assert.equal(carolLastClaimRoundAfterClaim, '1');
  });

  it('should let members unsubscribe', async () => {

    await backo.removeFund({ from: bob });

    const backoBalance = await web3.eth.getBalance(backo.address);
    assert.equal(backoBalance, toWei('4.1'));

    const backoInfo = await backo.getBackoInfo();
    const weiPerRound = backoInfo[8];
    const numberOfMembers = backoInfo[10];

    assert.equal(weiPerRound.toString(), toWei('1.1'));
    assert.equal(numberOfMembers, '2');

    const levelInfo1 = await backo.levelInfos('1', { from: owner });
    assert.equal(levelInfo1.numberOfMembers, '1');

  });



})
