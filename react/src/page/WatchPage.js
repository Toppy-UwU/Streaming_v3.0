
import Sidebar from '../components/sidebar';
import VideoPlayer from '../components/player';
import { getAPI } from '../components/callAPI';
import 'video.js/dist/video-js.css';
import { useState, useEffect } from 'react';
import { checkVidPermit, getUser, isAdmin, isSessionSet, getToken, getlocalData } from '../components/session';
import VideoUpdateModal from '../components/videoUpdateModal';
import { createHistory } from '../components/saveHistories';
import '../config';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import '../css/watch.css'
import '../css/swal2theme.css'
import Swal from 'sweetalert2';
import '../config';

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

function formatTimeDifference(pastTime) {
    const currentTime = new Date();
    const timeDifferenceInSeconds = Math.floor((currentTime - pastTime) / 1000);

    if (timeDifferenceInSeconds < 60) {
        return 'just now';
    } else if (timeDifferenceInSeconds < 3600) {
        const minutes = Math.floor(timeDifferenceInSeconds / 60);
        return `${minutes} min ago`;
    } else if (timeDifferenceInSeconds < 86400) {
        const hours = Math.floor(timeDifferenceInSeconds / 3600);
        return `${hours} hour ago`;
    } else if (timeDifferenceInSeconds < 604800) {
        const days = Math.floor(timeDifferenceInSeconds / 86400);
        return `${days} day ago`;
    } else if (timeDifferenceInSeconds < 2419200) {
        const weeks = Math.floor(timeDifferenceInSeconds / 604800);
        return `${weeks} week ago`;
    } else if (timeDifferenceInSeconds < 29030400) {
        const months = Math.floor(timeDifferenceInSeconds / 2419200);
        return `${months} month ago`;
    } else {
        const years = Math.floor(timeDifferenceInSeconds / 29030400);
        return `${years} year ago`;
    }
}

