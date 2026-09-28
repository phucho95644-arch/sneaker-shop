import {
    Outlet,
} from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function MainLayout() {
    return (
        <div className="app-layout">
            <Header />

            <main className="app-main">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;