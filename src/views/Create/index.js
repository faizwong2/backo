import React, { useState, useEffect } from 'react';

import backoFactory from '../../build/BackoFactory.json';

import Loading from '../Loading/index.js'
import Step1 from './Step1.js';
import Step2 from './Step2.js';
import Step3 from './Step3.js';
import Step4 from './Step4.js';
import Step5 from './Step5.js';
import Step6 from './Step6.js';
import Step7 from './Step7.js';

import { toWei } from '../../utils/index.js';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

const Create = (props) => {

  const { web3, account, network } = props;
  const [contract, setContract] = useState(null);
  const [backoAddress, setBackoAddress] = useState('');

  const [step, setStep] = useState(1);

  const [backoName, setBackoName] = useState('');
  const [about, setAbout] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [telegram, setTelegram] = useState('');
  const [discord, setDiscord] = useState('');
  const [imageBuffer, setImageBuffer] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');

  const [levels, setLevels] = useState([['', '']]);

  const [goals, setGoals] = useState([['', '']]);

  useEffect(() => {

    const init = async () => {
      try {
        const instance = new web3.eth.Contract(
          backoFactory.abi,
          backoFactory.networks[network.toString(10)].address
        );
        setContract(instance);
      } catch (error) {
        setContract(null);
        console.error(error);
      }
    };

    if (network) {
      init();
    }

  // eslint-disable-next-line
  }, [network]);

  const goToNextStep = () => {
    if (step >= 1 && step <= 6) {
      setStep(step + 1);
    }
  }

  const goToPreviousStep = () => {
    if (step >= 2 && step <= 7) {
      setStep(step - 1);
    }
  }

  const listIsValid = (x) => {
    for (let i = 0; i < x.length; i++) {
      if (x[i][0] === '') return false;
      if (x[i][1] === '') return false;
    }
    return true;
  };

  const getLevelAmounts = (x) => {
    const levelAmounts = [];
    for (let i = 0; i < x.length; i++) {
      levelAmounts.push(toWei(x[i][0]));
    }
    return levelAmounts;
  }

  const getLevelRewards = (x) => {
    const levelRewards = [];
    for (let i = 0; i < x.length; i++) {
      levelRewards.push(toWei(x[i][1]));
    }
    return levelRewards;
  }

  const confirmCreate = async () => {
    if (backoName === '') return;
    if (about === '') return;
    if (imageBuffer === null) return;

    if (tokenName === '') return;
    if (tokenSymbol === '') return;
    if (tokenDescription === '') return;

    if (!listIsValid(levels)) return;
    if (!listIsValid(goals)) return;

    console.log('confirmed');

    const result = {
      backoName: backoName,
      about: about,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenDescription: tokenDescription,
      levels: levels,
      numberOfLevels: levels.length.toString(10),
      levelAmounts: getLevelAmounts(levels),
      levelRewards: getLevelRewards(levels),
      goals: goals,
      imageBuffer: imageBuffer,
      socialMedia: {}
    }

    if (twitter !== '') {
      result.socialMedia.twitter = twitter;
    }

    if (youtube !== '') {
      result.socialMedia.youtube = youtube;
    }

    if (telegram !== '') {
      result.socialMedia.telegram = telegram;
    }

    if (discord !== '') {
      result.socialMedia.discord = discord;
    }

    const backoDetails = {
      about: result.about,
      tokenDescription: result.tokenDescription,
      goals: result.goals,
      socialMedia: result.socialMedia
    }

    console.log(result);
    console.log(backoDetails);


    try {
      setStep(6);

      // upload image to IPFS
      const resultImage = await ipfs.add(result.imageBuffer);

      // upload backoDetails to IPFS
      const resultBackoDetails = await ipfs.add(JSON.stringify(backoDetails));

      const backo = await contract.methods.createBacko(
        result.backoName,
        result.tokenName,
        result.tokenSymbol,
        result.numberOfLevels,
        result.levelAmounts,
        result.levelRewards,
        {
          profileImageHash: resultImage.path,
          backoDetailsHash: resultBackoDetails.path
        }
      ).send({ from: account });
      setBackoAddress(backo.events.BackoCreated.returnValues.backo);

      setStep(7);
    } catch (error) {
      console.log(error);
      setStep(5);
    }

    
  }

  if (!contract) {
    return (
      <Loading />
    );
  }

  if (step === 1) {
    return (
      <Step1
        step={step}
        goToNextStep={goToNextStep}
        backoName={backoName}
        setBackoName={setBackoName}
        about={about}
        setAbout={setAbout}
        twitter={twitter}
        setTwitter={setTwitter}
        youtube={youtube}
        setYoutube={setYoutube}
        telegram={telegram}
        setTelegram={setTelegram}
        discord={discord}
        setDiscord={setDiscord}
        setImageBuffer={setImageBuffer}
        setPreviewImageUrl={setPreviewImageUrl}
      />
    );
  } else if (step === 2) {
    return (
      <Step2
        step={step}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        tokenName={tokenName}
        setTokenName={setTokenName}
        tokenSymbol={tokenSymbol}
        setTokenSymbol={setTokenSymbol}
        tokenDescription={tokenDescription}
        setTokenDescription={setTokenDescription}
      />
    );
  } else if (step === 3) {
    return (
      <Step3
        step={step}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        levels={levels}
        setLevels={setLevels}
      />
    );
  } else if (step === 4) {
    return (
      <Step4
        step={step}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        goals={goals}
        setGoals={setGoals}
      />
    );
  } else if (step === 5) {
    return (
      <Step5
        step={step}
        confirmCreate={confirmCreate}
        goToPreviousStep={goToPreviousStep}
        backoName={backoName}
        about={about}
        twitter={twitter}
        youtube={youtube}
        telegram={telegram}
        discord={discord}
        tokenName={tokenName}
        tokenSymbol={tokenSymbol}
        tokenDescription={tokenDescription}
        levels={levels}
        goals={goals}
        imageBuffer={imageBuffer}
        previewImageUrl={previewImageUrl}
      />
    );
  } else if (step === 6) {
    return (
      <Step6
        step={step}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />
    );
  } else if (step === 7) {
    return (
      <Step7
        step={step}
        backoAddress={backoAddress}
      />
    );
  }

  return (
    <div>
      <h1>Create</h1>
      <h1>{step}</h1>
      <button onClick={goToPreviousStep}>Previous</button>
      <button onClick={goToNextStep}>Next</button>
    </div>
  );
}

export default Create;
