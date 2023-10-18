import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { insertHistories } from './saveHistories';
import { getUser, isSessionSet } from './session';

const VideoPlayer = ({ source, V_id, watchTime }) => {
  const videoRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [resolutions, setResolutions] = useState(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (typeof Hls === 'undefined') return;
      if (!Hls.isSupported()) return;

      const video = videoRef.current;
      const tmpHls = new Hls();

      tmpHls.loadSource(source);
      tmpHls.attachMedia(video);

      setHls(tmpHls);
      video.currentTime = watchTime;
      video.autoplay = true;

      tmpHls.on(Hls.Events.MANIFEST_PARSED, () => {
        const tmp = tmpHls.levels;
        tmpHls.currentLevel = tmp.length - 1;
        setResolutions(tmp);
      });
    };

    loadVideo();

  }, [source]);

  useEffect(() => {
    const video = videoRef.current;
    let c_time = 0;

    const handleTime = async (e) => {
      const dif_time = video.currentTime - c_time;

      if (dif_time >= 20) {
        c_time = video.currentTime;
        const tmp = {
          'watchTime': video.currentTime,
          'V_id': V_id,
          'U_id': getUser()
        }
        await insertHistories(tmp);
      }
    }

    const handleEnd = async (e) => {
      const tmp = {
        'watchTime': 0,
        'V_id': V_id,
        'U_id': getUser()
      }
      await insertHistories(tmp);
    }

    const handlePause = async (e) => {
      const tmp = {
        'watchTime': video.currentTime,
        'V_id': V_id,
        'U_id': getUser()
      }
      await insertHistories(tmp);
    }

    if (isSessionSet('session')) {
      video.addEventListener('timeupdate', handleTime)
      video.addEventListener('ended', handleEnd);
      video.addEventListener('pause', handlePause);
    }

    return () => {
      if (isSessionSet('session')) {
        video.removeEventListener('timeupdate', handleTime);
        video.removeEventListener('ended', handleEnd);
        video.removeEventListener('pause', handlePause);
      }
    }
  }, [V_id])

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeAttribute('src');
    };
  }, [hls]);

  const resChange = (e) => {
    const level = e.target.value
    if (level !== 'auto') {
      hls.currentLevel = parseInt(level);
    } else {
      hls.currentLevel = resolutions.length - 1

    }
  }

  return (
    <div className='container-fluid' >
      <div className='row'>
        <video ref={videoRef} controls style={{ maxHeight: "500px", width: '100%', backgroundColor: 'black'}}>
          Your browser does not support the video tag.
        </video>
      </div>
      <div className='d-flex justify-content-end'>
        <select className="w-25 form-select" aria-label="Res-select" onChange={resChange}>
          <option value={'auto'}>Auto</option>
          {resolutions && resolutions.map((res, index) => (
            <option key={index} value={index} >{res.height}p</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VideoPlayer;
