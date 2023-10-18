import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import { getToken, getUser } from "../components/session"
import Swal from "sweetalert2";
import moment from "moment";
import '../config'
import "./../css/table.css"
import { Link } from "react-router-dom";

const HistoryPage = () => {
    const [histories, setHistories] = useState(null);
    const ip = global.config.ip.ip;

    const user = getUser();
    const api = ip + '/get/histories?u=' + user;
    const token = getToken();

    const clearApi = ip + '/delete/histories';
    document.title = "History";

    const fetchHistory = async () => {
        try {
            const response = await fetch(api);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setHistories(data);
                }
            } else {
                throw new Error('Failed to fetch history data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleBtn = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "All of your history will be deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Clear'
        }).then((result) => {
            if (result.isConfirmed) {
                handleClear();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your history has been deleted.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    didClose: () => {
                        window.location.reload();
                    }
                })
            }
        });
    }

    const handleClear = async () => {
        const tmp = {
            'user': user
        }

        try {
            const response = await fetch(clearApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tmp)
            });

            if (!response.ok) {
                throw new Error('Clearing failed');
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    if (histories !== null) {
        return (
            <Sidebar>
                <div className="container-fluid">
                    <br />
                    <div className='PageTitle d-flex justify-content-between align-items-center'>
                        <h2><i className="bi bi-clock-history"></i> Watch History</h2>
                        {histories.length > 0 && (
                            <div style={{ justifyContent: 'end' }}>
                                <button type="button" class="btn btn-danger" onClick={handleBtn}><i class="bi bi-trash3"></i> <span className="spanSMHide">Delete</span></button>
                            </div>
                        )}
                    </div>
                    <div className="showHistoryData">
                        {histories.map((history) => (
                            <div className="showHistory">
                                <Link to={'/watch?u=' + history.U_folder + '&v=' + history.V_encode}><img src={`data:image/jpeg;base64, ${history.V_pic}`} alt={history.V_title + ' thumbnail'} /></Link>
                                <div class="history-text">
                                    <Link to={'/watch?u=' + history.U_folder + '&v=' + history.V_encode} className="noLink"><h4>{history.V_title}</h4></Link>
                                    <Link to={`/profile?profile=${history.U_ID}`} className="noLink"><p><span><i className="bi bi-person-fill"></i> </span>{history.U_name}</p></Link>
                                    <Link to={'/watch?u=' + history.U_folder + '&v=' + history.V_encode} className="noLink"><p><span><i class="bi bi-clock"></i> </span>{moment.utc(history.H_watchDate).format("DD MMMM YYYY : HH:mm:ss")}</p></Link>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </Sidebar>
        )
    } else {
        return (
            <Sidebar>
                <div className="container-fluid">
                    <br />
                    <div className='PageTitle'>
                        <h2><i className="bi bi-clock-history"></i> Watch History</h2>
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <div className='notfound-vid'>
                            <i className="bi bi-x-circle"></i>
                            <p>No watch history</p>
                        </div>
                    </div>
                </div>
            </Sidebar>
        )
    }

}

export default HistoryPage