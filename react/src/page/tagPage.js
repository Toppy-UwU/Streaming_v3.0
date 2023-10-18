import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import ShowVideos from "../components/showVideo";
import { getAPI } from "../components/callAPI";
import '../config';


const TagPage = () => {
    const param = new URLSearchParams(window.location.search);

    const tag = param.get('tag');

    const [videos, setVideos] = useState(null);
    const [tags, setTags] = useState(null);
    const ip = global.config.ip.ip;
    document.title = tag + " | Tags";

    const api = ip + '/get/videos/tag?tag=' + tag;

    const changeTag = (tag) => {
        if (tag === 'all') {
            window.location.href = '/'
        } else {
            window.location.href = '/tag?tag=' + tag
        }
    }

    useEffect(() => {
        fetch(api)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setVideos(data)
            })
        getAPI('tags')
            .then(response => {
                setTags(response);
            })
    }, [api])

    if (videos) {
        return (
            <Sidebar>
                <div className="container-fluid">
                    <div className="tagBarHome mb-4 mt-4 mx-4">
                        <div className="row">
                            <div className='col-auto'>
                                <button className='button-tag' onClick={() => changeTag('all')}>
                                    All
                                </button>
                            </div>
                            {tags && tags.map((tag, index) => (
                                <div className='col-auto' key={index} >
                                    <button className='button-tag' onClick={() => changeTag(tag.T_name)}>
                                        {tag.T_name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="showVid">
                        <div className="row mx-2">
                            <h3><i className="bi bi-bookmark-fill"></i> {tag}</h3>
                        </div>
                        <div className="mt-3">
                            <ShowVideos videos={videos} />
                        </div>
                    </div>
                </div>
            </Sidebar>
        )
    } else {
        return (
            <Sidebar>
                <div className="center">
                <div className="loading center" />
                </div>
            </Sidebar>
        )
    }
}

export default TagPage