

const Step4 = (props) => {

  const {
    step,
    goToNextStep,
    goToPreviousStep,
    goals,
    setGoals,
  } = props;

  const handleAddGoal = () => {
    setGoals([...goals, ['','']]);
  }

  const handleRemoveGoal = () => {
    setGoals(goals.slice(0, goals.length - 1));
  }

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Set your backo goals</p>
          <p className='create__subtitle'>Goals are a way for you and your members to track your progress</p>

          <form className='form create__form'>

            {
              goals.map((item, index) => {
                return (
                  <Item i={index} goals={goals} setGoals={setGoals} key={index}/>
                );
              })
            }

            <div className='form-buttons form-buttons--plusminus'>
              <button
                onClick={handleRemoveGoal}
                type='button'
                className='btn form-button__btn btn__s'
                disabled={goals.length === 1}
              >
                <i className="lni lni-minus"></i>
              </button>
              <button
                onClick={handleAddGoal}
                type='button'
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

  const { i, goals, setGoals } = props;

  const handle0 = (e) => {
    const newGoals = [...goals];
    newGoals[i][0] = e.target.value;
    setGoals(newGoals);
  }

  const handle1 = (e) => {
    const newGoals = [...goals];
    newGoals[i][1] = e.target.value;
    setGoals(newGoals);
  }

  return (
    <div className='form-input-group'>
      <p className='form-label form-label--social'>Goal {`${i + 1}`}</p>
      <p className='form-info'>ETH per round</p>
      <input
        value={goals[i][0]}
        onChange={handle0}
        type='text'
        className='form-input'
        placeholder='How much ETH per round to reach this goal?'
      />
      <p className='form-info'>Description</p>
      <textarea
        value={goals[i][1]}
        onChange={handle1}
        className='form-input'
        placeholder='What will you do once you have reached this goal?'
      ></textarea>
    </div>
  );

}

export default Step4;
