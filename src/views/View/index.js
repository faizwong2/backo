import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import backo from '../../build/Backo.json';

import Loading from '../Loading/index.js';
import Profile from './Profile.js';
import About from './About.js';
import MembershipLevels from './MembershipLevels.js';
import TokenDescription from './TokenDescription.js';
import Goals from './Goals.js';
import Creator from './Creator.js';
import Membership from './Membership.js';
import Details from './Details.js';

const View = (props) => {

  const { web3, account, network } = props;

  const { backoAddress } = useParams();

  const [contract, setContract] = useState(null);

  const [backoInfo, setBackoInfo] = useState({
    // creator
    backoName: '',
    profileImageHash: '',
    numberOfMembers: '',
    weiPerRound: '',
    backoDetailsHash: '',
    socialMedia: {},
    about: '',
    creatorAddress: '',
    // token
    tokenName: '',
    tokenSymbol: '',
    tokenDescription: '',
    // membership
    numberOfLevels: '',
    levelInfos: [],
    // goals
    goals: [],
    // details
    lastWithdrawBlock: '',
    minBlocksPerRound: '',
    roundsDone: '',
    nextWithdrawBlock: '',
  });

  // 'member' / 'creator' / null
  const [accountInfo, setAccountInfo] = useState(null);

  const [memberInfo, setMemberInfo] = useState({
    levelId: '',
    roundsRemaining: '',
    lastClaimRound: '',
    depositBalance: '',
    pendingReward: '',
    tokenBalance: '',
  });

  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const [canCollect, setCanCollect] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

  useEffect(() => {

    const init = async () => {

      try {
        const instance = new web3.eth.Contract(
          backo.abi,
          backoAddress
        );

        const instanceBackoInfo = await instance.methods.getBackoInfo().call();

        const instanceInfo = {
          backoName: instanceBackoInfo[0],
          tokenName: instanceBackoInfo[1],
          tokenSymbol: instanceBackoInfo[2],
          creatorAddress: instanceBackoInfo[3],
          lastWithdrawBlock: instanceBackoInfo[4],
          minBlocksPerRound: instanceBackoInfo[5],
          roundsDone: instanceBackoInfo[6],
          nextWithdrawBlock: instanceBackoInfo[7],
          weiPerRound: instanceBackoInfo[8],
          numberOfLevels: instanceBackoInfo[9],
          numberOfMembers: instanceBackoInfo[10],
          profileImageHash: instanceBackoInfo[11][0],
          backoDetailsHash: instanceBackoInfo[11][1],
        }

        const backoDetailsResponse = await axios.get(`https://ipfs.infura.io/ipfs/${instanceInfo.backoDetailsHash}`);
        const backoDetailsResponseData = backoDetailsResponse.data;

        instanceInfo.socialMedia = backoDetailsResponseData.socialMedia;
        instanceInfo.about = backoDetailsResponseData.about;
        instanceInfo.tokenDescription = backoDetailsResponseData.tokenDescription;
        instanceInfo.goals = backoDetailsResponseData.goals;

        const instanceLevelInfos = [];
        for (let i = 0; i < parseInt(instanceInfo.numberOfLevels, 10); i++) {
          const currentLevelInfo = await instance.methods.levelInfos(i.toString(10)).call();
          instanceLevelInfos.push({
            amountPerRound: currentLevelInfo.amountPerRound,
            rewardPerRound: currentLevelInfo.rewardPerRound,
            numberOfMembers: currentLevelInfo.numberOfMembers,
          });
        }

        instanceInfo.levelInfos = instanceLevelInfos;

        let instanceAccountInfo = null;
        let instanceMemberInfo = {
          levelId: '',
          roundsRemaining: '',
          lastClaimRound: '',
          depositBalance: '',
          pendingReward: '',
          tokenBalance: '',
        }
        if (account) {
          if (account === instanceInfo.creatorAddress) {
            instanceAccountInfo = 'creator';
          } else {
            const isMember = await instance.methods.isMember(account).call();
            if (isMember) {
              instanceAccountInfo = 'member';

              const getMemberInfo = await instance.methods.getMemberInfo(account).call();
              instanceMemberInfo.levelId = getMemberInfo[0][0];
              instanceMemberInfo.roundsRemaining  = getMemberInfo[0][1];
              instanceMemberInfo.lastClaimRound = getMemberInfo[0][2];
              instanceMemberInfo.depositBalance = getMemberInfo[1];
              instanceMemberInfo.pendingReward = getMemberInfo[2];
              instanceMemberInfo.tokenBalance = getMemberInfo[3];
            }
          }
        }

        const instanceCanCollect = await instance.methods.creatorCanWithdrawFund().call();

        setBackoInfo(instanceInfo);
        setAccountInfo(instanceAccountInfo);
        setMemberInfo(instanceMemberInfo);
        setCanCollect(instanceCanCollect);
        setContract(instance);
      } catch (error) {
        console.error(error);
      }

    }

    init();

  // eslint-disable-next-line
  }, [network, account]);


  const handleJoin = async (numberOfRounds, levelId, value) => {
    if (accountInfo === 'creator') {
      setExpandedRowIndex(null);
      return;
    }

    const result = {
      rounds: numberOfRounds,
      levelId: levelId,
      value: value,
    }

    try {
      setJoinLoading(true);
      await contract.methods.addFund(
        result.rounds,
        result.levelId
      ).send({ from: account, value: result.value });

      const updatedBackoInfo = await contract.methods.getBackoInfo().call();
      const newBackoInfo = {
        weiPerRound: updatedBackoInfo[8],
        numberOfMembers: updatedBackoInfo[10],
      }

      let newAccountInfo = '';
      let newMemberInfo = {};
      const isMember = await contract.methods.isMember(account).call();
      if (isMember) {
        newAccountInfo = 'member';

        const getMemberInfo = await contract.methods.getMemberInfo(account).call();
        newMemberInfo.levelId = getMemberInfo[0][0];
        newMemberInfo.roundsRemaining  = getMemberInfo[0][1];
        newMemberInfo.lastClaimRound = getMemberInfo[0][2];
        newMemberInfo.depositBalance = getMemberInfo[1];
        newMemberInfo.pendingReward = getMemberInfo[2];
        newMemberInfo.tokenBalance = getMemberInfo[3];
      }

      setBackoInfo({
        ...backoInfo,
        ...newBackoInfo,
      });
      setAccountInfo(newAccountInfo);
      setMemberInfo(newMemberInfo);

      setJoinLoading(false);
      setExpandedRowIndex(null);
    } catch (error) {
      console.error(error);
      setJoinLoading(false);
    }
  }

  const handleUnsubscribe = async () => {
    if (accountInfo !== 'member') {
      return;
    }

    try {
      setUnsubscribeLoading(true);
      await contract.methods.removeFund().send({ from: account });

      const updatedBackoInfo = await contract.methods.getBackoInfo().call();
      const newBackoInfo = {
        weiPerRound: updatedBackoInfo[8],
        numberOfMembers: updatedBackoInfo[10],
      }

      setBackoInfo({
        ...backoInfo,
        ...newBackoInfo,
      });
      setAccountInfo(null);
      setMemberInfo({});

      setUnsubscribeLoading(false);
      setExpandedRowIndex(null);
    } catch (error) {
      console.error(error);
      setUnsubscribeLoading(false);
    }
  }

  const handleClaim = async () => {
    if (accountInfo !== 'member') {
      return;
    }

    try {
      setClaimLoading(true);
      await contract.methods.claimReward().send({ from: account });

      const newMemberInfo = {};
      const getMemberInfo = await contract.methods.getMemberInfo(account).call();
      newMemberInfo.levelId = getMemberInfo[0][0];
      newMemberInfo.roundsRemaining  = getMemberInfo[0][1];
      newMemberInfo.lastClaimRound = getMemberInfo[0][2];
      newMemberInfo.depositBalance = getMemberInfo[1];
      newMemberInfo.pendingReward = getMemberInfo[2];
      newMemberInfo.tokenBalance = getMemberInfo[3];

      const updatedBackoInfo = await contract.methods.getBackoInfo().call();

      const newBackoInfo = {
        backoName: updatedBackoInfo[0],
        tokenName: updatedBackoInfo[1],
        tokenSymbol: updatedBackoInfo[2],
        creatorAddress: updatedBackoInfo[3],
        lastWithdrawBlock: updatedBackoInfo[4],
        minBlocksPerRound: updatedBackoInfo[5],
        roundsDone: updatedBackoInfo[6],
        nextWithdrawBlock: updatedBackoInfo[7],
        weiPerRound: updatedBackoInfo[8],
        numberOfLevels: updatedBackoInfo[9],
        numberOfMembers: updatedBackoInfo[10],
        profileImageHash: updatedBackoInfo[11][0],
        backoDetailsHash: updatedBackoInfo[11][1],
      }

      setBackoInfo({
        ...backoInfo,
        ...newBackoInfo
      });
      setMemberInfo(newMemberInfo);
      setClaimLoading(false);
    } catch (error) {
      setClaimLoading(false);
    }
  }

  const handleCollect = async () => {
    if (accountInfo !== 'creator') {
      return;
    }

    try {
      setCollectLoading(true);
      await contract.methods.creatorWithdrawFund().send({ from: account });

      const updatedBackoInfo = await contract.methods.getBackoInfo().call();

      const newBackoInfo = {
        backoName: updatedBackoInfo[0],
        tokenName: updatedBackoInfo[1],
        tokenSymbol: updatedBackoInfo[2],
        creatorAddress: updatedBackoInfo[3],
        lastWithdrawBlock: updatedBackoInfo[4],
        minBlocksPerRound: updatedBackoInfo[5],
        roundsDone: updatedBackoInfo[6],
        nextWithdrawBlock: updatedBackoInfo[7],
        weiPerRound: updatedBackoInfo[8],
        numberOfLevels: updatedBackoInfo[9],
        numberOfMembers: updatedBackoInfo[10],
        profileImageHash: updatedBackoInfo[11][0],
        backoDetailsHash: updatedBackoInfo[11][1],
      }

      const updatedCanCollect = await contract.methods.creatorCanWithdrawFund().call();

      setBackoInfo({
        ...backoInfo,
        ...newBackoInfo
      });
      setCanCollect(updatedCanCollect);
      setCollectLoading(false);
    } catch (error) {
      console.error(error);
      setCollectLoading(false);
    }
  }

  if (!contract) {
    return (
       <Loading />
    );
  }

  return (
    <div>
      <div className='container'>

        <div className='columns'>

          <div className='left-column'>

            <Profile
              profileImageHash={backoInfo.profileImageHash}
              backoName={backoInfo.backoName}
              numberOfMembers={backoInfo.numberOfMembers}
              weiPerRound={backoInfo.weiPerRound}
              socialMedia={backoInfo.socialMedia}
            />

            <About
              about={backoInfo.about}
            />

            <MembershipLevels
              levelInfos={backoInfo.levelInfos}
              tokenSymbol={backoInfo.tokenSymbol}
              expandedRowIndex={expandedRowIndex}
              setExpandedRowIndex={setExpandedRowIndex}
              handleJoin={handleJoin}
              accountInfo={accountInfo}
              joinLoading={joinLoading}
              memberInfo={memberInfo}
              unsubscribeLoading={unsubscribeLoading}
              account={account}
            />

            <TokenDescription
              tokenDescription={backoInfo.tokenDescription}
            />

            <Goals
              weiPerRound={backoInfo.weiPerRound}
              goals={backoInfo.goals}
            />

          </div>

          <div className='right-column'>

            {
              accountInfo === 'creator' &&
              <Creator
                handleCollect={handleCollect}
                collectLoading={collectLoading}
                canCollect={canCollect}
              />
            }

            {
              accountInfo === 'member' &&
              memberInfo.depositBalance &&
              <Membership
                memberInfo={memberInfo}
                tokenSymbol={backoInfo.tokenSymbol}
                handleUnsubscribe={handleUnsubscribe}
                unsubscribeLoading={unsubscribeLoading}
                handleClaim={handleClaim}
                claimLoading={claimLoading}
              />
            }

            <Details
              tokenName={backoInfo.tokenName}
              tokenSymbol={backoInfo.tokenSymbol}
              roundsDone={backoInfo.roundsDone}
              lastWithdrawBlock={backoInfo.lastWithdrawBlock}
              nextWithdrawBlock={backoInfo.nextWithdrawBlock}
              minBlocksPerRound={backoInfo.minBlocksPerRound}
              creatorAddress={backoInfo.creatorAddress}
              backoAddress={backoAddress}
            />

          </div>

        </div>

      </div>
    </div>
  );
}

export default View;