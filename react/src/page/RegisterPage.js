import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './../css/login.css';
import '../config';
import validator from 'validator';

const RegisterPage = () => {
  const ip = global.config.ip.ip;
  const api = ip + '/register';
  const navigate = useNavigate();
  document.title = "Register";

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    con_password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    if ((formData.password !== formData.con_password) ||
      (validator.isStrongPassword(formData.password) === false && validator.isStrongPassword(formData.con_password) === false) || validator.isEmail(formData.email) === false) {
      if (formData.password !== formData.con_password) {
        Swal.fire({
          title: 'Password do not match!',
          icon: 'warning'
        });
      } else if (validator.isStrongPassword(formData.password) === false && validator.isStrongPassword(formData.con_password) === false) {
        Swal.fire({
          title: 'Password is not strong password!',
          icon: 'warning'
        });
      }
      else if (validator.isEmail(formData.email) === false) {
        Swal.fire({
          title: 'Please use correctly email!',
          icon: 'warning'
        });
      }

    } else if (formData.password === formData.con_password) {
      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          Swal.fire({
            title: 'Register Completed!',
            icon: 'success',
            text: 'You will be redirected to the login page.',
            showCancelButton: false,
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/login');
            }
          });
        } else {
          Swal.fire({
            title: 'Register Fail!',
            html: 'Server error or <br>Email : ' + formData.email + '<br>is already on the server!',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error("Error : ", error);
      }
    }
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
                <img
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                  alt="login form"
                  className="img-fluid"
                />
              </div>
              <div className="col-md-6 col-lg-7 d-flex align-items-center">
                <div className="card-body p-3 p-lg-4 text-black">
                  <form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center mb-1">
                      <span className="title-Login">
                        CS <span>MSU</span>
                      </span>
                    </div>

                    <h5 className="text-white fw-normal mb-3 pb-3">Register for an account</h5>

                    <div className="form-floating mb-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control form-control-lg"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="username">Username</label>
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-lg"
                        placeholder="E-Mail"
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">E-Mail</label>
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control form-control-lg"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="password">Password</label>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        id="con_password"
                        name='con_password'
                        className="form-control form-control-lg"
                        placeholder="Confirm Password"
                        aria-describedby='passwordHelpBlockRegis'
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="con_password">Confirm Password</label>
                      <div id="passwordHelpBlockRegis" className="form-text text-white py-1">
                        <i className="bi bi-info-circle-fill"></i> Password must be more than 8 characters long, contain at least  1 upper and lower letters, numbers and special characters.
                      </div>
                    </div>

                    <div className="pt-1 mb-4 px-0">
                      <button className="btn btn-primary btn-lg btn-block w-100" type="submit">
                        Register
                      </button>
                    </div>

                    <p className="pb-lg-2 text-white">
                      Already have an account?{' '}
                      <Link to="/login" className="text-blue text-decoration-none">
                        &nbsp;Login
                      </Link>
                    </p>
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

export default RegisterPage;
