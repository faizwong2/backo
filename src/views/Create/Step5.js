

const Step5 = (props) => {

  const {
    step,
    confirmCreate,
    goToPreviousStep,
    backoName,
    about,
    twitter,
    youtube,
    telegram,
    discord,
    tokenName,
    tokenSymbol,
    tokenDescription,
    levels,
    goals,
    previewImageUrl,
  } = props;

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Confirm your backo details</p>
          <p className='create__subtitle'>Clicking "Confirm" will create a backo</p>

          <div class='columns'>

            <div class='left-column'>

              <Profile
                backoName={backoName}
                about={about}
                previewImageUrl={previewImageUrl}
              />

              <SocialMedia
                twitter={twitter}
                youtube={youtube}
                telegram={telegram}
                discord={discord}
              />

              <Goals
                goals={goals}
              />

            </div>

            <div class='right-column'>

              <Token
                tokenName={tokenName}
                tokenSymbol={tokenSymbol}
                tokenDescription={tokenDescription}
              />

              <Membership
                levels={levels}
                tokenSymbol={tokenSymbol}
              />

            </div>

          </div>

          <div className='form-buttons form-buttons--previousnext'>
            <button
              type='button'
              className='btn form-button__btn'
              onClick={goToPreviousStep}
            >
              Previous
            </button>
            <button
              type='button'
              className='btn form-button__btn btn--primary'
              onClick={confirmCreate}
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const Profile = (props) => {

  const {
    backoName,
    about,
    previewImageUrl,
  } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Profile</p>
      </div>
      <div className='card__content'>
        <div className='bullet'>
          <p className='bullet__heading'>Backo name</p>
          <p className='bullet__content'>{backoName}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>About</p>
          <p className='bullet__content'>{about}</p>
        </div>
        {
          previewImageUrl &&
          <div className='bullet'>
            <p className='bullet__heading'>Profile image</p>
            <img src={previewImageUrl} width='100' height='100' alt='profile'/>
          </div>
        }
      </div>
    </div>
  );

}

const SocialMedia = (props) => {

  const {
    twitter,
    youtube,
    telegram,
    discord,
  } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Social media</p>
      </div>
      <div className='card__content'>
        {
          twitter &&
          <div className='bullet'>
            <p className='bullet__heading'>Twitter</p>
            <p className='bullet__content'>{twitter}</p>
          </div>
        }
        {
          youtube &&
          <div className='bullet'>
            <p className='bullet__heading'>Youtube</p>
            <p className='bullet__content'>{youtube}</p>
          </div>
        }
        {
          telegram &&
          <div className='bullet'>
            <p className='bullet__heading'>Telegram</p>
            <p className='bullet__content'>{telegram}</p>
          </div>
        }
        {
          discord &&
          <div className='bullet'>
            <p className='bullet__heading'>Discord</p>
            <p className='bullet__content'>{discord}</p>
          </div>
        }
      </div>
    </div>
  );

}

const Token = (props) => {

  const {
    tokenName,
    tokenSymbol,
    tokenDescription
  } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Token</p>
      </div>
      <div className='card__content'>
        <div className='bullet'>
          <p className='bullet__heading'>Token name</p>
          <p className='bullet__content'>{tokenName}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>Token symbol</p>
          <p className='bullet__content'>{tokenSymbol}</p>
        </div>
        <div className='bullet'>
          <p className='bullet__heading'>Token description</p>
          <p className='bullet__content'>{tokenDescription}</p>
        </div>
      </div>
    </div>
  );

}

const Membership = (props) => {

  const { levels, tokenSymbol } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Membership</p>
      </div>
      <div className='card__content'>
        {
          levels.map((item, index) => {
            return (
              <div className='bullet' key={index}>
                <p className='bullet__heading'>Level {index + 1}</p>
                <p className='bullet__content'>
                  {item[0] ? item[0] : '0'} ETH - {item[1] ? item[1] : '0'} {tokenSymbol}
                </p>
              </div>
            );
          })
        }
        
      </div>
    </div>
  );

}

const Goals = (props) => {

  const { goals } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Goals</p>
      </div>
      <div className='card__content'>
        {
          goals.map((item, index) => {
            return (
              <div className='bullet' key={index}>
                <p className='bullet__heading'>{item[0] ? item[0] : '0'} ETH per round</p>
                <p className='bullet__content'>
                  {item[1]}
                </p>
              </div>
            );
          })
        }
      </div>
    </div>
  );

}

export default Step5;
