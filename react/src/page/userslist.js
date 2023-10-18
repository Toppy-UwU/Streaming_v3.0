import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar";
import { getAPI } from '../components/callAPI';
import Swal from "sweetalert2";
import '../config'
import "../css/admin.css"
import DataTable, { createTheme, Media } from "react-data-table-component";
import { Link } from "react-router-dom";
import AddUserModal from "../components/UserModal";
import UpdateUserModal from "../components/UpdateUserModal";
import { ip } from "../config";

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    document.title = "Users | Administration";

    const fetchData = async () => {
        try {
            const response = await getAPI('users');
            setUsers(response);
            setFilter(response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const result = users.filter((item) => {
            const lowerCaseSearch = search.toLowerCase();
            return item.U_id.toString().includes(lowerCaseSearch) ||
                item.U_name.toLowerCase().includes(lowerCaseSearch) ||
                item.U_mail.toLowerCase().includes(lowerCaseSearch) ||
                item.U_type.toLowerCase().includes(lowerCaseSearch);
        });
        setFilter(result);
    }, [search]);

    const handleDelete = (U_id, U_folder) => {
        const deleteApi = ip.ip + '/delete/user';

        const tmp = ({
            'U_ID': U_id,
            'U_folder': U_folder
        })

        Swal.fire({
            title: 'Confirm to delete?',
            icon: 'question',
            confirmButtonText: 'Delete',
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return fetch(deleteApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tmp)
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)
                    }
                    return response.json()
                })
                    .catch(error => {
                        Swal.showValidationMessage(
                            `Request failed: ${error}`
                        )
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    didClose: () => {
                        fetchData();
                    }
                })
            }
        })
    }

    const handleSettingClick = (row) => {
        setSelectedRow(row);
    }

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
            sortable: true,
            cell: (row) => (
                <Link className="text-decoration-none text-white" to={`/profile?profile=${row.U_id}`}>{row.U_name}</Link>
            )
        },
        {
            name: 'E-mail',
            selector: row => row.U_mail,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Upload Permit',
            selector: row => row.U_permit,
            sortable: true,
            cell: (row) => (row.U_permit === 1 ? "Yes" : "No"),
            hide: Media.SM
        },
        {
            name: 'Role',
            selector: row => row.U_type,
            sortable: true,
            cell: (row) => row.U_type.toUpperCase()
        },
        {
            name: 'Videos',
            selector: row => row.U_vid,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Storage',
            selector: row => row.U_storage,
            cell: (row) => (row.U_storage >= 1025 ? `${(row.U_storage / 1024).toFixed(2)} GB` : `${row.U_storage} MB`),
            sortable: true,
            hide: Media.SM
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
                            <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#updateUserModal" onClick={() => handleSettingClick(row)}>
                                <span><i className="bi bi-gear"></i> Setting</span>
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="#" onClick={() => handleDelete(row.U_id, row.U_folder)}>
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
        background: {
            default: "#222E3C"
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

    if (users) {
        return (
            <AdminSidebar>
                <div className="container-fluid content">
                    <div className='PageTitle'>
                        <h2><i className="bi bi-people-fill"></i> Users</h2>
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
                                    actions={
                                        <button className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addUserModal"><span><i class="bi bi-person-plus"></i> </span>Add User</button>
                                    }
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
                    <AddUserModal />
                    <UpdateUserModal data={selectedRow} />
                </div>
            </AdminSidebar>
        )
    } else {
        <AdminSidebar>
            <div className="center">
                <div className="loading" style={{ marginTop: '25%' }}></div>
            </div>
        </AdminSidebar>
    }
}

export default UserListPage;