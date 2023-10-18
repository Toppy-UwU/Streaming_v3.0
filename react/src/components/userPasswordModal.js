import React, { useState } from "react";
import { getToken, getlocalData } from "./session";
import Swal from "sweetalert2";
import { ip } from "../config";
import validator from "validator";

const UpdatePasswordModal = () => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');

    const handleOldPassChange = (event) => {
        setOldPass(event.target.value);
    };

    const handleNewPassChange = (event) => {
        setNewPass(event.target.value);
    };

    const handleConfirmNewPassChange = (event) => {
        setConfirmNewPass(event.target.value);
    };

    const handleReset = () => {
        if (oldPass === "" || newPass === "" || confirmNewPass === "") {
            Swal.fire({
                icon: 'error',
                title: 'Please fill all fields',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        } else if (validator.isStrongPassword(newPass) === false) {
            Swal.fire({
                icon: 'error',
                title: 'Please use strong password format!',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        if (newPass === confirmNewPass) {
            const session = getlocalData('session');
            const data = {
                "U_ID": session.U_id,
                "email": session.email,
                "old_password": oldPass,
                "new_password": newPass,
            }

            Swal.fire({
                title: 'Confirm to change password',
                icon: 'question',
                showConfirmButton: true,
                showCancelButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(ip.ip + '/password/reset', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + getToken()
                        },
                        body: JSON.stringify(data)
                    }).then(response => {
                        if (response.ok) {
                            Swal.fire({
                                title: 'Password changed',
                                icon: 'success',
                                showConfirmButton: true,
                            })
                            window.location.reload();
                        }
                    }).catch(() => { })
                }
            })

        } else {
            Swal.fire({
                title: 'New password doesn\'t match',
                icon: 'warning',
                showCloseButton: true,
            })
        }
    };

    return (
        <div className="modal fade" id="UpdatePasswordModal" tabIndex="-1" aria-labelledby="UpdatePasswordModal" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5 fw-bold" id="UpdatePasswordModal">Password Setting</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="VideoDataInput">
                            <div className="form-floating mb-4">
                                <input type="password" className="form-control" placeholder="Current Password" value={oldPass} onChange={handleOldPassChange} required />
                                <label htmlFor="floatingInput">Current Password</label>
                            </div>
                            <hr />
                            <div className="form-floating mb-4">
                                <input type="password" className="form-control" placeholder="New Password" value={newPass} onChange={handleNewPassChange} required />
                                <label htmlFor="floatingInput">New Password</label>
                            </div>
                            <div className="form-floating mb-2">
                                <input type="password" className="form-control" placeholder="Confirm New Password" value={confirmNewPass} onChange={handleConfirmNewPassChange} required aria-describedby="passwordHelpBlock"/>
                                <label htmlFor="floatingInput">Confirm New Password</label>
                                <div id="passwordHelpBlock" class="form-text">
                                <i className="bi bi-info-circle-fill"></i> Password must be 8-20 characters long, contain at least  1 upper and lower letters, numbers and special characters.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button type="button" className="btn btn-primary" onClick={handleReset} data-bs-dismiss="modal">Save</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordModal;
