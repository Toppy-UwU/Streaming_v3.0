import { useState } from "react"
import { getToken } from "./session"
import '../config';

const UserEditModal = (props) => {
    let user = props.data
    const [username, setUsername] = useState(user.U_name)
    const [mail, setMail] = useState(user.U_mail)
    const [permit, setPermit] = useState(user.U_permit)
    const [type, setType] = useState(user.U_type)
    const ip = global.config.ip.ip;

    const api = ip+'/update/user/admin';

    const handleSubmit = () => {
        const tmp = ({
            'U_id': user.U_id,
            'U_name': username,
            'U_mail': mail,
            'U_permit': permit,
            'U_type': type
        })
        const token = getToken();
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ token
            },
            body: JSON.stringify(tmp)
        })
        .then(response => {
            if(response.ok){
                props.update();
            }
        })
        .catch((e) => {
            console.error(e);
        })

    }

    const handleName = (e) => {
        // console.log(e.target.value);
        setUsername(e.target.value);
        e.preventDefault();

    }

    const handleMail = (e) => {
        // console.log(e.target.value);
        setMail(e.target.value);
        e.preventDefault();

    }

    const handlePermit = (e) => {
        // console.log(e.target.value);
        setPermit(Number(e.target.value));
    }

    const handleType = (e) => {
        setType(e.target.value);
    }


    if (user !== null) {

        return (
            <div className='container-fluid'>
                <div className='row' style={{ color: 'white' }}>
                    <div className='col center'><h5>User {user.U_name} Setting</h5></div>
                </div>
                <div className='row'>
                    <div className='col' style={{ color: 'white' }}>
                        <form>
                            <h5>
                                <div>
                                    <label htmlFor='nameInput'>User Name</label>
                                    <input type="text" className="from-control" id="nameInput" value={username} onChange={handleName} style={{ width: '100%' }} />
                                </div>
                                <br />
                                <div>
                                    <label htmlFor='mailInput'>Email</label>
                                    <input type="email" className="from-control" id="mailInput" value={mail} onChange={handleMail} style={{ width: '100%' }} />
                                </div>
                                <br />
                                <div className="row">
                                    

                                    <div className="col">
                                        <h5>Upload Permission</h5>
                                        <input type="checkbox" value={'1'} checked={permit === 1} onChange={handlePermit} style={{marginRight: '5px'}}/>
                                        <label>Grant Permission</label>
                                        <br/>
                                        <input type="checkbox" value={'0'} checked={permit === 0} onChange={handlePermit} style={{marginRight: '5px'}}/>
                                        <label>No Permission</label>
                                    </div>
                                    <div className="col">
                                        <h5>User Type</h5>
                                        <input type="checkbox" value={'admin'} checked={type === 'admin'} onChange={handleType} style={{marginRight: '5px'}}/>
                                        <label>Admin</label>
                                        <br/>
                                        <input type="checkbox" value={'user'} checked={type === 'user'} onChange={handleType} style={{marginRight: '5px'}}/>
                                        <label>User</label>
                                    </div>
                                </div>

                            </h5>

                        </form>
                    </div>

                </div>
                <div className='row'>
                    <div className='col center'>
                        <button className='btn btn-primary rounded-pill' onClick={handleSubmit} style={{ margin: '5px' }}>save</button>
                        <button className='btn btn-danger rounded-pill' onClick={props.closeModal} style={{ margin: '5px' }}>cancle</button>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="loading" />
        )
    }
}

export default UserEditModal