import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar";
import { getAPI } from "../components/callAPI";
import { CircularProgressbar, CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import Swal from "sweetalert2";
import '../config'
import "../css/monitor.css"

const Monitor = () => {
    document.title = "Server Monitor | Administration";
    const [serverRes, setServerRes] = useState([])

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
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AdminSidebar>
            <div className="container-fluid content">
                <div className='PageTitle'>
                    <h2><i className="bi bi-hdd-stack-fill"></i> Server Monitor</h2>
                </div>
                {console.log(serverRes)}

                <div className="Monitor">
                    <div className="showRow1 mb-3">
                        <div className="row">
                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-cpu"> CPU Used</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={serverRes.CPU_Used} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h4><strong>{serverRes.CPU_Used}%</strong></h4>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-hdd"> Disk Used</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={serverRes.Disk_Used_Percent} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h4><strong>{serverRes.Disk_Used_Percent}%</strong></h4>
                                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                                    <strong>{serverRes.Disk_Used} GB of {serverRes.Disk_Total} GB</strong>
                                                </div>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-hdd"> Disk Free</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={(serverRes.Disk_Free / serverRes.Disk_Total) * 100} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h4><strong>{((serverRes.Disk_Free / serverRes.Disk_Total) * 100).toFixed(1)}%</strong></h4>
                                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                                    <strong>{serverRes.Disk_Free} GB of {serverRes.Disk_Total} GB</strong>
                                                </div>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="showRow2">
                        <div className="row">
                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-memory"> Memory Used</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={serverRes.Memory_Used} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h4><strong>{serverRes.Memory_Used}%</strong></h4>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-arrow-down-circle"> Download Speed</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={serverRes.Network_Download_Speed} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h5><strong>{serverRes.Network_Download_Speed}/s</strong></h5>
                                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                                    <strong>Total : {serverRes.Network_Download}</strong>
                                                </div>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4 mb-3 mb-sm-0">
                                <div class="card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <h5 class="card-title"><strong><span class="bi bi-arrow-up-circle"> Network Upload</span></strong></h5>
                                        <div className="ProgressCircle">
                                            <CircularProgressbarWithChildren value={serverRes.Network_Upload_Speed} styles={buildStyles({pathTransitionDuration: 0.5, pathColor: 'rgb(74, 192, 255)', strokeLinecap: 'round'})}>
                                                <h5><strong>{serverRes.Network_Upload_Speed}/s</strong></h5>
                                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                                    <strong>Total : {serverRes.Network_Upload}</strong>
                                                </div>
                                            </CircularProgressbarWithChildren>;
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                </div>
            </div>
        </AdminSidebar>
    )
}

export default Monitor;