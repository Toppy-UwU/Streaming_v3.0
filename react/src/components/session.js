import CryptoJS from "crypto-js";

const encryptKey = '4yJHJpOA5AQgORVuF3VPA3xp8O2HU0Ok5k1NjPk5oWFUhGNBh4UQzoyr/lN6qvv9'; // change later

//store data to session
export const setlocalData = (key, data) => {
  const jsonData = JSON.stringify(data);
  var encryptJson = encryptData(jsonData, encryptKey);
  localStorage.setItem(key, encryptJson );
};

//get data from session
export const getlocalData = (key) => {
  const jsonData = localStorage.getItem(key);
  var decryptJson = decryptData(jsonData, encryptKey);
  // return JSON.parse(jsonData);
  return decryptJson
};

//remove data from session
export const removelocalData = (key) => {
  localStorage.removeItem(key);
};

export const isSessionSet = (key) => {
  const data2 = localStorage.getItem(key)
  if (data2 !== null) {
    return true
  }else {
    return false
  }
};

// encryption section

export const encryptData = (data, key) => {
  var encryptedData = CryptoJS.AES.encrypt(data, key);
  return encryptedData.toString();
}

export const decryptData = (data, key) => {
  var decryptedData = CryptoJS.AES.decrypt(data, key);
  var jsonData = decryptedData.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonData);
}

// authentication section

export const checkVidPermit = (U_idFromVid) => {
  const f = isSessionSet('session')
  var tmp
  if(f) {
    tmp = getlocalData('session')
  }else {
    return false
  }
  if(tmp.U_id === U_idFromVid) {
    return true
  }else {
    return false
  }
}

export const getToken = () => {
  const f = isSessionSet('session')
  var tmp
  if(f) {
    tmp = getlocalData('token')
  }
  return tmp
}

export const getUser = () => {
  const f = isSessionSet('session')
  var tmp
  if(f) {
    tmp = getlocalData('session')
  }
  if(tmp) {
    return tmp.U_id;
  }else {
    return '';
  }
}

export const isAdmin = () => {
  const f = isSessionSet('session')
  var tmp
  if(f) {
    tmp = getlocalData('session')
    
  }else {
    return false
  }
  if(tmp.U_type === 'admin') {
    return true
  }else {
    return false
  }
}