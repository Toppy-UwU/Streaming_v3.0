import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import DataTable, { createTheme, Media } from "react-data-table-component";
import config from '../config';
import { getToken, getlocalData } from "../components/session";
import Swal from "sweetalert2";
import moment from "moment";

const UserAPI = () => {
    document.title = "Videos URL";
    const [api, setAPI] = useState([]);
    const ip = config.ip.ip;
    var session = getlocalData('session')
    const apiUrl = ip + '/get/url_token/user?u=' + session.U_id

    const fetchData = async () => {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
            });
            if (!response.ok) throw new Error("HTTP error!");
            const data = await response.json()
            setAPI(data)
        } catch { }
    }

    useEffect(() => {
        fetchData()
    }, []);

    const copyToClipboard = (text) => {
        Swal.fire({
            icon: 'success',
            title: 'URL Copied',
            showConfirmButton: false,
            timer: 2000,
            didClose() {
                const tempInput = document.createElement('input');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
        });
    };

    const columns = [
        {
            name: 'VID',
            selector: row => row.V_ID,
            hide: Media.MD
        },
        {
            name: 'Video encode',
            selector: row => row.V_encode,
        },
        {
            name: 'URL',
            selector: row => row.url,
            cell: (row) => ip + "/get/hls/" + row.url + "/" + row.V_encode
        },
        {
            name: 'Expired Date',
            selector: row => row.url_expire,
            cell: (row) => (
                moment.utc(row.url_expire).format("DD MMMM YYYY : HH:mm:ss")
            ),
            hide: Media.MD
        },
        {
            name: 'Copy URL',
            cell: (row) => (
                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => copyToClipboard(ip + "/get/hls/" + row.url + "/" + row.V_encode)}
                >
                    <i className="bi bi-clipboard-fill"></i> <span className="spanSMHide">Copy URL</span>
                </button>
            )
        }
    ]

    const tableHeaderStyle = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "16px"
            }
        },
        cells: {
            style: {
                fontSize: "16px",
            }
        },
    }

    createTheme('solarized', {
        text: {
            primary: '#FFFFFF',
            secondary: '#BDC0C5',
        },
        background: {
            default: '#2C3034',
        },
        context: {
            background: '#222E3C',
            text: '#FFFFFF',
        },
        divider: {
            default: '#073642',
        },
        action: {
            button: 'rgba(0,0,0,.54)',
            hover: 'rgba(0,0,0,.08)',
        },
    }, 'dark');

    return (
        <Sidebar>
            <div className="container-fluid">
                <br />
                <div className='PageTitle'>
                    <h2><i className="bi bi-folder-symlink"></i> Videos URL</h2>
                </div>

                <div className='user-table'>
                    <div className="card">
                        <div className="card-body">
                            <DataTable
                                customStyles={tableHeaderStyle}
                                columns={columns}
                                data={api}
                                pagination
                                fixedHeader
                                highlightOnHover
                                theme="solarized"
                            ></DataTable>
                        </div>
                    </div>
                    <br />
                </div>
            </div>
        </Sidebar>
    )
}
export default UserAPI;