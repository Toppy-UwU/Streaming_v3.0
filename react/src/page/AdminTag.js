import { useEffect, useState } from "react"
import DataTable, { createTheme } from "react-data-table-component";
import AdminSidebar from "../components/AdminSidebar";
import { getAPI } from "../components/callAPI";
import { getToken } from "../components/session"
import Swal from "sweetalert2";
import '../config'
import "../css/admin.css"
import './../css/swal2theme.css'
import { Link } from "react-router-dom";

const AdminTag = () => {
    document.title = "Tags | Administration";
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const ip = global.config.ip.ip;

    const fetchData = async () => { //fetch Tags from DB
        try {
            const response = await getAPI('tags');
            setTags(response);
            setFilter(response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => { //call fetch tags
        fetchData();
    }, []);

    useEffect(() => { //handle table search
        const result = tags.filter((item) => {
            return item.T_name.toLowerCase().match(search.toLocaleLowerCase());
        });
        setFilter(result);
    }, [search]);

    const handleDeleteTagDialog = (T_ID) => {
        Swal.fire({
            title: 'Are you sure to delete?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteTag(T_ID);
            }
        })
    }

    const handleDeleteTag = async (T_ID) => {
        try {
            const delete_api = `${ip}/delete/tag?t=${T_ID}`;
            const token = getToken();

            const response = await fetch(delete_api, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Delete completed!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000
                }).then((result) => {
                    fetchData();
                })
            } else {
                Swal.fire(
                    'Failed to delete tag!',
                    response.status + ":" + response.statusText,
                    'error'
                )
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditTag = async (T_ID, T_Name) => {
        if (T_Name === '') {
            Swal.fire({
                icon: 'error',
                title: 'Please fill tag fields',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        try {
            const update_api = `${ip}/update/tag`;
            const token = getToken();
            const data = {
                'T_ID': T_ID,
                'update_name': T_Name
            }
            const response = await fetch(update_api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Update completed!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000
                }).then((result) => {
                    fetchData();
                })
            } else {
                Swal.fire(
                    'Failed to update tag!',
                    response.status + ":" + response.statusText,
                    'error'
                )
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditTagDialog = (T_ID, T_name) => {
        console.log('Edit = '+ T_name + ':id = ' + T_ID);
        Swal.fire({
            title: 'Update Tag',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off',
            },
            inputValue: T_name,
            showCancelButton: true,
            confirmButtonText: 'Add',
        }).then((result) => {
            if (result.isConfirmed) {
                handleEditTag(T_ID, result.value);
            }
        })
    }

    const handleAddNewTagDialog = () => {
        Swal.fire({
            title: 'Add new tag',
            text: 'Add multiple tag use , to saperate each word',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Add',
        }).then((result) => {
            if (result.isConfirmed) {
                handleAddNewTag(result.value);
            }
        })
    };

    const handleAddNewTag = async (newTag) => {
        if (!newTag) {
            Swal.fire({
                icon: 'error',
                title: 'Please fill tag fields',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        try {
            const tags = newTag.split(',').map(tag => tag.trim());
            const token = getToken();
            const insert_api = ip + '/insert/tag';

            const response = await fetch(insert_api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tags)
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Add completed!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000
                }).then((result) => {
                    fetchData();
                })
            } else {
                Swal.fire(
                    'Failed to add new tag!',
                    response.status + ":" + response.statusText,
                    'error'
                )
            }
        } catch (e) {
            console.error(e);
        }
    };

    const columns = [
        {
            name: 'Name',
            selector: row => row.T_name,
            sortable: true,
            cell: (row) => (
                <Link className="text-decoration-none text-white" to={"/tag?tag=" + row.T_name}>{row.T_name}</Link>
            )
        },
        {
            name: 'Action',
            cell: (row) => (
                <>
                    <button className="btn btn-primary" onClick={() => handleEditTagDialog(row.T_ID,row.T_name)}><i className="bi bi-pencil-square"></i> <span className="spanSMHide">Edit</span></button>
                    <button className="btn btn-danger mx-2" onClick={() => handleDeleteTagDialog(row.T_ID)}><i className="bi bi-trash3"></i> <span className="spanSMHide">Delete</span></button>
                </>
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
                    <h2><i className="bi bi-tags-fill"></i> Tags</h2>
                </div>
                <div className='tags-table'>
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
                                    <button className="btn btn-secondary" onClick={() => handleAddNewTagDialog()}>+ Add Tag</button>
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
            </div>
        </AdminSidebar>
    )
}

export default AdminTag;