

const Step2 = (props) => {

  const {
    step,
    goToNextStep,
    goToPreviousStep,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    tokenDescription,
    setTokenDescription,
  } = props;

  const handleChangeTokenName = (e) => {
    setTokenName(e.target.value);
  }

  const handleChangeTokenSymbol = (e) => {
    setTokenSymbol(e.target.value);
  }

  const handleChangeTokenDescription = (e) => {
    setTokenDescription(e.target.value);
  }

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Customize your reward token</p>
          <p className='create__subtitle'>Members who contribute to your backo will receive an ERC20 token as a reward</p>

          <form className='form create__form'>

            <div className='form-input-group'>
              <p className='form-label'>Reward token name</p>
              <input
                type='text'
                className='form-input'
                value={tokenName}
                onChange={handleChangeTokenName}
              />
              <p className='form-info'>Name of reward token</p>
            </div>

            <div className='form-input-group'>
              <p className='form-label'>Reward token symbol</p>
              <input
                type='text'
                className='form-input'
                value={tokenSymbol}
                onChange={handleChangeTokenSymbol}
              />
              <p className='form-info'>Symbol of reward token</p>
            </div>

            <div className='form-input-group'>
              <p className='form-label'>Reward token description</p>
              <textarea
                className='form-input'
                value={tokenDescription}
                onChange={handleChangeTokenDescription}
              ></textarea>
              <p className='form-info'>Tell your members what can they do with the reward tokens</p>
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
                onClick={goToNextStep}
              >
                Next
              </button>
            </div>

          </form>

          

        </div>
      </div>
    </div>
  );
}

export default Step2;
