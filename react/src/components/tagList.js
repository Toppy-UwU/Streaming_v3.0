import { useEffect, useState } from "react"
import { getAPI } from "./callAPI";
import ReactModal from "react-modal";
import { getToken } from "./session";
import '../config';

const TagList = () => {
    const [ tags, setTags ] = useState(null);
    const [ showTags, setShowTags] = useState(null);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ newTag, setNewTag ] = useState('');
    const [ reload, setReload ] = useState(true);
    const ip = global.config.ip.ip;

    const insert_api = ip+'/insert/tag';

    useEffect(() => {
        getAPI('tags')
        .then(response => {
        setTags(response);
        setShowTags(response);
        })
    }, [reload])

    const changeTag = (tag) => {
        window.location.href = '/tag?tag='+tag
    }

    const handleDeleteTag = (T_ID) => {
        const delete_api = ip+'/delete/tag?t=' + T_ID 
        const token = getToken();
        fetch(delete_api, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => {
            if(response.ok) {
                setReload(!reload);
                closeModal();
            }
        })
        .catch((e) => {
            console.error(e);
        })
    }

    const searchTag = (e) => {
        e.preventDefault();
        if(e.target.value === ''){
            setShowTags(tags)
        }else {
            const input = e.target.value;
            const tmp = tags.filter(tag =>
                tag.T_name.toLowerCase().includes(input.toLowerCase())
            );
            setShowTags(tmp);
        }
      };

      const openModal = () => {
        setIsOpen(true)
      }
  
      const closeModal = () => {
        setIsOpen(false)
      }

      const handleNewTag = (e) => {
        e.preventDefault();
        setNewTag(e.target.value);
      }

      const handleAddNewTag = () => {
        const tmp = newTag.split(',').map(tag => tag.trim());
        const token = getToken();
        fetch(insert_api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tmp)
        })
        .then((response) => {
            if(response.ok) {
                setReload(!reload);
                closeModal();
            }
        })
        .catch((e) => {
            console.error(e);
        })
      }

      const modalStyle = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          height: 'max-content',
          backgroundColor: 'rgb(44, 48, 56)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      };
    

    if(tags) {
        return (
            <div style={{height: '80vh'}}>
                <div className="row">
                    <div className="col input-group">
                        <input type="text" className="form-control" placeholder="search tag" onChange={searchTag} defaultValue={''}/>
                    </div>
                </div>
                    <div className='row' style={{margin: '10px'}}>
                        {showTags && showTags.map((tag, index) => (
                            <div className='col-auto' key={index}>
                                <div className="dropdown" style={{ marginTop: '5px', color: 'black' }}>
                                    <button className="btn btn-outline-dark rounded-pill" type="button" id="dropdownTag" aria-haspopup="true" data-bs-toggle="dropdown" aria-expanded="false">{tag.T_name} : {tag.count}</button>
                                    <div className='dropdown-menu dropdown-menu-dark ' aria-labelledby='dropdownTag'>
                                        <button className='dropdown-item' onClick={() => changeTag(tag.T_name)}>Videos</button>
                                        <button className='dropdown-item'onClick={() => handleDeleteTag(tag.T_ID)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className='col-auto'>
                                <button className='btn btn-success rounded-pill' style={{marginTop: '5px'}} onClick={openModal}>
                                    + New Tag
                                </button>
                        </div>

                        <ReactModal isOpen={isOpen} onRequestClose={closeModal} style={modalStyle}>
                            <div className="row" style={{backgroundColor: 'white', margin: '5px'}}>
                                <div className="col">
                                <h4>Adding new tag</h4>
                                <h6>If you want to add multiple tag use , to saperate them</h6>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <input type="text" className="form-control" placeholder="add new tag name" onChange={handleNewTag}/>
                                </div>
                            </div>
                            <div className="row center">
                                <div className="col center">
                                    <button className="btn btn-primary" style={{margin: '10px'}} onClick={handleAddNewTag}>Save</button>
                                    <button className="btn btn-danger" style={{margin: '10px'}} onClick={closeModal}>Cancle</button>
                                </div>
                            </div>
                        </ReactModal>

                    </div>
            </div>
        )
    }else {
        return (
            <div className="center">
                <div className="loading" />
            </div>
        )
    }
}

export default TagList