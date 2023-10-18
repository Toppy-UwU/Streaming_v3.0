import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getlocalData, isSessionSet } from './session';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './../css/sidebar.css';
import './../css/swal2theme.css';
import Swal from 'sweetalert2';
import '../config';

const Sidebar = ({ children }) => {
  const [search, setSearch] = useState('');
  const [searchBox, setSearchBox] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const ip = global.config.ip.ip;

  const toggleSearchBox = () => {
    setSearchBox(!searchBox);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  }

  const Search = (e) => {
    e.preventDefault();
    if (search.trim() === '') {
      return;
    }
    window.location.href = '/search?search=' + encodeURIComponent(search);
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth > 768) {
      setSearchBox(false);
    } else {
      return;
    }
  }, [windowWidth]);

  const logoutHandler = (e) => {
    Swal.fire({
      title: 'Are you need to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        const tmp = {
          'U_id': session.U_id,
          'action': 'logout',
        }
        fetch(ip + '/insert/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tmp)
        }).catch(error => { });
        Swal.fire({
          title: 'Logout Completed!',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            localStorage.clear();
            window.location.href = '/'
          }
        })
      }
    })
  }

  if (isSessionSet('session') && isSessionSet('isLoggedIn')) {
    const expDate = getlocalData('expDate');
    if (Date.now() >= expDate) {
      localStorage.clear();
      window.location.href = '/token-expired';
    } else {
      var session = getlocalData('session');
      var isLoggedIn = getlocalData('isLoggedIn');
    }
  }

  return (
    <div className='BarComponent'>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <div className='sidebar-btn ml-auto' style={{ display: searchBox ? "none" : "" }}>
            <Link to="#offcanvasNavbar" data-bs-toggle="offcanvas" className='no-text-decoration'>
              <i id="navbtn" className="bi bi-list" aria-hidden="true"></i>
            </Link>
          </div>
          <Link to="/" className='link'><div className='title ml-auto' style={{ display: searchBox ? "none" : "" }}>CS <span>MSU</span></div></Link>
          <form className='searchBox' style={{ display: searchBox ? "flex" : "", width: searchBox ? "calc(90% - 10%)" : "" }} onSubmit={Search}>
            <input type='text' placeholder='Search..' defaultValue={''} onChange={handleSearch} />
            <button onClick={Search} className='searchbtn'><i className="bi bi-search"></i></button>
          </form>

          <div className='close-btn' onClick={toggleSearchBox} style={{ display: searchBox ? "inline-block" : "none" }}>
            <i className='bi bi-x-lg'></i>
          </div>

          <div className='header-btn' style={{ display: searchBox ? "none" : "" }}>
            {isLoggedIn ? (
              <div>
                <button type="button" className="bar-button hideBtn" onClick={toggleSearchBox}><span><i className="bi bi-search"></i></span></button>
                {session.U_permit === 1 &&
                  <Link to="/upload" className="no-text-decoration"><button type="button" className="bar-button"><i className="bi bi-cloud-upload"></i> <span className="spanSMHide fs-6">Upload</span></button></Link>
                }
                <Link to='#dropdown-menu' type="button" id="triggerId" data-bs-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false"><img src={`data:image/jpeg;base64, ${session.U_pro_pic}`} alt="profile" className='user-icon' /></Link>
                <div className="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="triggerId">
                  <div className='UserInfo'>
                    <Link to={`/profile?profile=${session.U_id}`} className='text-decoration-none text-white'><span><img src={`data:image/jpeg;base64, ${session.U_pro_pic}`} alt="profile" className='user-icon' />{session.username}</span></Link>
                  </div>
                  <hr className="dropdown-divider"></hr>
                  <Link className="dropdown-item" to={`/profile?profile=${session.U_id}`}><span><i className="bi bi-person-circle"></i> Profile</span></Link>
                  <Link className="dropdown-item" to="/"><span><i className="bi bi-house"></i> Home</span></Link>
                  <Link className="dropdown-item" to="/setting"><span><i className="bi bi-person-fill-gear"></i> Setting</span></Link>
                  {session.U_type === 'admin' && (
                    <Link className="dropdown-item" to="/admin"><span><i className="bi bi-nut"></i> Administation</span></Link>
                  )}
                  <hr className="dropdown-divider"></hr>
                  <Link className="dropdown-item" to="#" onClick={logoutHandler}><span><i className="bi bi-box-arrow-right"></i> Logout</span></Link>
                </div>
              </div>
            ) : (
              <div>
                <button type="button" className="bar-button hideBtn" onClick={toggleSearchBox}><span><i className="bi bi-search"></i></span></button>
                <Link to="/"><button type="button" className="bar-button add"><span><i className="bi bi-house"></i></span></button></Link>
                <Link to="/login"><button type="button" className="bar-button"><i className="bi bi-box-arrow-in-right"></i><span className='spanSMHide'> Login</span></button></Link>
              </div>
            )}
          </div>
          <div className="offcanvas offcanvas-start text-bg-dark" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">CS <span>FLIX</span></h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              {isLoggedIn ? (
                <>
                  <ul className="navbar-nav">
                    {session.U_type === 'admin' && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link active" to="/admin"><i className="bi bi-nut"></i><span> Administation</span></Link>
                        </li>
                        <hr className='text-secondary d-md-block' />
                      </>
                    )}

                    <li className="nav-item">
                      <Link className="nav-link active" aria-current="page" to="/"><i className="bi bi-house"></i><span> Home</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to={`/profile?profile=${session.U_id}`}><i className="bi bi-person"></i><span> Profile</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="/videos"><i className="bi bi-camera-video"></i><span> Videos</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="/history"><i className="bi bi-clock-history"></i><span> History</span></Link>
                    </li>

                    <hr className='text-secondary d-md-block' />

                    {session.U_permit === 1 && (
                      <li className="nav-item">
                        <Link className="nav-link active" to="/upload"><i className="bi bi-cloud-upload"></i><span> Upload</span></Link>
                      </li>
                    )}

                    {session.U_permit === 1 && (
                      <li className="nav-item">
                        <Link className="nav-link active" to="/videosStatus"><i className="bi bi-list-ul"></i><span> Upload Status</span></Link>
                      </li>
                    )}

                    <hr className='text-secondary d-md-block' />

                    <li className="nav-item">
                      <Link className="nav-link active" to="/log"><i className="bi bi-info-circle"></i><span> Log</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="/stats"><i className="bi bi-graph-up"></i><span> Statistics</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="/api"><i className="bi bi-folder-symlink"></i><span> Videos URL</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="/setting"><i className="bi bi-person-fill-gear"></i><span> Setting</span></Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link active" to="#" onClick={logoutHandler}><i className="bi bi-box-arrow-right"></i><span> Logout</span></Link>
                    </li>
                  </ul>
                </>
              ) : (
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className="nav-link active" to="/"><i className="bi bi-house"></i><span> Home</span></Link>
                  </li>

                  <hr className='text-secondary d-md-block' />

                  <li className="nav-item">
                    <Link className="nav-link active" to="/login"><i className="bi bi-box-arrow-in-right"></i><span> Log In</span></Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link active" to="/register"><i className="bi bi-house"></i><span> Register</span></Link>
                  </li>

                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className='childrenComponent'>
        {children}
      </div>
    </div>
  );
}

export default Sidebar;
