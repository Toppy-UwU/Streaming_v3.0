import React, { useEffect, useState } from 'react';
import DataTable, { createTheme, Media } from "react-data-table-component";
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import NotFoundPage from './notfoundPage';
import { getAPI } from '../components/callAPI';
import './../css/utilities.css';
import { isAdmin } from '../components/session';
import "../css/admin.css";
import './../config';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState([]);

  const [tags, setTags] = useState([]);
  const [searchTag, setSearchTag] = useState('');
  const [filterTag, setFilterTag] = useState([]);

  const [permit, setPermit] = useState([]);
  const ip = global.config.ip.ip;
  const api = ip + '/get/user/permit';
  document.title = "Dashboard";

  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const response = await getAPI('users');
        setUsers(response);
        setFilter(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchDataTag = async () => { //fetch Tags from DB
      try {
        const response = await getAPI('tags');
        setTags(response);
        setFilterTag(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchDataPermit = async () => { //fetch Tags from DB
      try {
        const response = await fetch(api);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setPermit(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataUser();
    fetchDataTag();
    fetchDataPermit();
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

  useEffect(() => { //handle table search
    const result = tags.filter((item) => {
      return item.T_name.toLowerCase().match(searchTag.toLocaleLowerCase());
    });
    setFilterTag(result);
  }, [searchTag]);

  const columns = [
    {
      name: 'Name',
      selector: row => row.U_name,
      sortable: true
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
      name: 'Action',
      cell: (row) => (
        <Link to={`/profile?profile=${row.U_id}`}>
          <button
            className="btn btn-secondary"
            type="button"
          >
            <i className="bi bi-person-fill"></i>
          </button>
        </Link>
      ),
    }
  ]

  const columnsTag = [
    {
      name: 'Tag',
      selector: row => row.T_name,
      sortable: true,
      cell: (row) => (
        <Link className="text-decoration-none text-white" to={"/tag?tag=" + row.T_name}>{row.T_name}</Link>
      )
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
      default: "#2C3034"
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

  if (isAdmin()) {
    return (
      <AdminSidebar>
        <div className='container-fluid content'>
          <div className='PageTitle'>
            <h2><i className="bi bi-box-fill"></i> Dashboard</h2>
            <p>Welcome to Administator Dashboard!</p>
          </div>

          <div className='showStatus'>
            <div class="row">
              <div class="col-sm-4 mb-3 mb-sm-0">
                <Link className="text-decoration-none" to={'/admin/users'}>
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">{users.length} <span class="bi bi-person-check-fill"></span> </h5>
                      <p class="card-text">Total Users</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div class="col-sm-4 mb-3 mb-sm-0">
                <Link className="text-decoration-none" to={'/admin/videos'}>
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">{users.reduce((a, user) => a + parseFloat(user.U_vid), 0)} <span class="bi bi-file-earmark-play-fill"></span></h5>
                      <p class="card-text">Total Videos </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div class="col-sm-4 mb-3 mb-sm-0">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">
                      {permit}
                      <span class="bi bi-cloud-check-fill"></span>
                    </h5>
                    <p class="card-text">Upload Permit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='user-table'>
            <div className='row'>
              <div className='col-md-8 mb-3'>
                <div className="card">
                  <div className='card-header'>
                    <Link className="text-decoration-none" to={'/admin/users'}><h4 className='text-white fw-bold'><i className="bi bi-people-fill"></i> Users</h4></Link>
                  </div>
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
              <div className='col-md-4'>
                <div className="card">
                  <div className='card-header'>
                    <Link className="text-decoration-none" to={'/admin/tag'}><h4 className='text-white fw-bold'><i className="bi bi-tag-fill"></i> Tags</h4></Link>
                  </div>
                  <div className="card-body">
                    <DataTable
                      customStyles={tableHeaderStyle}
                      columns={columnsTag}
                      data={filterTag}
                      pagination
                      fixedHeader
                      highlightOnHover
                      theme="solarized"
                      subHeader
                      subHeaderComponent={
                        <input type="text"
                          className="w-25 form-control"
                          placeholder="Search..."
                          value={searchTag}
                          onChange={(e) => setSearchTag(e.target.value)}
                        />
                      }
                    ></DataTable>
                  </div>
                </div>
              </div>
            </div>
            <br />
          </div>
        </div>
      </AdminSidebar>
    );
  } else {
    return (
      <NotFoundPage />
    );
  }
};

export default Home;