import React, { useState, useEffect } from 'react';
import { BigNumber } from "bignumber.js";

import { toEther } from '../../utils/index.js';

const MembershipLevels = (props) => {

  const {
    levelInfos,
    tokenSymbol,
    expandedRowIndex,
    setExpandedRowIndex,
    handleJoin,
    accountInfo,
    joinLoading,
    memberInfo,
    unsubscribeLoading,
    account,
  } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Membership levels</p>
      </div>
      {
        levelInfos.map((levelInfo, index) => {
          return (
            <Row
              key={index}
              levelInfo={levelInfo}
              tokenSymbol={tokenSymbol}
              index={index}
              numberOfLevels={levelInfos.length}
              expandedRowIndex={expandedRowIndex}
              setExpandedRowIndex={setExpandedRowIndex}
              handleJoin={handleJoin}
              accountInfo={accountInfo}
              joinLoading={joinLoading}
              memberInfo={memberInfo}
              unsubscribeLoading={unsubscribeLoading}
              account={account}
            />
          );
        })
      }
    </div>
  );
}

const Row = (props) => {

  const {
    levelInfo,
    tokenSymbol,
    index,
    numberOfLevels,
    expandedRowIndex,
    setExpandedRowIndex,
    handleJoin,
    accountInfo,
    joinLoading,
    memberInfo,
    unsubscribeLoading,
    account,
  } = props;


  if (expandedRowIndex === index) {
    return (
      <ExpandedRow
        levelInfo={levelInfo}
        tokenSymbol={tokenSymbol}
        index={index}
        numberOfLevels={numberOfLevels}
        expandedRowIndex={expandedRowIndex}
        setExpandedRowIndex={setExpandedRowIndex}
        handleJoin={handleJoin}
        joinLoading={joinLoading}
        accountInfo={accountInfo}
        memberInfo={memberInfo}
        unsubscribeLoading={unsubscribeLoading}
      />
    );
  }

  return (
    <SmallRow
      levelInfo={levelInfo}
      tokenSymbol={tokenSymbol}
      index={index}
      numberOfLevels={numberOfLevels}
      expandedRowIndex={expandedRowIndex}
      setExpandedRowIndex={setExpandedRowIndex}
      accountInfo={accountInfo}
      memberInfo={memberInfo}
      unsubscribeLoading={unsubscribeLoading}
      account={account}
    />
  );

}

const SmallRow = (props) => {

  const {
    levelInfo,
    tokenSymbol,
    index,
    numberOfLevels,
    expandedRowIndex,
    setExpandedRowIndex,
    accountInfo,
    memberInfo,
    unsubscribeLoading,
    account,
  } = props;

  const {
    amountPerRound,
    rewardPerRound,
  } = levelInfo;

  const {
    levelId,
  } = memberInfo;

  const handleExpand = () => {
    if (expandedRowIndex === null) {
      setExpandedRowIndex(index);
    }
  }

  const accountIsMemberAndCorrectLevelId = () => {
    return accountInfo === 'member' && levelId === index.toString();
  }

  const isExpandable = () => {

    if (!account) {
      return false;
    }

    // disabled={!(expandedRowIndex === null) || accountInfo !== null }
    const noRowIsExpanded = expandedRowIndex === null;
    const accountIsNotCreator = accountInfo !== 'creator';
    // return noRowIsExpanded && accountIsNotCreator && accountIsMemberAndCorrectLevelId();
    return noRowIsExpanded && accountIsNotCreator && (accountIsMemberAndCorrectLevelId() || accountInfo === null) && !(unsubscribeLoading);
  }

  // console.log(expandedRowIndex === null, accountInfo !== 'creator', accountIsMemberAndCorrectLevelId());

  return (
    <div
      className={
        'card__row ' +
        `${index === numberOfLevels - 1 && 'card__row--lastrow'}`
      }
    >
      <div className='card__row__col1'>
        <p>{`Level ${index + 1}`}</p>
      </div>
      <div className='card__row__col2'>
        <p className='font-b'>{toEther(amountPerRound)}</p>
        <p className='font-s'>ETH per round</p>
      </div>
      <div className='card__row__col2'>
        <p className='font-b'>{toEther(rewardPerRound)}</p>
        <p className='font-s'>{`${tokenSymbol} per round`}</p>
      </div>
      <div className='card__row__col4'>
        <button
          onClick={handleExpand}
          type='button'
          className='btn'
          disabled={!(isExpandable())}
        >
          {
            accountIsMemberAndCorrectLevelId() ?
            'Extend' :
            'Join'
          }
        </button>
      </div>
    </div>
  );

}

const ExpandedRow = (props) => {

  const {
    levelInfo,
    tokenSymbol,
    index,
    numberOfLevels,
    // expandedRowIndex,
    setExpandedRowIndex,
    handleJoin,
    joinLoading,
    accountInfo,
    memberInfo,
    unsubscribeLoading,
  } = props;

  const {
    amountPerRound,
    rewardPerRound,
  } = levelInfo;

  const {
    levelId,
  } = memberInfo;

  const [joinInput, setJoinInput] = useState(6);
  const [joinAmount, setJoinAmount] = useState(0);

  useEffect(() => {
    const resultRounds = new BigNumber(joinInput.toString(10));
    const resultAmountPerRound = new BigNumber(amountPerRound);
    const resultValue = resultRounds.times(resultAmountPerRound);
    setJoinAmount(resultValue);
  }, [joinInput, amountPerRound])

  const handleClose = () => {
    setExpandedRowIndex(null);
  }

  const handleChangeJoinInput = (e) => {
    setJoinInput(e.target.value);
  }

  const handleConfirm = () => {
    handleJoin(joinInput, index, joinAmount.toString());
  }

  const accountIsMemberAndCorrectLevelId = () => {
    return accountInfo === 'member' && levelId === index.toString();
  }

  return (
    <div
      className={
        'card__row-expand ' +
        `${index === numberOfLevels - 1 && 'card__row--lastrow'}`
      }
    >

      <div className='card__row-expand__col1'>
        <p className='card__row-expand__col1__p'>
          <b>{`Level ${index + 1}`}</b>
        </p>
        <p className='card__row-expand__col1__p'>
          <b>{toEther(amountPerRound)}</b>
          <span className='font-s'>{' ETH per round'}</span>
        </p>
        <p className='card__row-expand__col1__p'>
          <b>{toEther(rewardPerRound)}</b>
          <span className='font-s'>{` ${tokenSymbol} per round`}</span>
        </p>
      </div>

      <div className='card__row-expand__col2'>
        <input
          value={joinInput}
          onChange={handleChangeJoinInput}
          className='slider'
          type='range'
          min='1'
          max='12'
        />
        <p className='card__row-expand__col2__p'>
          Deposit <b>{toEther(joinAmount.toString())} ETH</b> to subscribe for {accountIsMemberAndCorrectLevelId() && 'an additional '} <b>{joinInput} rounds</b>
        </p>
        <div className='card__row-expand__col2__buttons'>
          <button
            onClick={handleConfirm}
            type='button'
            className='btn btn--primary card__row-expand__col2__buttons__btn'
            disabled={joinLoading || unsubscribeLoading}
          >
            {
              joinLoading ?
              'Loading...' :
              'Confirm'
            }
          </button>
          <button
            onClick={handleClose}
            type='button'
            className='btn card__row-expand__col2__buttons__btn'
            disabled={joinLoading || unsubscribeLoading}
          >
            Cancel
          </button>
        </div>
      </div>

    </div>
  );

}

export default MembershipLevels;