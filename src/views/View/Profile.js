import { toEther } from '../../utils/index.js';

const Profile = (props) => {

  const {
    profileImageHash,
    backoName,
    numberOfMembers,
    weiPerRound,
    socialMedia,
  } = props;

  return (
    <div className='profile'>

      <div className='profile__img-wrapper'>
        <img className='profile__img' src={`https://ipfs.infura.io/ipfs/${profileImageHash}`} alt='profile'/>
      </div>

      <div className='profile__content-wrapper'>

        <div className='profile__content-wrapper__name'>
          <p>{backoName}</p>
        </div>

        <div className='profile__content-wrapper__details'>

          <div className='profile__content-wrapper__details__stats'>
            <p><b>{numberOfMembers}</b> members</p>
            <p><b>{toEther(weiPerRound)}</b> ETH per round</p>
          </div>

          <SocialMedia socialMedia={socialMedia}/>

        </div>

      </div>

    </div>
  )
}

const SocialMedia = (props) => {

  const {
    socialMedia
  } = props;

  return (
    <div className='profile__content-wrapper__details__social'>
      {
        socialMedia.twitter &&
        <a href={socialMedia.twitter} target='_blank' rel='noreferrer'>
          <i className='lni lni-twitter-original' id='twitter'></i>
        </a>
      }
      {
        socialMedia.youtube &&
        <a href={socialMedia.youtube} target='_blank' rel='noreferrer'>
          <i className='lni lni-youtube' id='youtube'></i>
        </a>
      }
      {
        socialMedia.telegram &&
        <a href={socialMedia.telegram} target='_blank' rel='noreferrer'>
          <i className='lni lni-telegram-original' id='telegram'></i>
        </a>
      }
      {
        socialMedia.discord &&
        <a href={socialMedia.discord} target='_blank' rel='noreferrer'>
          <i className='lni lni-discord' id='discord'></i>
        </a>
      }
    </div>
  );
}

export default Profile;