import {
    Link,
} from "react-router-dom";

import {
    FaFacebookF,
    FaInstagram,
    FaGithub,
} from "react-icons/fa";

function Footer() {
    const year =
        new Date().getFullYear();

    return (
        <footer className="sneaker-footer">
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-lg-5">
                        <Link
                            to="/"
                            className="sneaker-brand footer-brand"
                        >
                            SNEAKER
                            <span>SHOP</span>
                        </Link>

                        <p className="footer-description mt-3">
                            Nền tảng mua sắm giày
                            sneaker trực tuyến với
                            những sản phẩm nổi bật,
                            phong cách và phù hợp
                            với bạn.
                        </p>
                    </div>

                    <div className="col-6 col-lg-2">
                        <h6>
                            Mua sắm
                        </h6>

                        <Link to="/products">
                            Sản phẩm
                        </Link>

                        <Link to="/favorites">
                            Yêu thích
                        </Link>

                        <Link to="/cart">
                            Giỏ hàng
                        </Link>
                    </div>

                    <div className="col-6 col-lg-2">
                        <h6>
                            Tài khoản
                        </h6>

                        <Link to="/profile">
                            Hồ sơ
                        </Link>

                        <Link to="/orders">
                            Đơn hàng
                        </Link>

                        <Link to="/profile/addresses">
                            Địa chỉ
                        </Link>
                    </div>

                    <div className="col-lg-3">
                        <h6>
                            Theo dõi
                        </h6>

                        <div className="footer-socials">
                            <a href="#!">
                                <FaFacebookF />
                            </a>

                            <a href="#!">
                                <FaInstagram />
                            </a>

                            <a href="#!">
                                <FaGithub />
                            </a>
                        </div>
                    </div>
                </div>

                <hr />

                <div className="footer-bottom">
                    © {year} Sneaker Shop.
                    All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;