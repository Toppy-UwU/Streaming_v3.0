import { useState } from "react"
import { getToken } from "./session";
import "./../config"
import Swal from "sweetalert2";
import validator from "validator";

const AddUserModal = () => {
    const ip = global.config.ip.ip;
    const api = ip + '/insert/user/admin';

    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [permit, setPermit] = useState('1');

    const handleUsername = (e) => {
        setUsername(e.target.value);
    }
    const handleEmail = (e) => {
        setEmail(e.target.value);
    }
    const handlePassword = (e) => {
        setPassword(e.target.value);
    }
    const handleRole = (e) => {
        setRole(e.target.value);
    }
    const handlePermit = (e) => {
        setPermit(e.target.value);
    }

    const handleAddUser = () => {
        const token = getToken();
        if (!username || !password || validator.isEmail(email) === false || validator.isStrongPassword(password) === false) {
            if (!username || !password) {
                Swal.fire({
                    icon: 'error',
                    title: 'Please fill out all fields',
                });
                return;
            } else if (validator.isEmail(email) === false) {
                Swal.fire({
                    icon: 'error',
                    title: 'Please fill out email fields or Check email format!',
                });
                return;
            } else if (validator.isStrongPassword(password) === false) {
                Swal.fire({
                    icon: 'error',
                    title: 'Please fill out password fields or Check password format!',
                });
                return;
            }
        }

        const u_data = [{
            'U_name': username,
            'U_mail': email,
            'U_pass': password,
            'U_permit': permit,
            'U_type': role,
        }];
        console.log(u_data)
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(u_data)
        }).then(response => {
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'User has been added!',
                    showConfirmButton: false,
                    timer: 1500,
                    didClose: () => {
                        window.location.reload();
                    }
                });
            }
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Add User failed',
                text: 'An internal server error or Email is already on the server! Please try again!',
                showConfirmButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        });
    }
    return (
        <div className="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModal" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="addUserModal">Add User</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div class="form-floating mb-4">
                            <input type="text" class="form-control" id="usernameAddModal" placeholder="Username" onChange={handleUsername} />
                            <label htmlFor="usernameAddModal">Username</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="email" class="form-control" id="emailAddModal" placeholder="E-mail" onChange={handleEmail} />
                            <label htmlFor="emailAddModal">E-mail</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="text" class="form-control" id="passwordAddModal" placeholder="Password" onChange={handlePassword} aria-describedby="passwordHelpBlock" />
                            <label htmlFor="passwordAddModal">Password</label>
                            <div id="passwordHelpBlock" class="form-text">
                                Password must be 8-20 characters long, contain at least  1 upper and lower letters, numbers and special characters.
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div class="form-floating">
                                    <select class="form-select" id="role" aria-label="select" onChange={handleRole}>
                                        <option selected value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <label htmlFor="role">Role</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div class="form-floating">
                                    <select class="form-select" id="permit" aria-label="select" onChange={handlePermit}>
                                        <option selected value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                    <label htmlFor="permit">Upload Permission</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button type="button" className="btn btn-primary" onClick={handleAddUser} data-bs-dismiss="modal">Add</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AddUserModal;