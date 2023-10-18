import React, { useState } from 'react';
import "../css/navbar.css";
import Swal from 'sweetalert2'

const SearchNavbar = () => {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  }

  const Search = (e) => {
    e.preventDefault();
    if (search === '') {
      Swal.fire({
        icon: 'question',
        title: 'Try Again!',
        text: 'Please Enter Your Keyword to Search!',
      })
    } else {
      window.location.href = '/search?search=' + search;
    }
  }

  return (


    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="d-flex flex-grow-1 justify-content-center">
        <a className="navbar-brand text-weight-900" href='/'>
          <img src="https://it.msu.ac.th/home/assets/img/logo-it.png" width="80" height="40" className="d-inline-block align-text-middle" alt='CSlogo' />
          &nbsp;CS HUB
        </a>
        <form className="mr-2 my-auto w-50 d-inline-block order-1 flex-wrap" onSubmit={Search}>
          <div className="input-group flex-grow-1">
            <input type="text" className="form-control border border-right-0" placeholder="Search..." onChange={handleSearch} />
            <span className="input-group-text" id="basic-addon1" onClick={Search}> Search </span>
          </div>
        </form>
      </div>
    </nav>

    // <nav className="navbar navbar-dark bg-dark">
    //   <div className="container-fluid">
    //     <div className='d-flex justify-content-center align-items-center'>
    //       <a className="navbar-brand text-bold" href='/'>
    //         <img src="https://it.msu.ac.th/home/assets/img/logo-it.png" width="80" height="40" className="d-inline-block align-text-middle" />
    //         &nbsp;CS HUB
    //       </a>

    //       <form className="d-flex mx-auto" onSubmit={Search}>
    //         <div className="input-group">
    //           <input type="text" className="form-control" placeholder="Search" aria-label="Search" onChange={handleSearch} />
    //           <span className="input-group-text" id="basic-addon1" onClick={Search}> Search </span>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
    // </nav>

  );
};

export default SearchNavbar;
