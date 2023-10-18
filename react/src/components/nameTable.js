import { useState } from "react";
import ReactModal from "react-modal";
import UserEditModal from "./userEditModal";
import { getToken } from "./session";
import '../config'


const NameTable = (props) => {
    const [isOpen, setIsOpen ] = useState(false);
    const [ selectedUser, setSelectedUser ] = useState(null);
    const [ addedUser, setAddUser ] = useState([]);
    const ip = global.config.ip.ip;

    const api = ip+'/insert/user/admin';

    ReactModal.setAppElement('#root');


    const openModal = (user) => {
        setSelectedUser({
            'U_id': user.U_id,
            'U_name': user.U_name,
            'U_mail': user.U_mail,
            'U_permit': user.U_permit,
            'U_type': user.U_type,
        })
        setIsOpen(true)
      }
  
      const closeModal = () => {
        setIsOpen(false)
      }
      
      const update = () => {
        window.location.reload();
      }
  
  
      const modalStyle = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          height: 'max-content',
          backgroundColor: 'rgb(44, 48, 56)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      };

      const handleAddUser = () => {
        const users = [...addedUser];
        const tmp = {
            'U_name': '',
            'U_mail': '',
            'U_pass': '',
            'U_type': '',
            'U_permit': 1
        };
        users.push(tmp);
        console.log(users);
        setAddUser(users);
      }

      const handleSave = () => {
        const token = getToken();
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(addedUser)
        }).then(response => {
            if(response.ok) {
                window.location.reload();
            }
        }).catch(() => {});
      }


      const handleName = (e, index) => {
        e.preventDefault();
        const users = [...addedUser]
        users[index].U_name = e.target.value;
        setAddUser(users);
      }

      const handlePass = (e, index) => {
        e.preventDefault();
        const users = [...addedUser]
        users[index].U_pass = e.target.value;
        setAddUser(users);
      }

      const handleMail = (e, index) => {
        e.preventDefault();
        const users = [...addedUser]
        users[index].U_mail = e.target.value;
        setAddUser(users);
      }

      const handleType = (e, index) => {
        e.preventDefault();
        const users = [...addedUser]
        users[index].U_type = e.target.value;
        setAddUser(users);
      }

      const handlePermit = (e, index) => {
        e.preventDefault();
        const users = [...addedUser]
        users[index].U_permit = e.target.value;
        setAddUser(users);
      }

    return (
        <div>
            {/* <ul className="list-group">
                {props.users.map((user) => (
                    <li className="list-group-item" key={user.U_id}>
                        {user.U_name} 
                        {user.U_mail}
                        </li>

                ))}
            </ul> */}
            <table className="table table-striped table-dark">
                <thead>
                    <tr>
                        <th scope="col">User ID</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                        <th scope="col">User Type</th>
                        <th scope="col">Upload Permission</th>
                        <th scope="col">Video Owned</th>
                        <th scope="col">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {props.users.map((user) => (
                        <tr key={user.U_id}> 
                            <th>{user.U_id}</th>
                            <td><a href={'/profile?profile='+user.U_id} style={{color: 'white'}}>{user.U_name}</a></td>
                            <td>{user.U_mail}</td>
                            <td>{user.U_type === 'admin' ?
                                    (<div className="center" style={{backgroundColor: 'rgb(50, 128, 128)',borderRadius: '25px', marginRight: '5px', marginLeft: '5px'}}>Admin</div>)
                                    :
                                    (<div className="center" style={{borderRadius: '25px', marginRight: '5px', marginLeft: '5px'}}>User</div>)
                                }
                            </td>
                            <td>
                                {user.U_permit === 1 ? 
                                    (<div className="center" style={{backgroundColor: 'rgb(52, 128, 50)',borderRadius: '25px', marginRight: '5px', marginLeft: '5px'}}>Have Permission</div>) 
                                    : 
                                    (<div className="center" style={{backgroundColor: 'rgb(128, 50, 50)',borderRadius: '25px', marginRight: '5px', marginLeft: '5px'}}>No Permission</div>)
                                }
                            </td>
                            <td>{user.U_vid}</td>
                            <td><button className="btn btn-secondary" onClick={() => openModal(user)}>edit</button></td>
                        </tr>
                    ))}
                    {addedUser && addedUser.map((user, index) => (
                        <tr key={index}>
                            <th>new {index}</th>
                            <td>
                                <input className="form-control" type="text" placeholder="user name" defaultValue={''} onChange={(e) => handleName(e, index)}></input>
                                <input className="form-control" type="text" placeholder="password" defaultValue={''} onChange={(e) => handlePass(e, index)} style={{marginTop: '2px'}}></input>
                                </td>
                            <td><input className="form-control" type="email" placeholder="email" defaultValue={''} onChange={(e) => handleMail(e, index)}></input></td>
                            <td>
                                <div className="form-check">
                                    <input type="radio" value={'admin'} name={'type-check-'+index} onChange={(e) => handleType(e, index)} style={{ marginRight: '5px' }} />
                                    <label>Admin</label>
                                </div>
                                <div className="form-check">
                                    <input type="radio" value={'user'} name={'type-check-'+index} onChange={(e) => handleType(e, index)} style={{ marginRight: '5px' }} />
                                    <label>User</label>
                                </div>
                            </td>
                            <td>
                            <div className="form-check">
                                    <input type="radio" value={'1'} name={'permit-check-'+index} onChange={(e) => handlePermit(e, index)} style={{ marginRight: '5px' }} />
                                    <label>Have Permission</label>
                                </div>
                                <div className="form-check">
                                    <input type="radio" value={'0'} name={'permit-check-'+index} onChange={(e) => handlePermit(e, index)} style={{ marginRight: '5px' }} />
                                    <label>No Permission</label>
                                </div>
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                        
                    ))}
                <tr>
                        <td colSpan={7}>
                            <div className="center">
                            <button className="btn btn-light rounded-pill" onClick={handleAddUser} style={{margin: '5px'}}>+ add user</button>
                            {Object.keys(addedUser).length > 0 && (
                                <button className="btn btn-success rounded-pill" onClick={handleSave} style={{margin: '5px'}}>save</button>
                            )}
                            </div>
                        </td>
                    </tr>
                    
                </tbody>
            </table>

            <ReactModal isOpen={isOpen} onRequestClose={closeModal} style={modalStyle}>
                <UserEditModal data={selectedUser} closeModal={closeModal} update={update} />
            </ReactModal>
        </div>
    );
}

export default NameTable;