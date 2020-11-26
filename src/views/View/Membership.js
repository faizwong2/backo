import { toEther } from '../../utils/index.js';
import { BigNumber } from "bignumber.js";

const Membership = (props) => {

  const {
    memberInfo,
    tokenSymbol,
    handleUnsubscribe,
    unsubscribeLoading,
    handleClaim,
    claimLoading,
  } = props;

  const {
    levelId,
    roundsRemaining,
    depositBalance,
    pendingReward,
    tokenBalance,
  } = memberInfo;

  const formatLevelId = (levelId) => {
    const one = new BigNumber('1');
    const levelIdBN = new BigNumber(levelId);
    return levelIdBN.plus(one).toString();
  }

  const isClaimable = () => {
    const zero = new BigNumber('0');
    const pendingRewardBN = new BigNumber(pendingReward);
    return !(pendingRewardBN.isGreaterThan(zero));
  }

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Membership</p>
      </div>
      <div className='card__content'>
        <div className='bullet'>
          <p className='bullet__heading'>Membership level</p>
          <p className='bullet__content'>{formatLevelId(levelId)}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>Rounds subscribed</p>
          <p className='bullet__content'>{roundsRemaining}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>Deposit balance</p>
          <p className='bullet__content'>{toEther(depositBalance)} ETH</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>Pending {tokenSymbol}</p>
          <p className='bullet__content'>{toEther(pendingReward)} {tokenSymbol}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>{tokenSymbol} balance</p>
          <p className='bullet__content'>{toEther(tokenBalance)} {tokenSymbol}</p>
        </div>
        <button
          onClick={handleClaim}
          type='button'
          className='btn-wide margin-y-s'
          disabled={isClaimable() || claimLoading}
        >
          {
            claimLoading ?
            'Loading...' :
            'Claim reward'
          }
        </button>
        <button
          onClick={handleUnsubscribe}
          type='button'
          className='btn-wide margin-y-s btn--s btn--unsubscribe'
          disabled={unsubscribeLoading}
        >
          {
            unsubscribeLoading ?
            'Loading...' :
            'Unsubscribe'
          }
        </button>
      </div>
    </div>
  );
}

export default Membership;