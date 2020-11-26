import web3 from 'web3';

export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(38, 42)}`;
}

export const toWei = (n) => {
  // n must be string
  return web3.utils.toWei(n, 'Ether');;
};

export const toEther = (n) => {
  // n must be string
  return web3.utils.fromWei(n, 'ether');
}