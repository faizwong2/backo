import { useHistory } from 'react-router-dom';

const Step7 = (props) => {

  const {
    step,
    backoAddress,
  } = props;

  const history = useHistory();

  const handleView = () => {
    history.push(`/${backoAddress}`);
  }

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Backo created</p>
          <p className='create__subtitle'>Backo contract has been deployed at address {backoAddress}</p>

          <button
            onClick={handleView}
            type='button'
            className='btn margin-y-xl'
          >
            View backo page
          </button>

        </div>
      </div>
    </div>
  );
}

export default Step7;
