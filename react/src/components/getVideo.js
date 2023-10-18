
import { useState, useEffect } from "react";
import ShowVideos from "./showVideo";
import '../config';

const GetVideo = (props) => {
    const [ videos, setVideos ] = useState(null);
    const ip = global.config.ip.ip;

    const api = ip+'/getVideos/profile?u='+ props.user +'&p='+props.permit

    useEffect(() => {
        fetch(api)
          .then(response => response.json())
          .then(data => {
            setVideos(data)
          })
          .catch(e => {
            console.error('Error:', e);
          })
      }, [api])

      if(videos !== null ) {
            return(
                <div>
                    <ShowVideos videos={videos} />
                </div>
            )
      } else {
        <div className="loading center"></div>
      }
    
}

export default GetVideo