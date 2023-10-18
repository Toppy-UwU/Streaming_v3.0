import { Link } from 'react-router-dom';
import './../css/search.css';
function showUsers(props) {
    try {
        return (
            <div className="container-fluid">
                <div className="row">
                    {props.users.map((user) => (
                        <Link to={`/profile?profile=${user.U_id}`} className='nodecoration'>
                            <div className='showInfo'>
                                <img src={`data:image/jpeg;base64, ${user.U_pro_pic}`} alt="profile" className='user-icon' />
                                <span className='nodecoration'>{user.U_name}</span>
                                <span className='nodecoration'>{user.U_mail}</span>
                                <span className='nodecoration'>{user.U_vid} Videos</span>
                            </div>
                            <br />
                        </Link>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
    }
}

export default showUsers;