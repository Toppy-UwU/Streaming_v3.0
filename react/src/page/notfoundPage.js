import "../css/notfound.css";

const NotFoundPage = () => {

    document.title = "404 : NOT FOUND";
    return (
        <section className="page_404">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="center-container">
                            <div className="col-sm-10 col-sm-offset-1 text-center">
                                <div className="four_zero_four_bg">
                                    <h1 className="text-center">404</h1>
                                </div>
                                <div className="contant_box_404">
                                    <h3 className="h2">Look like you're lost</h3>
                                    <p>the page you are looking for not available!</p>
                                    <a href="/" className="link_404">Back to Home</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotFoundPage;
