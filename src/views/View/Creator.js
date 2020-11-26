const Creator = (props) => {

  const {
    handleCollect,
    collectLoading,
    canCollect,
  } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Creator</p>
      </div>
      <div className='card__content'>
        <button
          onClick={handleCollect}
          type='button'
          className='btn-wide margin-y-s'
          disabled={ !canCollect || collectLoading }
        >
          {
            collectLoading ?
            'Loading...' :
            'Collect fund'
          }
          
        </button>
      </div>
    </div>
  );
}

export default Creator;