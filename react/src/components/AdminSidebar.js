import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getlocalData, isSessionSet } from './session';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './../css/sidebar.css';
import './../css/swal2theme.css';
import Swal from 'sweetalert2';

const AdminSidebar = ({ children }) => {
  const [search, setSearch] = useState('');
  const [searchBox, setSearchBox] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
        Swal.fire({
          title: 'Logout Completed!',
          icon: 'success'
        }).then(() => {
          localStorage.clear();
          window.location.href = '/'
        });
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
          <Link to="/admin" className='link'><div className='title ml-auto' style={{ display: searchBox ? "none" : "" }}>CS <span>Admin</span></div></Link>
          <form className='searchBox' style={{ display: searchBox ? "flex" : "", width: searchBox ? "calc(90% - 10%)" : "" }} onSubmit={Search}>
            <input type='text' placeholder='Search..' defaultValue={''} onChange={handleSearch} />
            <button onClick={Search} className='searchbtn'><i className="bi bi-search"></i></button>
          </form>

          <div className='close-btn' onClick={toggleSearchBox} style={{ display: searchBox ? "inline-block" : "none" }}>
            <i className='bi bi-x-lg'></i>
          </div>

          <div className='header-btn' style={{ display: searchBox ? "none" : "" }}>
            <div>
              <button type="button" className="bar-button hideBtn" onClick={toggleSearchBox}><span><i className="bi bi-search"></i></span></button>
              <Link to='#dropdown-menu' type="button" id="triggerId" data-bs-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"><img src={`data:image/jpeg;base64, ${session.U_pro_pic}`} alt="profile" className='user-icon' /></Link>
              <div class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="triggerId">
                <div className='UserInfo'>
                  <span><img src={`data:image/jpeg;base64, ${session.U_pro_pic}`} alt="profile" className='user-icon' /> {session.username}</span>
                </div>
                <hr class="dropdown-divider"></hr>
                <Link class="dropdown-item" to={`/profile?profile=${session.U_id}`}><span><i className="bi bi-person-circle"></i> Profile</span></Link>
                <Link class="dropdown-item" to="/"><span><i className="bi bi-house"></i> Home</span></Link>
                <hr class="dropdown-divider"></hr>
                <Link class="dropdown-item" to="/setting"><span><i className="bi bi-person-fill-gear"></i> Setting</span></Link>
                {session.U_type === 'admin' && (
                  <Link class="dropdown-item" to="/admin"><span><i className="bi bi-nut"></i> Administation</span></Link>
                )}
                <hr class="dropdown-divider"></hr>
                <Link class="dropdown-item" to="#" onClick={logoutHandler}><span><i className="bi bi-box-arrow-right"></i> Logout</span></Link>
              </div>
            </div>
          </div>
          <div class="offcanvas offcanvas-start text-bg-dark" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
            <div class="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">CS <span>Admin</span></h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/"><i className="bi bi-house"></i><span> Back to Home</span></Link>
                </li>

                <hr className='text-secondary d-md-block' />

                <li className="nav-item">
                  <Link className="nav-link active" to='/admin'><i className="bi bi-box-fill"></i><span> Dashboard</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/users"><i className="bi bi-people-fill"></i><span> Users</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/videos"><i className="bi bi-collection-play-fill"></i><span> Users Videos</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/api"><i className="bi bi-folder-symlink-fill"></i><span> Videos URL</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/tag"><i className="bi bi-tags-fill"></i><span> Tags</span></Link>
                </li>

                <hr className='text-secondary d-md-block' />

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/uploadLog"><i className="bi bi-info-circle-fill"></i><span> Upload Log</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/userLog"><i className="bi bi-info-circle-fill"></i><span> User Log</span></Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link active" to="/admin/monitor"><i className="bi bi-hdd-stack-fill"></i><span> Server Monitor</span></Link>
                </li>
              </ul>
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

export default AdminSidebar;
