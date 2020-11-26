const { expectRevert } = require('@openzeppelin/test-helpers');
const Backo = artifacts.require("./Backo.sol");
const BackoFactory = artifacts.require("./BackoFactory.sol");

/**
  * These tests check the ability of the backo factory contract to generate
  * clone contracts as well as the emergency stop functionality (it should pause
  * the functionalities of all the child contracts)
  */
contract('BackoFactory', (accounts) => {

  let backoFactory;
  let backo1;
  let backo2;

  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];
  const dave = accounts[4];

  const toWei = (n) => {
    // n must be string
    return web3.utils.toWei(n, 'Ether');
  };

  before(async () => {
    backoFactory = await BackoFactory.new({ from: owner });
  });

  it('should revert on bad input when creating backo', async () => {

    await expectRevert(
      backoFactory.createBacko(
        'Test Backo',
        'TestToken',
        'TEST',
        1,
        [toWei('0.1'), toWei('1')],
        [toWei('1'), toWei('12')],
        {
          profileImageHash: 'abc',
          backoDetailsHash: 'xyz'
        },
        { from: alice }
      ),
      'createBacko: level amounts and number of levels do not match'
    );

  });

  it('should be able to create more than one backo', async () => {

    const backoCreation1 = await backoFactory.createBacko(
      'Test Backo1',
      'TestToken1',
      'TEST1',
      2,
      [toWei('0.1'), toWei('1')],
      [toWei('1'), toWei('12')],
      {
        profileImageHash: 'abc',
        backoDetailsHash: 'xyz'
      },
      { from: alice }
    );
    backo1 = await Backo.at(backoCreation1.logs[0].args.backo);

    const backoCreation2 = await backoFactory.createBacko(
      'Test Backo2',
      'TestToken2',
      'TEST2',
      2,
      [toWei('0.1'), toWei('1')],
      [toWei('1'), toWei('12')],
      {
        profileImageHash: 'abc',
        backoDetailsHash: 'xyz'
      },
      { from: bob }
    );
    backo2 = await Backo.at(backoCreation2.logs[0].args.backo);

    const firstBackoAddress = await backoFactory.allBackos('0');
    const secondBackoAddress = await backoFactory.allBackos('1');

    assert.equal(firstBackoAddress, backo1.address);
    assert.equal(secondBackoAddress, backo2.address);

  });

  it('should configure child contract state correctly', async () => {
    
    const backoInfo1 = await backo1.getBackoInfo();

    const backoName1 = backoInfo1[0];
    const tokenName1 = backoInfo1[1];
    const tokenSymbol1 = backoInfo1[2];

    assert.equal(backoName1, 'Test Backo1');
    assert.equal(tokenName1, 'TestToken1');
    assert.equal(tokenSymbol1, 'TEST1');

    const backoInfo2 = await backo2.getBackoInfo();

    const backoName2 = backoInfo2[0];
    const tokenName2 = backoInfo2[1];
    const tokenSymbol2 = backoInfo2[2];

    assert.equal(backoName2, 'Test Backo2');
    assert.equal(tokenName2, 'TestToken2');
    assert.equal(tokenSymbol2, 'TEST2');

  });

  it('should be able to trigger emergency stop', async () => {
    
    await backoFactory.setStopped(true, { from: owner });

    const stopped = await backoFactory.stopped();

    assert.equal(stopped, true);

    await expectRevert(
      backo1.addFund(2, 1, { from: carol, value: toWei('10') }),
      'stopInEmergency: emergency stop'
    );

    await expectRevert(
      backo2.addFund(2, 1, { from: dave, value: toWei('10') }),
      'stopInEmergency: emergency stop'
    );

  });

  it('should be able to undo emergency stop', async () => {

    await backoFactory.setStopped(false, { from: owner });

    const stopped = await backoFactory.stopped();

    assert.equal(stopped, false);

    await backo1.addFund(2, 1, { from: carol, value: toWei('10') });
    const backoInfo1 = await backo1.getBackoInfo();
    const numberOfMembers1 = backoInfo1[10];
    assert.equal(numberOfMembers1.toString(), '1');

    await backo2.addFund(2, 1, { from: dave, value: toWei('10') });
    const backoInfo2 = await backo2.getBackoInfo();
    const numberOfMembers2 = backoInfo2[10];
    assert.equal(numberOfMembers2.toString(), '1');

  });

});