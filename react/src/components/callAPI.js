import '../config';

const ip = global.config.ip.ip;
// get API
const getUserAPI = ip+'/getUsers';
const getServerAPI = ip+'/server_resource';
const getVideosPublic = ip+'/getVideos/public';
const getUploadLog = ip+'/get/uploadLog';
const getTag = ip+'/get/tags';

// post API


export const getAPI = async (call_api) => {
  let api = '';
  if (call_api === 'users') {
    api = getUserAPI;
  }else if (call_api === 'serverRes') {
    api = getServerAPI
  }else if (call_api === 'videosPublic') {
    api = getVideosPublic
  }else if (call_api === 'uploadLog') {
    api = getUploadLog
  }else if (call_api === 'tags') {
    api = getTag
  }

  try {
    const response = await fetch(api);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

