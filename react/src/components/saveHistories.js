import '../config';

const ip = global.config.ip.ip;
export const insertHistories = async (data) => {
    await fetch(ip+'/update/history/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(response => { }).catch((error) => { })
}

export const createHistory = (data) => {
    fetch(ip+'/insert/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).catch(() => { })
}