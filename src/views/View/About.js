const About = (props) => {

  const { about } = props;

  return (
    <div className='card'>
      <div className='card__content'>
        {about}
      </div>
    </div>
  )
}

export default About;