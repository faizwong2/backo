

const Step6 = (props) => {

  const {
    step,
    // goToNextStep,
  } = props;

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Creating your backo</p>
          <p className='create__subtitle'>This will take a minute</p>

          <div className='spinner'>
            <div className='bounce1'></div>
            <div className='bounce2'></div>
            <div className='bounce3'></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Step6;
