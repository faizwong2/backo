import { formatAddress } from '../../utils/index.js';

const Details = (props) => {

  const {
    tokenName,
    tokenSymbol,
    roundsDone,
    lastWithdrawBlock,
    nextWithdrawBlock,
    minBlocksPerRound,
    creatorAddress,
    backoAddress,
  } = props;

  return (
    <div className='card'>
      <div className='card__content'>

        <div className='bullet'>
          <p className='bullet__heading'>Reward token name</p>
          <p className='bullet__content'>{tokenName}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Reward token symbol</p>
          <p className='bullet__content'>{tokenSymbol}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Current round</p>
          <p className='bullet__content'>{roundsDone}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Last round block</p>
          <p className='bullet__content'>{lastWithdrawBlock}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Next round block</p>
          <p className='bullet__content'>{nextWithdrawBlock}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Minimum blocks per round</p>
          <p className='bullet__content'>{minBlocksPerRound}</p>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Creator address</p>
          <a
            href='https://etherscan.io'
            className='bullet__content bullet__content--a'
            target='_blank' rel='noreferrer'
          >
            {formatAddress(creatorAddress)}
          </a>
        </div>

        <div className='bullet'>
          <p className='bullet__heading'>Backo address</p>
          <a
            href='https://etherscan.io'
            className='bullet__content bullet__content--a'
            target='_blank' rel='noreferrer'
          >
            {formatAddress(backoAddress)}
          </a>
        </div>

      </div>
    </div>
  )
}

export default Details;