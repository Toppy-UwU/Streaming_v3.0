import { useEffect, useState } from "react"
import DataTable, { createTheme } from "react-data-table-component";
import AdminSidebar from "../components/AdminSidebar";
import '../config'
import "../css/admin.css"

const AdminLog = () => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    document.title = "Logs | Administator";
    const ip = global.config.ip.ip;
    const api = ip + '/get/userLog?u=all';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(api);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setLogs(data);
                setFilter(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    console.log(logs);

    useEffect(() => {
        const result = logs.filter((item) => {
            const lowerCaseSearch = search.toLowerCase();
            return item.U_ID.toString().includes(lowerCaseSearch) ||
                item.action.toLowerCase().includes(lowerCaseSearch); //search many row
        });
        setFilter(result);
    }, [search]);

    const columns = [
        {
            name: 'UID',
            selector: row => row.U_ID,
            sortable: true
        },
        {
            name: 'Action',
            selector: row => row.action,
            sortable: true
        },
        {
            name: 'Timestamp',
            selector: row => row.created_at,
            sortable: true
        },

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

    if (logs !== null) {
        return (
            <AdminSidebar>
                <div className="container-fluid">
                    <br />
                    <div className='PageTitle'>
                        <h2><i className="bi bi-info-circle-fill"></i> User Logs</h2>
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
                    </div>
                </div>
            </AdminSidebar>
        )
    } else {
        return (
            <AdminSidebar>
                <div className="center">
                    <div className="loading" />
                </div>
            </AdminSidebar>
        )
    }


}

export default AdminLog;