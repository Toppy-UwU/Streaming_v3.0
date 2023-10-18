import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar";
import { Link } from "react-router-dom";
import DataTable, { createTheme, Media } from "react-data-table-component";
import Swal from "sweetalert2";
import '../config'

const AdminReport = () => {
    document.title = "Report | Administration";
    const [report, setReport] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);

    useEffect(() => {
        const result = report.filter((item) => {
            return item.V_title.toLowerCase().match(search.toLocaleLowerCase());
        });
        setFilter(result);
    }, [search]);

    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true
        },
        {
            name: "Title",
            selector: row => row.title,
            sortable: true
        },
        {
            name: "Reporter",
            selector: row => row.name,
            sortable: true
        },
        {
            name: "Description",
            selector: row => row.desc,
        },
        {
            name: 'Action',
            cell: (row) => (
                <div className="dropdown">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        id={`dropdown-${row.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="bi bi-gear"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby={`dropdown-${row.id}`}>
                        <li>
                            <Link className="dropdown-item" to={`/profile?profile=${row.U_id}`}>
                                <span><i className="bi bi-person"></i> View Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="#">
                                <span><i className="bi bi-gear"></i> Setting</span>
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="#">
                                <span><i className="bi bi-trash3"></i> Delete</span>
                            </Link>
                        </li>
                    </ul>
                </div>
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
                    <h2><i className="bi bi-flag-fill"></i> Report</h2>
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

export default AdminReport;