import { useEffect, useState } from "react";
import { getAPI } from "./callAPI";

import './../css/utilities.css';
import ProgressBar from "./progressBar";

function ServerMonitor(props) {
    // const serverRes = props.res
    const [serverRes, setServerRes] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAPI('serverRes');
                setServerRes(response);
            } catch (error) {
                // Handle error if the API request fails
                console.error(error);
            }
        };

        fetchData();
        // set timer every 10 sec
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval);
    }, []);

    if (serverRes === null) {
        return (
            <div className="center">
                <div className="loading"></div>
            </div>
        )
    }

    return (
        <div>
            <ul className="list-group">
                <li className="list-group-item" style={{ backgroundColor: 'darkgray' }}>
                    <h5>Server Monitoring</h5>
                </li>
                <li className="list-group-item">
                    <div>
                        CPU Usage: {serverRes.CPU_Used}
                        <div className="progress">
                            <ProgressBar value={serverRes.CPU_Used} />
                        </div>
                    </div>
                </li>
                {/* <li className="list-group-item">Disk_Free: {serverRes.Disk_Free}</li>
                <li className="list-group-item">Disk_Total: {serverRes.Disk_Total}</li> */}
                <li className="list-group-item">
                    Disk Usage: {serverRes.Disk_Used_Percent}
                    <div className="progress">
                        <ProgressBar value={serverRes.Disk_Used_Percent} />
                    </div>
                </li>
                <li className="list-group-item">
                    Memory Usage: {serverRes.Memory_Used}
                    <div className="progress">
                        <ProgressBar value={serverRes.Memory_Used} />
                    </div>
                </li>
                <li className="list-group-item">Network Download: {serverRes.Network_Download}</li>
                <li className="list-group-item">Network Upload: {serverRes.Network_Upload}</li>
            </ul>
        </div>
    );
}

export default ServerMonitor;