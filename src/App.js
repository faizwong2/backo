import React, { useState, useEffect } from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import getWeb3 from './getWeb3.js';

import Logo from './assets/backo1.png';

import Create from './views/Create/index.js';
import Loading from './views/Loading/index.js';
import Home from './views/Home/index.js';
import View from './views/View/index.js';


import { formatAddress } from './utils/index.js';

const App = () => {

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {

    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        setWeb3(web3);
        setAccount(accounts[0]);
        setNetwork(networkId);

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        });

        window.ethereum.on('chainChanged', async () => {
          const networkId = await web3.eth.net.getId();
          setNetwork(networkId);
        });
      } catch (error) {
        alert('Failed to load web3');
        console.error(error);
      }
    }

    init();

  }, []);

  const connectWallet = async () => {
    if (account) return;
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  }

  if (!web3) {
    return <Loading />
  }


  return (
    <div>

      <div className='container'>
        <nav className='navbar'>
          <Link to='/' className='navbar__brand'>
            <img className='navbar__brand__img' src={Logo} alt='logo'/>
          </Link>
          
          <button
            onClick={connectWallet}
            type='button'
            className='btn'
          >
            {
              account ?
              formatAddress(account) :
              'Connect wallet'
            }
            
          </button>
        </nav>
      </div>

      <Switch>
        <Route exact path='/create'>
          <Create
            web3={web3}
            account={account}
            network={network}
          />
        </Route>
        <Route path='/:backoAddress'>
          <View
            web3={web3}
            account={account}
            network={network}
          />
        </Route>
        <Route exact path='/'>
          <Home
            account={account}
          />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
