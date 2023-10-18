import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar"
import { getlocalData, isSessionSet } from '../components/session';
import { getToken } from "./../components/session";
import './../css/setting.css';
import { Link, json } from "react-router-dom";
import Swal from "sweetalert2";
import './../config'

const AccountSettingPage = () => {
    document.title = "Setting";
    const ip = global.config.ip.ip;

    if (isSessionSet('session') && isSessionSet('isLoggedIn')) {
        const expDate = getlocalData('expDate');
        if (Date.now() >= expDate) {
            localStorage.clear();
            window.location.href = '/token-expired';
        } else {
            var session = getlocalData('session');
        }
    }

    const getAPI = ip + '/getUser/id?u=' + session.U_id;
    const update = ip + '/update/user/user';

    const fetchData = async () => {
        try {
            const response = await fetch(getAPI);
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        setUsername(user.U_name)
    }, []);

    const [user, setUser] = useState([]);
    const [username, setUsername] = useState(user.U_name);
    const [email, setEmail] = useState(user.U_mail);
    const [propic, setPropic] = useState(user.U_pro_pic);
    const [bannerpic, setBannerpic] = useState(user.U_banner);
    console.log(user)
    console.log(email)

    const handleUsername = (e) => {
        setUsername(e.target.value);
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handlePropic = (e) => {
        setPropic(e.target.files[0]);
    }

    const handleBanner = (e) => {
        setBannerpic(e.target.files[0]);
    }

    const sendRequest = () => {
        const formData = new FormData();
        const data = {
            'U_id': session.U_ID,
            'username': username,
            'email': email
        }

        formData.append('data', JSON.stringify(data));
        formData.append('pro', propic);
        formData.append('banner', bannerpic);

        const token = getToken();

        fetch(update, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    window.location.reload();
                }
            })
            .catch((e) => {
                console.error(e);
            })
        { console.log(data) }
    }

    return (
        <Sidebar>
            <div className="container-fluid">
                <br />

                <div className="PageTitle">
                    <h2><i className="bi bi-person-fill-gear"></i> Account Setting</h2>
                    <p>Manage your Account information!</p>
                </div>

                <div className="User-Info">
                    <div className="profilePicture">
                        <div className="card">
                            <div className="card-header">
                                <h4>Profile Picture</h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-center align-items-center">
                                        <img className="UserImg" src={`data:image/jpeg;base64, ${user.U_pro_pic}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="coverPicture py-2">
                        <div className="card">
                            <div className="card-header">
                                <h4>Banner Picture</h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-center align-items-center">
                                        <img className="UserBanner" src={`data:image/jpeg;base64, ${user.U_banner}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="UserInfomation py-2">
                        <div className="card">
                            <div className="card-header">
                                <h4>User Details</h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-4">
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="form-control form-control-lg"
                                                value={user.U_name}
                                                onChange={handleUsername}
                                            />
                                            <label htmlFor="username">Username</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating mb-4">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="form-control form-control-lg"
                                                value={user.U_mail}
                                                onChange={handleEmail}
                                            />
                                            <label htmlFor="email">E-mail</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="d-flex justify-content-center align-items-center">
                                    <button className="btn btn-primary" onClick={sendRequest}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Sidebar>
    )
}
export default AccountSettingPage;