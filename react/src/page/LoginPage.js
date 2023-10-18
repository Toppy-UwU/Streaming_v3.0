import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { setlocalData, isSessionSet } from '../components/session';
import './../css/login.css';
import './../css/swal2theme.css';
import '../config';
import Swal from 'sweetalert2';

const LoginPage = () => {

  const ip = global.config.ip.ip;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  document.title = "Login";
  // login API
  const api = ip + '/login';

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleShowPass = () => {
    setShowPass(!showPass);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    var checkbox = document.getElementById('checkBox');
    const loginData = {
      email: email,
      password: password,
      check: checkbox.checked ? 1 : 0,
    };

    if (email !== '' || password !== '') {
      const expDate = new Date();
      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        if (response.ok) {
          const data = await response.json();
          //set log
          const tmp = {
            'U_id': data.data.U_id,
            'action': 'login',
          }
          fetch(ip + '/insert/log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tmp)
          }).catch(error => { });
          if (data.status === 'success') {
            if (checkbox.checked) {
              expDate.setDate(expDate.getDate() + 30);
            } else {
              expDate.setSeconds(expDate.getSeconds() + 86400);
            }

            setlocalData('session', data.data);
            setlocalData('isLoggedIn', true);
            setlocalData('token', data.token);
            setlocalData('expDate', expDate.getTime());

            window.location.href = '/';
          } else if (data.status === 'fail') {
            Swal.fire({
              icon: 'error',
              title: 'Login Fail!',
              text: 'Please correctly enter email and password!',
              footer: '<a href="/register">Register?</a>',
              showCancelButton: false,
              confirmButtonText: 'OK',
            });
          }
        } else {
          console.log('Login failed');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        text: 'Please correctly enter email and password!',
        footer: '<a href="/register">Register?</a>',
      });
    }
  };

  if (isSessionSet('isLoggedIn')) {
    window.location.href = '/';
  }

  return (
    <div className="container-fluid background-container py-3">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col col-xl-8">
          <div className="card text-bg-dark">
            <div className="card-header">
              <Link to="/" className="text-decoration-none text-white fw-bold">
                <i className="bi bi-arrow-left"></i> <i className="bi bi-house"></i> Back to Home
              </Link>
            </div>
            <div className="row g-0">
              <div className="col-md-6 col-lg-5 d-none d-md-block">
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                  alt="login form" className="img-fluid" />
              </div>
              <div className="col-md-6 col-lg-7 d-flex align-items-center">
                <div className="card-body p-4 p-lg-5 text-black">
                  <form onSubmit={handleSubmit}>

                    <div className="d-flex align-items-center mb-3 pb-1">
                      <span className="title-Login">CS <span>MSU</span></span>
                    </div>

                    <h5 className="text-white fw-normal mb-3 pb-3">Login to your account</h5>

                    <div className="form-floating mb-4">
                      <input type="email" id="emailInput" className="form-control form-control-lg" placeholder="E-Mail" onChange={handleEmailChange} required />
                      <label for="emailInput">E-Mail</label>
                    </div>

                    <div className="form-floating mb-4">
                      <input type={showPass? 'text':'password'} id="passwordInput" className="form-control form-control-lg" placeholder="Password" onChange={handlePasswordChange} required />
                      <label for="passwordInput">Password</label>
                    </div>

                    <div className="form-outline mb-4">
                      <div className='d-flex justify-content-between'>
                        <div className='Remember'>
                          <input type="checkbox" className="form-check-input" id="checkBox" />
                          <label className="form-check-label" id="RemMe" htmlFor="chackBox"><span className='text-white'>&nbsp;Remember Me</span></label>
                        </div>
                        <div className="ShowPassbox">
                          <i className={showPass? "bi bi-eye-slash-fill text-white":"bi bi-eye-fill text-white"} onClick={handleShowPass}></i>
                          <label className="form-check-label" id="showPassLogin" htmlFor="chackBox" onClick={handleShowPass}><span className='text-white'>&nbsp;Show Password</span></label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 mb-4 px-0">
                      <button className="btn btn-primary btn-lg btn-block w-100" type="submit">Login</button>
                    </div>

                    <p className="mb-5 pb-lg-2 text-white">Don't have an account? <Link to="/register"
                      className='text-blue text-decoration-none'> &nbsp;Register here</Link></p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;