import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import '../css/search.css'
import '../config';
import { Link } from "react-router-dom";
import moment from "moment";


const SearchPage = () => {
    const param = new URLSearchParams(window.location.search);
    const search = param.get('search');

    const [videos, setVideos] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);

    const ip = global.config.ip.ip;

    const api = ip + '/get/videos/search?s=' + search;
    const api_users = ip + '/get/users/search?u=' + search;

    useEffect(() => {
        document.title = `${search} | Search`;
    }, [search]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(api);
                if (response.ok) {
                    const data = await response.json();
                    setVideos(data);
                }
            } catch (error) {
                console.error("Error : ", error);
            } finally {
                setLoading1(false);
            }
        }

        fetchVideos();

        const fetchUsers = async () => {
            try {
                const response = await fetch(api_users);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Error : ", error);
            } finally {
                setLoading2(false);
            }
        }

        fetchUsers();

    }, [search]);

    return (
        <div>
            <Sidebar>
                <div className="container-fluid">
                    {loading1 && loading2 ? (
                        <div className="center">
                            <div className="loading" style={{ marginTop: '25%' }}></div>
                        </div>
                    ) : (
                        <>
                            {users && users.length > 0 && (
                                <>
                                    {users.map((user) => (
                                        <div className="showUserSearch">
                                            <Link to={"/profile?profile=" + user.U_id}><img src={`data:image/jpeg;base64, ${user.U_pro_pic}`} alt="Video-Thumnail" /></Link>
                                            <div className="text-Username">
                                                <Link to={"/profile?profile=" + user.U_id} className="noLink"><h4>{user.U_name}</h4></Link>
                                                <Link to={"/profile?profile=" + user.U_id} className="noLink"><p><span><i className="bi bi-person-fill"></i> </span>{user.U_vid} Videos &bull; {user.U_mail}</p></Link>
                                            </div>
                                            <Link to={"/profile?profile=" + user.U_id} className="searchBtn"><button type="button" class="btn btn-secondary searchBtn"><i className="bi bi-person-fill"></i> <span> View Profile</span></button></Link>
                                        </div>
                                    ))}
                                    <hr className='text-secondary d-md-block' />
                                </>
                            )}

                            {videos && videos.length > 0 && (
                                <>
                                    {videos.map((video) => (
                                        <div className="showSearch">
                                            <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode}><img src={`data:image/jpeg;base64, ${video.V_pic}`} alt="Video-Thumnail" /></Link>
                                            <div class="text-section">
                                                <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} className="noLink"><h4>{video.V_title}</h4></Link>
                                                <Link to={`/profile?profile=${video.U_ID}`} className="noLink"><p><span><i className="bi bi-person-fill"></i> </span>{video.U_name}</p></Link>
                                                <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} className="noLink"><p><span><i class="bi bi-clock"></i> </span>{moment.utc(video.V_upload).format("DD MMMM YYYY : HH:mm:ss")}</p></Link>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {loading1 === false && loading2 === false && (
                        <>
                            {users.length <= 0 && videos.length <= 0 && (
                                <>
                                    <div className={setLoading1 === true || setLoading2 === true ? 'notfound-Search d-none' : 'notfound-Search'}>
                                        <i class="bi bi-exclamation-triangle"></i>
                                        <p>Your search <b>" {search} "</b> was not found.</p>
                                        <Link to="/"><button type="button" class="btn btn-outline-primary">Back to Home</button></Link>
                                    </div>
                                </>
                            )}
                        </>
                    )
                    }

                </div>
            </Sidebar>
        </div>
    )
}

export default SearchPage