import React, { useState } from 'react';
import { getToken } from "./session";
import '../config';
import './../css/modal.css'

const UserUpdate = (props) => {
    const session = props.data;
    const [username, setUsername] = useState(session.U_name);
    const [email, setEmail] = useState(session.U_mail);
    const [propic, setPropic] = useState(session.U_pro_pic);
    const [bannerpic, setBannerpic] = useState(session.U_banner);
    const [flag1, setFlag1] = useState(false)
    const [flag2, setFlag2] = useState(false)
    const [bannerImg, setBannerImg] = useState([]);
    const [propicImg, setPropicImg] = useState([]);
    const ip = global.config.ip.ip;

    const api = ip + '/update/user/user';

    const handleUsername = (e) => {
        setUsername(e.target.value);
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handlePropic = (e) => {
        setPropic(e.target.files[0]);
        setFlag1(true)
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Set the data URL as the image source
                setPropicImg(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleBanner = (e) => {
        setBannerpic(e.target.files[0]);
        setFlag2(true)
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Set the data URL as the image source
                setBannerImg(event.target.result);
            };
            reader.readAsDataURL(file);
        }

    }

    const proClick = () => {
        document.getElementById('updateProBtn').click();
    }

    const banClick = () => {
        document.getElementById('updateBanBtn').click();
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

        fetch(api, {
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
    }

    return (
        <div class="modal fade" id="UpdateUserModal" tabindex="-1" aria-labelledby="UpdateUserModal" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5 fw-bold" id="UpdateUserModal">Account Setting</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div className='ProfileSection mb-2'>
                            <div className='card'>
                                <div className='card-body'>
                                    <div className='textTitle'>
                                        <div className='row'>
                                            <div className='col-9 d-flex justify-content-start'>
                                                <p className='fw-bold'>Profile Picture</p>
                                            </div>
                                            <div className='col-3 d-flex justify-content-end' onClick={proClick}>
                                                <p><i className="bi bi-pencil-square"></i> <span>Edit</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='UpdatePicImg d-flex justify-content-center align-items-center'>
                                        <div className='row'>
                                            {!flag1 ?
                                                <img className="UserImg" src={`data:image/jpeg;base64, ${propic}`} alt='Profile' />
                                                :
                                                <img className="UserImg" src={propicImg} alt='Profile' />
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='BannerSection mb-2'>
                            <div className='card'>
                                <div className='card-body'>
                                    <div className='textTitle'>
                                        <div className='row'>
                                            <div className='col-9 d-flex justify-content-start'>
                                                <p className='fw-bold'>Banner Picture</p>
                                            </div>
                                            <div className='col-3 d-flex justify-content-end' onClick={banClick}>
                                                <p><i className="bi bi-pencil-square"></i> <span>Edit</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='UpdatePicImg d-flex justify-content-center align-items-center'>
                                        <div className='row'>
                                            {!flag2 ?
                                                <img className="BanImg" src={`data:image/jpeg;base64, ${bannerpic}`} alt='Banner' />
                                                :

                                                <img className="BanImg" src={bannerImg} alt='Banner' />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <input className="form-control-file" id="updateProBtn" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePropic} />
                        <input className="form-control-file" id="updateBanBtn" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBanner} />

                        <div className='UserSection'>
                            <div className='card'>
                                <div className='card-body'>
                                    <div className='textTitle'>
                                        <div className='row'>
                                            <div className='col-9 d-flex justify-content-start'>
                                                <p className='fw-bold'>Info</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center align-items-center'>
                                        <div className='row'>
                                            <div className="col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        name="username"
                                                        className="form-control form-control-lg"
                                                        value={username}
                                                        onChange={handleUsername}
                                                    />
                                                    <label htmlFor="username">Username</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        className="form-control form-control-lg"
                                                        value={email}
                                                        onChange={handleEmail}
                                                    />
                                                    <label htmlFor="email">E-mail</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer d-flex justify-content-center">
                        <button type="button" class="btn btn-primary" onClick={sendRequest} >Save</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserUpdate;
