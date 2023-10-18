import { useEffect, useState } from "react"
import { getToken } from "./session";
import { getAPI } from "./callAPI";
import '../config';
import Swal from "sweetalert2";


const VideoUpdateModal = (props) => {
    const [title, setTitle] = useState(props.title);
    const [desc, setDesc] = useState(props.desc);
    const [permit, setPermit] = useState(props.permit);
    const [tags, setTags] = useState(null);
    const [vidTags, setVidTags] = useState(props.tags);
    const [flag, setFlag] = useState(false);
    const ip = global.config.ip.ip;

    const updateApi = ip + '/update/video/user';

    useEffect(() => {
        getAPI('tags')
            .then(response => {
                const removeID = vidTags.map(tmp => tmp.T_ID);
                const tmp_tag = response.filter(tag => !removeID.includes(tag.T_ID));
                setTags(tmp_tag)
            });
    }, [])

    const handleSubmit = () => {
        if (title === '') {
            Swal.fire({
                icon: 'error',
                title: 'Please fill title fields',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        const tmp = ({
            'V_id': props.V_id,
            'U_id': props.id,
            'title': title,
            'desc': desc,
            'permit': permit,
            'encode': props.encode,
            'tag': vidTags
        })
        const token = getToken();
        setFlag(true);
        fetch(updateApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tmp)
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Video Updated!',
                        timer: 1500,
                        showConfirmButton: false,
                        didClose: () => {
                            window.location.reload();
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update video fail',
                        text: 'please try again!'
                    })
                }
            })
            .catch((e) => {
                console.error();
            })
    }

    const handleTitle = (e) => {
        setTitle(e.target.value);
        e.preventDefault();
    }

    const handleDesc = (e) => {
        setDesc(e.target.value);
        e.preventDefault();
    }

    const handlePermit = (e) => {
        setPermit(e.target.value);
    }

    const handleTag = (tag) => {
        const tmp_vidTags = [...vidTags];
        const tmp_tags = tags.filter(tmp_tag => tmp_tag !== tag);
        tmp_vidTags.push(tag);
        setVidTags(tmp_vidTags);
        setTags(tmp_tags);
    }

    const removeTag = (tag) => {
        const tmp_vidTags = vidTags.filter(tmp_tag => tmp_tag !== tag);
        const tmp_tags = [...tags];
        tmp_tags.push(tag);
        setVidTags(tmp_vidTags);
        setTags(tmp_tags);
    }

    const searchTag = (e) => {
        e.preventDefault();
        if (e.target.value === '') {
            const removeID = vidTags.map(tmp => tmp.T_ID);
            const tmp_tag = tags.filter(tag => !removeID.includes(tag.T_ID))
            setTags(tmp_tag);
        } else {
            const input = e.target.value;
            const tmp_tags = vidTags.map(tmp => tmp.T_ID);
            const show = tags.filter(tag => !tmp_tags.includes(tag.T_ID));
            const tmp = show.filter(tag =>
                tag.T_name.toLowerCase().includes(input.toLowerCase())
            );
            setTags(tmp);
        }
    };

    return (
        <div className="modal fade" id="UpdateVideoModal" tabindex="-1" aria-labelledby="UpdateVideoModal" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5 fw-bold" id="UpdateVideoModal">Video Setting</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="VideoDataInput">
                            <div className="form-floating mb-4">
                                <input type="text" class="form-control" id="floatingInput" value={title} onChange={handleTitle} required />
                                <label for="floatingInput">Title</label>
                            </div>

                            <div className="form-floating mb-4">
                                <textarea className="form-control" id="floatingTextarea" value={desc} onChange={handleDesc} rows="4"></textarea>
                                <label for="floatingTextarea">Description</label>
                            </div>

                            <div className="form-floating mb-4">
                                <select className="form-select" id="floatingSelect" aria-label="select" value={permit} onChange={handlePermit}>
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                                <label for="floatingSelect">Permission</label>
                            </div>

                            <div className="col">
                                <label>Tag</label>
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
                                                        {tags && tags.slice(0, 5).map((d_tag, index) => (
                                                            <button key={index} className='dropdown-item' onClick={() => handleTag(d_tag)}>+ {d_tag.T_name}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h6>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={flag} >Save</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoUpdateModal