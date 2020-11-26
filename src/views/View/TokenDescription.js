const TokenDescription = (props) => {

  const { tokenDescription } = props;

  return (
    <div className='card'>
      <div className='card__heading'>
        <p>Reward token description</p>
      </div>
      <div className='card__content'>
        {tokenDescription}
      </div>
    </div>
  )
}

export default TokenDescription;