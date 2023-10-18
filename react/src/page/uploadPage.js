import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import './../css/utilities.css';
import './../css/upload.css';
import Sidebar from "../components/sidebar";
import ProgressBar from "../components/progressBar";
import { getAPI } from "../components/callAPI";
import '../config'

import { getlocalData, isSessionSet } from "../components/session";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {

    var session
    var token
    const navigate = useNavigate();
    const ip = global.config.ip.ip;
    document.title = "Upload Video";

    if (isSessionSet('token')) {
        session = getlocalData('session');
        token = getlocalData('token')
    }

    const uploadAPI = ip + '/upload';
    const [file, setFile] = useState();
    const [vidDesc, setVidDesc] = useState('');
    const [upProgress, setUpProgress] = useState('0');
    const [vidPermit, setVidPermit] = useState('public');
    const [tmp, setTmp] = useState('');
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoKey, setVideoKey] = useState(0);
    const [vidTags, setVidTags] = useState([]);
    const [tags, setTags] = useState(null);
    const [showTags, setShowTags] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        getAPI('tags')
            .then(response => {
                setTags(response);
                setShowTags(response);
            })
    }, []);

    const checkDate = () => {
        const expDate = getlocalData('expDate');
        if (Date.now() >= expDate) {
            localStorage.clear();
            window.location.href = '/token-expired';
        }
    }

    const handleTag = (tag) => {
        const tmp_vidTags = [...vidTags];
        const tmp_tags = showTags.filter(tmp_tag => tmp_tag !== tag);
        tmp_vidTags.push(tag);
        setVidTags(tmp_vidTags);
        setShowTags(tmp_tags);
    }

    const removeTag = (tag) => {
        const tmp_vidTags = vidTags.filter(tmp_tag => tmp_tag !== tag);
        const tmp_tags = [...showTags];
        tmp_tags.push(tag);
        const tmp = tmp_tags.map(tmp => tmp.T_ID);
        const show = tags.filter(tag => tmp.includes(tag.T_ID));
        setVidTags(tmp_vidTags);
        setShowTags(show);
    }

    const searchTag = (e) => {
        e.preventDefault();
        if (e.target.value === '') {
            const removeID = vidTags.map(tmp => tmp.T_ID);
            const tmp_tag = tags.filter(tag => !removeID.includes(tag.T_ID))
            setShowTags(tmp_tag);
        } else {
            const input = e.target.value;
            const tmp_tags = vidTags.map(tmp => tmp.T_ID);
            const show = tags.filter(tag => !tmp_tags.includes(tag.T_ID));
            const tmp = show.filter(tag =>
                tag.T_name.toLowerCase().includes(input.toLowerCase())
            );
            setShowTags(tmp);
        }
    };

    const handleFileChange = (e) => {
        const tmpFile = e.target.files[0];
        if (tmpFile) {
            setFile(tmpFile);
            console.log(tmpFile);
            setTmp(tmpFile.name);
            setVideoUrl(URL.createObjectURL(tmpFile));
            setVideoKey(videoKey + 1);
        }

    };

    const handleVidName = (e) => {
        setTmp(e.target.value)
        e.preventDefault();
    }

    const handleVidDesc = (e) => {
        setVidDesc(e.target.value)
        e.preventDefault();
    }

    const handleSelect = (e) => {
        setVidPermit(e.target.value);
    }

    const handleThumbnail = (e) => {
        var thumbnail = e.target.files[0];
        if (thumbnail) {
            const reader = new FileReader();

            reader.onload = () => {

                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxW = 800;
                    const aspectRatio = 16 / 9;


                    let w = image.width;
                    let h = image.height;

                    const maxH = Math.round(w / aspectRatio);

                    if (w > maxW || h > maxH) {
                        const wRatio = maxW / w;
                        const hRatio = maxH / h;

                        const ratio = Math.min(wRatio, hRatio);
                        w *= ratio;
                        h *= ratio;
                    }

                    canvas.width = w;
                    canvas.height = h;

                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, w, h);

                    const b64 = canvas.toDataURL('image/jpeg');
                    const tmp = b64.replace("data:image/jpeg;base64,", "");
                    setThumbnail(tmp);
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(thumbnail);
        }


    }

    const handleClickUpload = async () => {
        checkDate();
        if (tmp.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Title is empty!',
                text: 'Please enter a video title before uploading!',
            });
            return;
        }

        setUpProgress('0');
        if (file) {

            document.getElementById('submitBtn').disabled = true;

            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', function () {
                const duration = video.duration;
                const w = video.videoWidth;
                const h = video.videoHeight;
                const type = file.type.split('/').pop(); // video/mp4 -> [video, mp4] -> mp4
                const tmpData = {
                    'videoName': tmp,
                    'videoOriginName': file.name,
                    'videoSize': file.size,
                    'videoDuration': duration,
                    'videoDesc': vidDesc,
                    'videoType': type,
                    'videoOwner': session.U_id,
                    'videoPermit': vidPermit,
                    'videoThumbnail': thumbnail,
                    'path': session.U_folder,
                    'width': w,
                    'height': h,
                    'tags': vidTags
                    // encode included
                }
                const formData = new FormData();
                formData.append('video', file, file.name);
                formData.append('data', JSON.stringify(tmpData));
                axios.post(uploadAPI, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + token
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = (progressEvent.loaded / progressEvent.total);
                        let tmp = Math.round(progress * 100)
                        setUpProgress(tmp.toString());
                        if (tmp === 100.0 || tmp === 100) {
                            console.log('done upload');
                        }
                    },
                })
                    .then((response) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Upload Complete',
                            text: 'Your video is going to be converted, redirecting to convert status!',
                            showConfirmButton: false,
                            timer: 2000, 
                            didClose: () => {
                                navigate('/videosStatus');
                            },
                        });
                    })

                    .catch((error) => {
                        console.error('Upload failed:', error);
                    });
            });

        } else {
            console.log('file not found');
        }
    }

    const cardClick = () => {
        document.getElementById('uploadBtn').click();
    }

    const thumbnailClick = () => {
        document.getElementById('imgBtn').click();
    }

    return (
        <div>
            <Sidebar>
                <div className="container-fluid">
                    <br />
                    <div className="PageTitle">
                        <h2><i className="bi bi-cloud-upload-fill"></i> Upload</h2>
                        <p>Select your video to upload</p>
                    </div>

                    <div className="uploadCard">
                        <div className="card" style={{ backgroundColor: 'rgb(44,48,52)' }}>
                            <div className="card-header">
                                <div className="vidNameTitle">
                                    {tmp.length > 0 &&
                                        <h5>{tmp}</h5>
                                    }
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-6 p-3">
                                        <div className="pickUpload" style={{ height: "100%" }}>
                                            {videoUrl ? (
                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                    <video key={videoKey} controls style={{ width: '100%', maxHeight: "360px" }} >
                                                        <source src={videoUrl} type="video/mp4" />
                                                    </video>

                                                    <div className="mb-4 d-flex flex-wrap justify-content-center align-items-center">
                                                        <button className="btn btn-warning btn-card" onClick={cardClick}>
                                                            <span><i className="bi bi-pencil-square"></i> Change</span>
                                                        </button>
                                                        <button className="btn btn-success btn-card" onClick={thumbnailClick} style={{ marginLeft: '5px' }}>
                                                            <span><i className="bi bi-image"></i> Thumbnail</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="card upload-card" onClick={cardClick} style={{ height: '25rem' }}>
                                                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                                                        <i className="bi bi-cloud-upload center" style={{ fontSize: "40px" }}></i>
                                                        <p className="card-text center fw-bold">Browse</p>
                                                    </div>
                                                </div>
                                            )}
                                            <input className="form-control-file" id="uploadBtn" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                            <input className="form-control-file" id="imgBtn" type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleThumbnail} />
                                        </div>
                                    </div>

                                    <div className="col-6 p-3">
                                        {videoUrl ? (
                                            <div className="VideoDataInput">
                                                <div class="form-floating mb-4">
                                                    <input type="text" class="form-control" id="floatingInput" placeholder="Title" value={tmp} onChange={handleVidName} required />
                                                    <label for="floatingInput">Title</label>
                                                </div>

                                                <div class="form-floating mb-4">
                                                    <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea" onChange={handleVidDesc}></textarea>
                                                    <label for="floatingTextarea">Description</label>
                                                </div>

                                                <div class="form-floating mb-4">
                                                    <select class="form-select" id="floatingSelect" aria-label="select" value={vidPermit} onChange={handleSelect}>
                                                        <option selected value="public">Public</option>
                                                        <option value="unlisted">Unlisted</option>
                                                        <option value="private">Private</option>
                                                    </select>
                                                    <label for="floatingSelect">Permission</label>
                                                </div>

                                                <div className="col">
                                                    <h5 className="text-white">Tag</h5>
                                                    {tags &&
                                                        <h6>
                                                            <div className="row">
                                                                {vidTags && vidTags.map((tag, index) => (
                                                                    <div className="col-auto" key={index}>
                                                                        <div className="" style={{ width: 'fit-content', backgroundColor: 'white', borderRadius: '10px', marginTop: "1rem" }}>
                                                                            <div style={{ color: 'black' }}>
                                                                                &nbsp;{tag.T_name}
                                                                                <button onClick={() => removeTag(tag)} className="btn">x</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="col-auto">
                                                                    <div style={{ width: 'fit-content', backgroundColor: 'white', borderRadius: '10px', marginTop: '1rem' }}>
                                                                        <div className="dropdown" style={{ color: 'black' }}>
                                                                            <button className="btn btn-secondary" type="button" id="dropdownTag" aria-haspopup="true" data-bs-toggle="dropdown" aria-expanded="false">+</button>
                                                                            <div className='dropdown-menu dropdown-menu-dark ' aria-labelledby='dropdownTag'>
                                                                                <div className="col input-group">
                                                                                    <input type="text" className="form-control" placeholder="search tag" onChange={searchTag} defaultValue={''} />
                                                                                </div>
                                                                                {showTags && showTags.slice(0, 5).map((d_tag, index) => (
                                                                                    <button key={index} className='dropdown-item' onClick={() => handleTag(d_tag)}>+ {d_tag.T_name}</button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </h6>
                                                    }
                                                </div>
                                                <br />

                                                <div className="mb-4">
                                                    <button className="btn btn-primary btn-block w-100" type="submit" id="submitBtn" onClick={handleClickUpload}>
                                                        <span><i className="bi bi-upload"></i> Upload</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }} onClick={cardClick}>
                                                <h5 className="fw-bold text-white">Select file to upload</h5>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="col-12">
                                    <div className="progress">
                                        <ProgressBar value={upProgress + '%'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        </div>

    );

}

export default UploadPage;