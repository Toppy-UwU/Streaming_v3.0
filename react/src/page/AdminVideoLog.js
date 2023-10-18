import { useEffect, useState } from "react"
import DataTable, { createTheme} from "react-data-table-component";
import AdminSidebar from "../components/AdminSidebar";
import { getAPI } from '../components/callAPI';
import '../config'
import "../css/admin.css"

const AdminVideoLog = () => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    document.title = "Upload Logs | Administator";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAPI('uploadLog');
                setLogs(response);
                setFilter(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const result = logs.filter((item) => {
            console.log(item)
            const lowerCaseSearch = search.toLowerCase();
            return item.U_name.toLowerCase().includes(lowerCaseSearch) ||
                item.V_title.toLowerCase().includes(lowerCaseSearch);
        });
        setFilter(result);
        // eslint-disable-next-line
    }, [search]);

    const columns = [
        {
            name: 'Videos',
            selector: row => <img height={120} width={160} src={`data:image/jpeg;base64, ${row.V_pic}`} alt={row.V_title+" Cover"}/>,
        },
        {
            name: 'Title',
            selector: row => row.V_title,
        },
        {
            name: 'Owner',
            selector: row => row.U_name,
            sortable: true
        },
        {
            name: 'Date',
            selector: row => row.V_upload,
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
                        <h2><i className="bi bi-info-circle-fill"></i> Upload Logs</h2>
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

export default AdminVideoLog;