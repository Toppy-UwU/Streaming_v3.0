const server_ip = [HOST_IP];

module.exports = global.config = {
    ip: {

        ip : "http://" + server_ip + ":8900",
        ipw : "http://" + server_ip + ":8000",
        ipws: "http://" + server_ip + ":80" 

    }
};
