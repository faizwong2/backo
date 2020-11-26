

const Step1 = (props) => {

  const {
    step,
    goToNextStep,
    backoName,
    setBackoName,
    about,
    setAbout,
    twitter,
    setTwitter,
    youtube,
    setYoutube,
    telegram,
    setTelegram,
    discord,
    setDiscord,
    setImageBuffer,
    setPreviewImageUrl,
  } = props;

  const handleChangeBackoName = (e) => {
    setBackoName(e.target.value);
  }

  const handleChangeAbout = (e) => {
    setAbout(e.target.value);
  }

  const handleChangeTwitter = (e) => {
    setTwitter(e.target.value);
  }

  const handleChangeYoutube = (e) => {
    setYoutube(e.target.value);
  }

  const handleChangeTelegram = (e) => {
    setTelegram(e.target.value);
  }

  const handleChangeDiscord = (e) => {
    setDiscord(e.target.value);
  }

  const handleChangeImage = (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewImageUrl(url);
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setImageBuffer(Buffer(reader.result));
      }
    }
  }

  return (
    <div>
      <div className='container'>
        <div className='create'>
          <progress value={step} max='7'></progress>

          <p className='create__title'>Set your creator details</p>
          <p className='create__subtitle'>Let future members know who you are and what you do</p>

          <form className='form create__form'>

            <div className='form-input-group'>
              <p className='form-label'>Backo name</p>
              <input
                type='text'
                className='form-input'
                value={backoName}
                onChange={handleChangeBackoName}
              />
              <p className='form-info'>Name of your project, business, organization or yourself</p>
            </div>

            <div className='form-input-group'>
              <p className='form-label'>About</p>
              <textarea
                className='form-input'
                value={about}
                onChange={handleChangeAbout}
              ></textarea>
              <p className='form-info'>What is your backo all about? Write a description on a little bit of who you are and what you create.</p>
            </div>

            <div className='form-input-group'>
              <p className='form-label form-label--social'>Social media</p>
              <p className='form-info'>Twitter</p>
              <input
                type='text'
                className='form-input'
                placeholder='Link to Twitter page'
                value={twitter}
                onChange={handleChangeTwitter}
              />
              <p className='form-info'>Youtube</p>
              <input
                type='text'
                className='form-input'
                placeholder='Link to Youtube channel'
                value={youtube}
                onChange={handleChangeYoutube}
              />
              <p className='form-info'>Telegram</p>
              <input
                type='text'
                className='form-input'
                placeholder='Link to Telegram group'
                value={telegram}
                onChange={handleChangeTelegram}
              />
              <p className='form-info'>Discord</p>
              <input
                type='text'
                className='form-input'
                placeholder='Link to Discord server'
                value={discord}
                onChange={handleChangeDiscord}
              />
            </div>

            <div className='form-input-group'>
              <p className='form-label'>Profile image</p>
              <input
                type='file'
                onChange={handleChangeImage}
              />
              <p className='form-info'>The image that will be shown on your backo page</p>
            </div>

            <div className='form-buttons form-buttons--previousnext'>
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

export default Step1;
