import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import DataTable, { createTheme, Media } from "react-data-table-component";
import '../config';
import { getlocalData } from './../components/session';

const UserStats = () => {
    const [mostwatch, setMostwatch] = useState([]);
    const [mostView, setMostview] = useState([]);
    document.title = "Statistics";
    const ip = global.config.ip.ip;
    var session = getlocalData('session');
    const api_watch = ip + '/get/mostWatch?u=' + session.U_id;
    const api_view = ip + '/get/mostView?u=' + session.U_id;
    useEffect(() => {
        const fetchDataWatch = async () => {
            try {
                const response = await fetch(api_watch);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setMostwatch(data);
                console.log(mostwatch);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchDataView = async () => {
            try {
                const response = await fetch(api_view);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setMostview(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataWatch();
        fetchDataView();
    }, []);

    const columns = [
        {
            name: 'Video',
            selector: row => <img height={120} width={160} src={`data:image/jpeg;base64, ${row.V_pic}`} />,
            hide: Media.SM
        },
        {
            name: 'Title',
            selector: row => row.V_title,
            sortable: true
        },
        {
            name: 'Owner',
            selector: row => row.U_name,
            sortable: true
        },
        {
            name: 'View',
            selector: row => row.V_view,
        },
    ]

    const columnsView = [
        {
            name: 'Video',
            selector: row => <img height={120} width={160} src={`data:image/jpeg;base64, ${row.V_pic}`} />,
            hide: Media.SM
        },
        {
            name: 'Title',
            selector: row => row.V_title,
            sortable: true
        },
        {
            name: 'Upload',
            selector: row => row.V_upload,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'View',
            selector: row => row.V_view,
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
                    <h2><i className="bi bi-graph-up"></i> Statistics</h2>
                </div>

                <div className="user-table">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <div className="card">
                                <div className="card-header">
                                    <h4 className='text-white fw-bold'><i className="bi bi-people-fill"></i> Most Watch</h4>
                                </div>
                                <div className="card-body">
                                    <DataTable
                                        customStyles={tableHeaderStyle}
                                        columns={columns}
                                        data={mostwatch}
                                        pagination
                                        fixedHeader
                                        highlightOnHover
                                        theme="solarized"
                                    ></DataTable>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="card">
                                <div className="card-header">
                                    <h4 className='text-white fw-bold'><i className="bi bi-people-fill"></i> Most View</h4>
                                </div>
                                <div className="card-body">
                                    <DataTable
                                        customStyles={tableHeaderStyle}
                                        columns={columnsView}
                                        data={mostView}
                                        pagination
                                        fixedHeader
                                        highlightOnHover
                                        theme="solarized"
                                    ></DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    )
}
export default UserStats;