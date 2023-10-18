import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import DataTable, { createTheme, Media } from "react-data-table-component";
import config from '../config'; // Make sure to import config properly

const UserReport = () => {
    document.title = "Report";
    const [report, setReport] = useState([]);

    const initialStorage = [
        { rid: 1, title: 'Login', topic: 'Hate Speech', desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry', status: 'Reported', time: '13/09/2023' },
        { rid: 2, title: 'Logout', topic: 'Bullying', desc: 'ffffffffffffffffffff', status: 'Accepted', time: '13/09/2023' },
        { rid: 3, title: 'Login', topic: 'Hate Speech', desc: '', status: 'Reported', time: '16/09/2023' },
        { rid: 4, title: 'Login', topic: 'Spam', desc: 'dfvhgxcjfcj', status: 'Accepted', time: '20/09/2023' },
        { rid: 5, title: 'Logout', topic: 'Hate Speech', desc: 'vcnvbngvngv', status: 'Accepted', time: '22/09/2023' },
        { rid: 6, title: 'Login', topic: 'Bullying', desc: 'cgnvmvmv', status: 'Reported', time: '22/09/2023' },
        { rid: 7, title: 'Logout', topic: 'Spam', desc: 'cnvgvmnvg', status: 'Accepted', time: '25/09/2023' },
        { rid: 8, title: 'Login', topic: 'Hate Speech', desc: 'gcvngvbmgv', status: 'Reported', time: '28/09/2023' },
        { rid: 9, title: 'Login', topic: 'Bullying', desc: 'gvbmhbmhb', status: 'Accepted', time: '3/10/2023' },
        { rid: 10, title: 'Logout', topic: 'Hate Speech', desc: 'gmgvhmhvm', status: 'Reported', time: '10/10/2023' },
    ];

    useEffect(() => {
        setReport(initialStorage)
    }, []);

    const columns = [
        {
            name: 'RID',
            selector: row => row.rid,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Title',
            selector: row => row.title,
        },
        {
            name: 'Topic',
            selector: row => row.topic,
        },
        {
            name: 'Description',
            selector: row => row.desc,
            hide: Media.SM
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true
        },
        {
            name: 'Time',
            selector: row => row.time,
            sortable: true,
            hide: Media.SM
        },
        {
            name: 'Action',
            cell: (row) => <button type="button" class="btn btn-danger">Delete</button>,
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
        title: {
            button: 'rgba(0,0,0,.54)',
            hover: 'rgba(0,0,0,.08)',
        },
    }, 'dark');

    return (
        <Sidebar>
            <div className="container-fluid">
                <br />
                <div className='PageTitle'>
                    <h2><i className="bi bi-flag-fill"></i> Report</h2>
                </div>

                <div className='user-table'>
                    <div className="card">
                        <div className="card-body">
                            <DataTable
                                customStyles={tableHeaderStyle}
                                columns={columns}
                                data={report}
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
export default UserReport;