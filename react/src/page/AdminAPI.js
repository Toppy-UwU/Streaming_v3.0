import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar";
import Swal from "sweetalert2";
import DataTable, { createTheme, Media } from "react-data-table-component";
import { getToken } from "../components/session";
import '../config'
import moment from "moment";

const AdminAPI = () => {
    document.title = "Videos URL | Administration";
    const [api, setAPI] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const ip = global.config.ip.ip;
    const apiUrl = ip + '/get/url_token';

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
            setFilter(data)
        } catch { }
    }

    useEffect(() => {
        fetchData()
    }, []);

    useEffect(() => {
        const result = api.filter((item) => {
            const lowerCaseSearch = search.toLowerCase();
            return item.V_ID.toString().includes(lowerCaseSearch) ||
                item.V_encode.toLowerCase().includes(lowerCaseSearch);
        });
        setFilter(result);
    }, [search]);

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
        background: {
            default: "#222E3C"
        }
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
        <AdminSidebar>
            <div className="container-fluid content">
                <div className='PageTitle'>
                    <h2><i className="bi bi-folder-symlink-fill"></i> Videos URL</h2>
                </div>

                <div className='user-table'>
                    <div className="card">
                        <div className="card-body">
                            <DataTable
                                customStyles={tableHeaderStyle}
                                columns={columns}
                                data={filter}
                                pagination
                                fixedHeader
                                highlightOnHover
                                theme="solarized"
                                subHeader
                                subHeaderComponent={
                                    <input type="text"
                                        className="w-25 form-control"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                }
                            ></DataTable>
                        </div>
                    </div>
                    <br />
                </div>
            </div>
        </AdminSidebar>
    )
}

export default AdminAPI;