import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Home = (props) => {

  const {
    account,
  } = props

  const [search, setSearch] = useState('');
  const history = useHistory();

  const handleCreate = () => {
    history.push('/create');
  }

  const handleSearch = () => {

    if (search === '') {
      return;
    }

    history.push(`/${search}`);
  }

  const handleChangeSearch = (e) => {
    setSearch(e.target.value);
  }

  return (
    <div className='container'>

      <div className='section-l'>
        <p className='font-xxl'><b>Backo</b> is a decentralized crowdfunding membership platform</p>
        {
          account &&
          <button
            onClick={handleCreate}
            type='button'
            className='btn btn--l margin-y-xl'
          >
            Create a backo
          </button>
        }
      </div>

      <div className='section-s'>
        <p className='font-xl'>Visit a backo page and support your favorite creators</p>
        <form className='form create__form margin-y-xl'>
          <div className='form-input-group'>
            <input
              value={search}
              onChange={handleChangeSearch}
              placeholder='Enter backo address'
              type='text'
              className='form-input'
            />
            <div className='form-buttons form-buttons--previousnext'>
              <button
                onClick={handleSearch}
                type='button'
                className='btn form-button__btn'
              >
                Search backo
              </button>
            </div>
          </div>
        </form>
      </div>
      
    </div>
  );
}

export default Home;