const WatchPage = () => {
    const param = new URLSearchParams(window.location.search);
    const [videos, setVideos] = useState(null); //show video
    const [vidDetail, setVidDetail] = useState(null); // played video data
    const [showDesc, setshowDesc] = useState(false);
    const [url, setUrl] = useState('');

    const user = param.get('u');
    const video = param.get('v');
    var flag = true
    const c_user = getUser();
    const ip = global.config.ip.ip;
    const ipws = global.config.ip.ipws;
    const navigate = useNavigate();

    const api = ip + '/get/video/info?v=' + video + '&u=' + c_user;
    let dynamicAPI = ''

    useEffect(() => {
        let tmp_U_id = '';
        let header = {};

        if (isSessionSet('isLoggedIn')) {
            const session = getlocalData('session');
            tmp_U_id = session.U_id;
            dynamicAPI = ip + '/get/dynamicUrl/token'
            header = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            }

        } else {
            tmp_U_id = 0;
            dynamicAPI = ip + '/get/url/no_login'
            header = {
                'Content-Type': 'application/json',
            }
        }

        const tmp = {
            'vid_url': '/watch?u=' + user + '&v=' + video,
            'U_id': tmp_U_id
        }
        fetch(dynamicAPI, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(tmp)

        }).then(response => response.json())
            .then(data => {
                setUrl(data.url)
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        fetch(api)
            .then(response => response.json())
            .then(data => {
                setVidDetail(data);
                if (isSessionSet('session') && flag) {
                    const history = {
                        'U_id': c_user,
                        'V_id': data.V_ID
                    }
                    createHistory(history)
                    flag = false
                }
            })
            .catch(e => {
                console.error('Error:', e);
            })
    }, [api])

    useEffect(() => {
        getAPI('videosPublic')
            .then(response => {
                setVideos(response);
            });
    }, [])

    useEffect(() => {
        if (vidDetail) {
            document.title = vidDetail.V_title;
        }
    }, [vidDetail]);

    const handleDownloadBtn = (e) => {
        const downloadAPI = ip + '/download?u=' + vidDetail.U_folder + '&v=' + vidDetail.V_encode;
        Swal.fire({
            title: 'Download',
            text: 'Click Download to start convert',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Download',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return fetch(downloadAPI)
                    .then(response => {
                        if (response.ok) {
                            return response.blob();
                        }
                    })
                    .then(blob => {
                        const downloadUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = vidDetail.V_title + '.mp4';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        return true;
                    })
                    .catch(e => {
                        console.error('Error:', e);
                        Swal.showValidationMessage(`Download failed: ${e}`);
                        return false;
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Converted!',
                        text: 'The video has been successfully converted.',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true
                    });

                    deleteDownload();
                }
            });
    }

    const deleteDownload = () => {
        fetch((ip + '/delete/download?u=' + vidDetail.U_folder + '&v=' + vidDetail.V_encode), {
            method: 'GET'
        }).catch(e => { })
    }


    const handleShare = () => {
        const value = ipws + "/watch?u=" + vidDetail.U_folder + "&v=" + vidDetail.V_encode;
        Swal.fire({
            title: 'Share URL',
            text: value,
            confirmButtonText: 'Copy',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(value)
                    .then(() => {
                        Swal.fire({
                            title: 'Copied!',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    })
                    .catch((error) => {
                        console.error('Unable to copy: ', error);
                    });
            }
        });
    }

    const handleAPI = () => {
        Swal.fire({
            title: 'API for other app',
            text: url,
            confirmButtonText: 'Copy',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(url)
                    .then(() => {
                        Swal.fire({
                            title: 'Copied!',
                            text: 'API has been copied to the clipboard.',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    })
                    .catch((error) => {
                        console.error('Unable to copy: ', error);
                    });
            }
        });
    }

    const handleDeleteVideoDialog = () => {
        Swal.fire({
            title: 'Are you sure to delete?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete();
            }
        })
    }

    const handleDelete = () => {
        const tmp = {
            'U_id': vidDetail.U_ID,
            'U_folder': vidDetail.U_folder,
            'V_encode': vidDetail.V_encode
        }

        fetch(ip + '/delete/video/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(tmp)
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: "Deleted!",
                        showConfirmButton: false,
                        timer: 2000,
                        didClose: (
                            navigate('/')
                        )
                    })
                }
            })
            .catch((e) => { })
    }

    const handleDesc = () => {
        setshowDesc(!showDesc);
    };

    if (videos && vidDetail) {
        const f1 = checkVidPermit(vidDetail.U_ID)
        const f2 = isAdmin()

        return (
            <Sidebar>
                <div className='container-fluid play-container'>
                    <div className='row'>
                        {f1 || vidDetail.V_permit === 'public' || vidDetail.V_permit === "unlisted" ? (
                            <>
                                <div className='play-video'>
                                    <VideoPlayer source={url} V_id={vidDetail.V_ID} watchTime={vidDetail.watchTime} />
                                    <div className='tags'>
                                        {vidDetail.tags.map((tag, index) => (
                                            <Link to={"/tag?tag=" + tag.T_name}>#{tag.T_name}</Link>
                                        ))}
                                    </div>
                                    <h6>{vidDetail.V_title}</h6>
                                    <div className='owner-info'>
                                        <Link to={`/profile?profile=${vidDetail.U_ID}`}><img src={`data:image/jpeg;base64, ${vidDetail.U_pro_pic}`} alt='profile' /></Link>
                                        <Link to={`/profile?profile=${vidDetail.U_ID}`} className='none-link'><p>{vidDetail.U_name}</p></Link>
                                        <div></div>
                                        <i className="bi bi-three-dots-vertical" data-bs-toggle="dropdown"></i>
                                        <ul className="dropdown-menu dropdown-menu-dark">
                                            <li><button className="dropdown-item" type="button" onClick={handleShare}><i className="bi bi-share"></i> Share</button></li>
                                            <li><button className="dropdown-item" type="button" onClick={handleDownloadBtn}><i className="bi bi-download"></i> Download</button></li>
                                            <li>
                                                <button className="dropdown-item" type="button" onClick={handleAPI}><i className="bi bi-link"></i> Get API</button>
                                            </li>
                                            {(f1 || f2) &&
                                                <li>
                                                    <button className="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#UpdateVideoModal"><i className="bi bi-gear"></i> Setting</button>
                                                </li>
                                            }
                                            {(f1 || f2) &&
                                                <li>
                                                    <button className="dropdown-item" type="button" onClick={handleDeleteVideoDialog}><i className="bi bi-trash"></i> Delete</button>
                                                </li>
                                            }
                                        </ul>
                                        <VideoUpdateModal id={vidDetail.U_ID} V_id={vidDetail.V_ID} desc={vidDetail.V_desc} title={vidDetail.V_title} permit={vidDetail.V_permit} path={vidDetail.U_folder} encode={vidDetail.V_encode} tags={vidDetail.tags} />
                                    </div>

                                    <div className='vid-info'>
                                        <div className="card">
                                            <div className="card-body">
                                                <p className="card-title">{vidDetail.V_view} Views &bull; {moment.utc(vidDetail.V_upload).format("DD MMMM YYYY : HH:mm:ss")}&nbsp;
                                                    {vidDetail.tags.map((tag) => (
                                                        <Link to={"/tag?tag=" + tag.T_name} className='none-link'>#{tag.T_name}&nbsp;</Link>
                                                    ))}</p>
                                                {vidDetail.V_desc.length !== 0 ? (
                                                    <>
                                                        {console.log(vidDetail.V_desc.length)}
                                                        <p className={showDesc ? 'card-textopen' : 'card-text'}>{vidDetail.V_desc}</p>
                                                        {vidDetail.V_desc.length >= 80 &&
                                                            <>
                                                                <hr className='text-secondary d-md-block' />
                                                                <button type='button' onClick={handleDesc}> {showDesc ? "Show Less" : "Show More"}</button>
                                                            </>
                                                        }
                                                    </>
                                                ) : (
                                                    <p className='card-text'>- No Video Description -</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <hr className='text-secondary d-md-block' />
                                </div>
                                <div className='right-bar'>
                                    <div className='suggest-bar'>
                                        <p><i className="bi bi-play-btn"></i> Other Videos</p>
                                        <hr className='text-secondary d-md-block' />
                                    </div>
                                    {videos.map((video) => (
                                        <a href={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} style={{ textDecoration: 'none' }}>
                                            <div className='side-list' key={video.V_ID}>
                                                <div className='smallThumnail'>
                                                    <img src={`data:image/jpeg;base64, ${video.V_pic}`} alt='video-cover' />
                                                    <p>{formatTime(video.V_length)}</p>
                                                </div>
                                                <div className='suggest-info'>
                                                    <h4>{video.V_title}</h4>
                                                    <p>{video.U_name} <br /> {video.V_view} Views &bull; {moment.utc(video.V_upload).format("DD MMM YYYY : HH:mm")}</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className='notfound-vid'>
                                <i className="bi bi-camera-video-off"></i>
                                <p>This video is unavailable or private.</p>
                                <Link to="/"><button type="button" className="btn btn-outline-primary">Back to Home</button></Link>
                            </div>
                        )}
                    </div>
                </div>
            </Sidebar>
        );
    } else {
        return (
            <div>
                <Sidebar>
                    <div className='center'>
                        <div className='loading' />
                    </div>
                </Sidebar>
            </div>
        )
    }
}
export default WatchPage;