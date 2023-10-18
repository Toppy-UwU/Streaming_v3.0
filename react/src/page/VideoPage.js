import Sidebar from '../components/sidebar';
import { useEffect, useState } from 'react';
import { getlocalData, getToken } from "../components/session";
import moment from 'moment';
import DataTable, { createTheme, Media } from "react-data-table-component";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserVideos = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState([]);

  document.title = "CS-HUB";
  const ip = global.config.ip.ip;
  const session = getlocalData('session');
  const getUserVideo = `${ip}/getVideos/profile?u=${session.U_id}&p=all`;
  const clearApi = ip + '/delete/video/user';

  const fetchData = async () => {
    try {
      const response = await fetch(getUserVideo);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
        setFilter(data);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const result = videos.filter((item) => {
      const lowerCaseSearch = search.toLowerCase();
      return item.V_title.toLowerCase().includes(lowerCaseSearch) ||
      item.V_permit.toLowerCase().includes(lowerCaseSearch);
    });
    setFilter(result);
  }, [search]);

  const handleClear = async (U_id, U_folder, V_encode) => {
    const tmp = {
      'U_id': U_id,
      'U_folder': U_folder,
      'V_encode': V_encode
    }

    try {
      const response = await fetch(clearApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(tmp)
      });

      if (!response.ok) {
        throw new Error('Clearing failed');
      } else {
        Swal.fire({
          icon: 'success',
          title: "Deleted!",
          showConfirmButton: false,
          timer: 2000,
          didClose: (
            fetchData()
          )
        })
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleBtn = (U_id, U_folder, V_encode) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Your video will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        handleClear(U_id, U_folder, V_encode);
      }
    });
  }

  const columns = [
    {
      name: 'Video',
      selector: row => row.V_pic,
      cell: (row) => (
        <img height={120} width={160} style={{ borderRadius: "10px" }} src={`data:image/jpeg;base64, ${row.V_pic}`} alt={`${row.V_title}`} />
      ),
      hide: Media.MD
    },
    {
      name: 'Title',
      selector: row => row.V_title,
      cell: (row) => <Link className="text-decoration-none text-white" to={`/watch?u=${row.U_folder}&v=${row.V_encode}`}>{row.V_title}</Link>
    },
    {
      name: 'Permit',
      selector: row => row.V_permit,
      cell: (row) => (row.V_permit.toUpperCase()),
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.V_upload,
      cell: (row) => <span>{moment.utc(row.V_upload).format("DD MMMM YYYY")}</span>,
      sortable: true,
      hide: Media.SM
    },
    {
      name: 'Views',
      selector: row => row.V_view,
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
              <Link className="dropdown-item" to={`/watch?u=${row.U_folder}&v=${row.V_encode}`}>
                <span><i className="bi bi-play-btn"></i> View</span>
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="#" onClick={() => handleBtn(session.U_id, row.U_folder, row.V_encode)}>
                <span><i className="bi bi-trash3"></i> Delete</span>
              </Link>
            </li>
          </ul>
        </div>
      ),
    }
  ];

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
  };

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

  if (videos.length > 0) {
    return (
      <div>
        <Sidebar>
          <div className='container-fluid'>
            <br />
            <div className='PageTitle'>
              <h2><i className="bi bi-collection-play-fill"></i> {session.username} Videos</h2>
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
        </Sidebar>
      </div>
    );
  } else {
    return (
      <div>
        <Sidebar>
          <div className='container-fluid'>
            <br />
            <div className='PageTitle'>
              <h2><i className="bi bi-collection-play-fill"></i> {session.username} Videos</h2>
            </div>
            <div className='user-table'>
              <p>No videos found.</p>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }
};

export default UserVideos;