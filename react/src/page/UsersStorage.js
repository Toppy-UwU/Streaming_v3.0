import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar";
import "../css/admin.css"
import DataTable, { createTheme, Media } from "react-data-table-component";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import '../config'

const UsersStorage = () => {
    const [storage, setStorage] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    document.title = "Storage | Administrator";

    const initialStorage = [
        { U_id: 1, U_name: 'John', U_vid: 5, U_storage: 580 },
        { U_id: 2, U_name: 'Alice', U_vid: 7, U_storage: 1204 },
        { U_id: 3, U_name: 'Bob', U_vid: 0, U_storage: 350 },
        { U_id: 4, U_name: 'Charlie', U_vid: 4, U_storage: 3672 },
        { U_id: 5, U_name: 'David', U_vid: 2, U_storage: 5463 },
        { U_id: 6, U_name: 'Eve', U_vid: 1, U_storage: 6666 },
        { U_id: 7, U_name: 'Frank', U_vid: 0, U_storage: 10897 },
        { U_id: 8, U_name: 'Grace', U_vid: 0, U_storage: 8903 },
        { U_id: 9, U_name: 'Hank', U_vid: 1, U_storage: 5269 },
        { U_id: 10, U_name: 'Ivy', U_vid: 10, U_storage: 4585 },
    ];

    useEffect(() => {
        const result = storage.filter((item) => {
            return item.U_name.toLowerCase().match(search.toLocaleLowerCase());
        });
        setFilter(result);
    }, [search]);

    useEffect(() => {
        setFilter(initialStorage);
        setStorage(initialStorage);
    }, []);

    const columns = [
        {
            name: 'UID',
            selector: row => row.U_id,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Name',
            selector: row => row.U_name,
            sortable: true
        },
        {
            name: 'Videos',
            selector: row => row.U_vid,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Used',
            selector: row => row.U_storage,
            sortable: true,
            cell: (row) => (row.U_storage >= 1000 ? `${(row.U_storage / 1000).toFixed(2)} GB` : `${row.U_storage} MB`),
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
            ),
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
        <AdminSidebar>
            <div className="container-fluid">
                <br />
                <div className='PageTitle'>
                    <h2><i className="bi bi-sd-card-fill"></i> Users Storage</h2>
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

    // } else {
    //     return (
    //         <AdminSidebar>
    //             <div className="center">
    //                 <div className="loading" />
    //             </div>
    //         </AdminSidebar>
    //     )
    // }
}

export default UsersStorage;