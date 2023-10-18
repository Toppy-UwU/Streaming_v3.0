import { useEffect, useState } from "react"
import { getToken } from "./session";
import Swal from "sweetalert2";
import "./../config"

const UpdateUserModal = (props) => {
    const ip = global.config.ip.ip;
    const api = ip + '/update/user/admin';
    const u_data = props.data;

    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);
    const [permit, setPermit] = useState(null);

    useEffect(() => {
        setUsername(u_data.U_name)
        setEmail(u_data.U_mail)
        setRole(u_data.U_type)
        setPermit(u_data.U_permit)
    }, [u_data])

    const handleUsername = (e) => {
        setUsername(e.target.value);
    }
    const handleEmail = (e) => {
        setEmail(e.target.value);
    }
    const handleRole = (e) => {
        setRole(e.target.value);
    }
    const handlePermit = (e) => {
        setPermit(e.target.value);
    }


    const handleUpdateUser = () => {
        const token = getToken();
        if ((username === '' || email === '') || (username === '' && email === '')) {
            Swal.fire({
                icon: 'error',
                title: 'Please fill all fields!',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }
        const data = {
            'U_id': u_data.U_id,
            'U_name': username,
            'U_mail': email,
            'U_permit': permit,
            'U_type': role,
        };
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                Swal.fire({
                    title: 'Updated!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    didClose: () => {
                        window.location.reload();
                    }
                })
            }
        }).catch(() => { });
    }

    return (
        <div className="modal fade" id="updateUserModal" tabindex="-1" aria-labelledby="updateUserModal" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="updateUserModal">Update User</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div class="form-floating mb-4">
                            <input type="text" class="form-control" id="username" name="username" value={username} onChange={handleUsername} />
                            <label htmlFor="username">Username</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="email" class="form-control" id="email" name="email" value={email} onChange={handleEmail} />
                            <label htmlFor="email">E-mail</label>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div class="form-floating">
                                    <select class="form-select" id="role" aria-label="select" value={role} onChange={handleRole}>
                                        <option selected value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <label htmlFor="role">Role</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div class="form-floating">
                                    <select class="form-select" id="permit" aria-label="select" value={permit} onChange={handlePermit}>
                                        <option selected value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                    <label htmlFor="permit">Upload Permission</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button type="button" className="btn btn-primary" onClick={handleUpdateUser} data-bs-dismiss="modal">Update</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UpdateUserModal;