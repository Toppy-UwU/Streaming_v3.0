import React, { useEffect, useState } from 'react';
import { isSessionSet, getlocalData } from '../components/session';

import Sidebar from '../components/sidebar';
import UserUpdate from '../components/userUpdateModal';
import './../css/profile.css';
import './../css/modal.css';
import GetVideo from '../components/getVideo';
import '../config'
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const param = new URLSearchParams(window.location.search);
  const U_id = param.get('profile');
  const ip = global.config.ip.ip;

  const getAPI = ip + '/getUser/id?u=' + U_id;
  const [user, setUser] = useState(null);
  let [currentComp, setCurrentComp] = useState('public');
  const [chk, setChk] = useState(false);
  const session = isSessionSet('token') ? getlocalData('session') : { U_id: null };
  const [chkUser, setChkUser] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(getAPI);

        if (!response.ok) {
          setChk(true);
          console.log("test err 500")
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error:', error);
        setChkUser(true);
      }
    };

    fetchUserData();
  }, [getAPI])

  useEffect(() => {
    if (user) {
      document.title = user.U_name + ' | Profile';
    }
  }, [user]);


  if (user === null) {
    if (chkUser === true) {
      document.title = 'Not Found!';
      return (
        <Sidebar>
          <div className='notfound-vid'>
            <i className="bi bi-person-fill-x"></i>
            <p>User not found!</p>
            <Link to="/"><button type="button" className="btn btn-outline-primary">Back to Home</button></Link>
          </div>
        </Sidebar>
      )
    } else {
      return (
        <Sidebar>
          <div className="center">
            <div className="loading" style={{ marginTop: '25%' }}></div>
          </div>
        </Sidebar>
      )
    }
  }

  if (user || chk) {

    const buttonHandler = (btnId) => {
      setCurrentComp(btnId);
    };

    return (
      <Sidebar>
        <div className='container-fluid'>
          <div className="profile-header">
            <img src={`data:image/jpeg;base64, ${user.U_banner}`} alt="cover" className="cover-photo" />
            <img src={`data:image/jpeg;base64, ${user.U_pro_pic}`} alt="profile" className="profile-photo" />
            <h2 className="user-details">{user.U_name}</h2>
            <p className="user-details"><i className="bi bi-envelope-at-fill"></i> : {user.U_mail} <br /> <i className="bi bi-play-btn-fill"></i> : {user.U_vid} Videos | <i className="bi bi-hdd-stack-fill"></i> : {user.U_storage >= 1024 ? `${(user.U_storage / 1024).toFixed(2)} GB`: `${user.U_storage} MB`} Used</p>

            {session.U_id === user.U_ID && (
              <button type="button" className="setting-button" data-bs-toggle="modal" data-bs-target="#UpdateUserModal">
                <i className="bi bi-gear"></i> &nbsp;
                EDIT ACCOUNT
              </button>
            )}

            <UserUpdate data={user} />

          </div>

          <hr className='text-secondary d-md-block' />

          {session.U_id === user.U_ID ?
            <ul className="nav d-flex">
              <li className="nav-item">
                <button className="setting-button" onClick={() => buttonHandler('public')}>
                  Public Video
                </button>
              </li>
              <li className="nav-item">
                <button className="setting-button" onClick={() => buttonHandler('unlisted')}>
                  Unlisted Video
                </button>
              </li>
              <li className="nav-item">
                <button className="setting-button" onClick={() => buttonHandler('private')}>
                  Private Video
                </button>
              </li>
            </ul>
            :
            <ul className="nav nav-underline d-flex justify-content-center">
              <li className="nav-item">
                <button className="setting-button" onClick={() => buttonHandler('public')}>
                  Public Video
                </button>
              </li>
            </ul>
          }
          <div style={{ marginTop: '20px' }}>
            <GetVideo permit={currentComp} user={user.U_ID} />
          </div>
        </div>
      </Sidebar >
    );
  } else {
    return (
      <div>
        {chk && (
          <Sidebar>
            <div className='container-fluid d-flex justify-content-center'>
              <div>
                No User have ID = {U_id}
              </div>
            </div>
          </Sidebar>
        )}
      </div>
    );
  }

};

export default ProfilePage;