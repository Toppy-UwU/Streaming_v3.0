import '../css/video.css'
import { Link } from 'react-router-dom';
import moment from 'moment';

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let formattedTime = '';
    if (hours > 0) {
        formattedTime += `${hours}:`;
    }
    formattedTime += `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    return formattedTime;
}

function ShowVideos(props) {
    try {
        return (
            <div className="container-fluid">
                <div className="row">
                    {props.videos.map((video) => (
                        <div className="col-lg-3 col-md-4 col-sm-6 mb-3" key={video.V_ID}>
                            <div className="video-card">
                                <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} className='LinkStyle'>
                                    <div className='imgcard'>
                                        <img className="card-img-top" src={'data:image/jpeg;base64,' + video.V_pic} alt={video.V_title + ' thumbnail'} />
                                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'black', borderRadius: '4px', padding: '4px' }}>
                                            <h6>{formatTime(video.V_length)}</h6>
                                        </div>
                                    </div>
                                </Link>
                                <div className='vidInfo'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} className='LinkStyle'>
                                                <h6>{video.V_title}</h6>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className='UserVid'>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <Link to={'/profile?profile=' + video.U_ID} className='LinkStyle'>
                                                    <h6>{video.U_name}</h6>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <Link to={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} className='LinkStyle'>
                                                    <h6>{video.V_view} views • {moment(video.V_upload).format("DD MMM YYYY : HH:mm:ss")}</h6>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    } catch (error) {
        return (
            <div className='center'>
                <div className='loading' />
            </div>
        )
    }
}

export default ShowVideos;