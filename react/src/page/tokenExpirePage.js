import "./../css/login.css"
import { Link } from "react-router-dom";

const TokenExpirePage = () => {
    return (
        <div className="container-fluid background-container d-flex justify-content-center align-items-center py-3">
            <div className="card text-bg-dark w-50">
                <div className="card-body">
                    <div className='notfound-vid'>
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <p>Your token has expired</p>
                        <p className="mb-4">Please login again</p>
                        <Link to="/login"><button type="button" className="btn btn-outline-primary">Login</button></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TokenExpirePage;