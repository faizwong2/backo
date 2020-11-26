

const Step3 = (props) => {

  const {
    step,
    goToNextStep,
    goToPreviousStep,
    levels,
    setLevels,
  } = props;

  const handleAddLevel = () => {
    setLevels([...levels, ['','']]);
  }

  const handleRemoveLevel = () => {
    setLevels(levels.slice(0, levels.length - 1));
  }

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Set your membership tiers</p>
          <p className='create__subtitle'>Create options for your members with different prize points and benefits</p>

          <form className='form create__form'>

            {
              levels.map((item, index) => {
                return (
                  <Item i={index} levels={levels} setLevels={setLevels} key={index}/>
                );
              })
            }

            <div className='form-buttons form-buttons--plusminus'>
              <button
                type='button'
                onClick={handleRemoveLevel}
                className='btn form-button__btn btn__s'
                disabled={levels.length === 1}
              >
                <i className="lni lni-minus"></i>
              </button>
              <button
                type='button'
                onClick={handleAddLevel}
                className='btn form-button__btn btn__s'
              >
                <i className="lni lni-plus"></i>
              </button>
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

const Item = (props) => {

  const { i, levels, setLevels } = props;

  const handle0 = (e) => {
    const newLevels = [...levels];
    newLevels[i][0] = e.target.value;
    setLevels(newLevels);
  }

  const handle1 = (e) => {
    const newLevels = [...levels];
    newLevels[i][1] = e.target.value;
    setLevels(newLevels);
  }

  return (
    <div className='form-input-group'>
      <p className='form-label'>Level {`${i + 1}`}</p>
      <div className='form-row'>
        <div className='form-col'>
          <input
            value={levels[i][0]}
            onChange={handle0}
            type='text'
            className='form-input'
            placeholder='Value in ETH'
          />
          <p className='form-info'>ETH per round</p>
        </div>
        <div className='form-col'>
          <input
            value={levels[i][1]}
            onChange={handle1}
            type='text'
            className='form-input'
            placeholder='Value in token'
          />
          <p className='form-info'>Reward token per round</p>
        </div>
      </div>
    </div>
  );

}

export default Step3;
