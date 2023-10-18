import Sidebar from '../components/sidebar';
import ShowVideos from '../components/showVideo';
import { useEffect, useState } from 'react';
import { getAPI } from '../components/callAPI';

const Home = () => {
  const [videos, setVideos] = useState(null);
  const [tags, setTags] = useState(null);
  document.title = "CS MSU";

  useEffect(() => {
    getAPI('videosPublic')
      .then(response => {
        setVideos(response);
      });
    getAPI('tags')
      .then(response => {
        setTags(response);
      })
  }, [])

  const changeTag = (tag) => {
    window.location.href = '/tag?tag=' + tag
  }

  if (videos === null) {
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

  return (

    <div>
      <Sidebar>
        <div className='container-fluid'>
          <div className='tagBarHome mb-4 mt-3 mx-4'>
            <div className='row'>
              {tags && tags.map((tag, index) => (
                <div className='col-auto mt-2' key={index}>
                  <button className='button-tag' onClick={() => changeTag(tag.T_name)}>
                    {tag.T_name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className='showVid'>
            <ShowVideos videos={videos} />
          </div>
        </div>
      </Sidebar>
    </div>

  );
};

export default Home;