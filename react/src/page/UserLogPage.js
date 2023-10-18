import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import DataTable, { createTheme, Media } from "react-data-table-component";
import './../config';
import { getlocalData } from './../components/session';

const UserLog = () => {
    const [log, setLog] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const ip = global.config.ip.ip;
    var session = getlocalData('session');
    const api = ip + '/get/userLog?u=' + session.U_id;
    document.title = "Log";

    useEffect(() => {
        const fetchDataUser = async () => {
            try {
                const response = await fetch(api);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setLog(data);
                setFilter(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataUser();
    }, []);

    useEffect(() => {
        const result = log.filter((item) => {
            return item.action.toLowerCase().match(search.toLocaleLowerCase());
        });
        setFilter(result);
    }, [search]);

    const columns = [
        {
            name: 'UID',
            selector: row => row.U_ID,
            sortable: true,
            hide: Media.SM
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
                    <h2><i className="bi bi-info-circle-fill"></i> Log</h2>
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
                                subHeader
                                subHeaderComponent={
                                    <input type="text"
                                        className="w-25 form-control"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                }
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
export default UserLog;