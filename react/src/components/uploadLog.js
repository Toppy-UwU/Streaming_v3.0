import { useEffect, useState } from "react"
import { getAPI } from "./callAPI";


const UploadLog = () => {
    const [ logs, setLogs ] = useState(null);
    

    useEffect(() => {
        getAPI('uploadLog')
        .then(response => {
            setLogs(response)
        })
    }, [])

    if(logs) {
        return (
            <div>
                
                <table className="table table-striped table-dark">
                <thead>
                    <tr>
                        <th>Video</th>
                        <th>User</th>
                        <th>Upload Time</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}> 
                            <td>
                                <div className="row">
                                    <div className="col-3">
                                        <a className="href-noline-in" href={'/watch?u='+ log.U_folder + '&v=' + log.V_encode}>
                                            <img className="card-img-top " src={'data:image/jpeg;base64,' + log.V_pic} style={{borderRadius: '20px'}} alt={log.V_title+' thumbnail'} />
                                        </a>
                                    </div>
                                    <div className="col">
                                    <a className="href-noline-in" href={'/watch?u='+ log.U_folder + '&v=' + log.V_encode}>

                                        <div><h4>Title: {log.V_title}</h4>  </div> 
                                        <div><h4>encode: {log.V_encode}</h4>  </div> 
                                    </a>
                                    </div> 
                                </div>
                            </td>
                            <td className="col-2">
                                <div className="row">
                                <a className="href-noline-in" href={'/profile?profile='+log.U_ID}>

                                    <div className="col">
                                        <div><h4>User ID: {log.U_ID}</h4></div>
                                        <div><h4>User name: {log.U_name}</h4></div>
                                    </div>
                                    </a>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <h5>{log.V_upload}</h5>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            </div>
        )
    }else {
        return(
            <div className="center">
                <div className="loading" />
            </div>
        )
    }
}

export default UploadLog