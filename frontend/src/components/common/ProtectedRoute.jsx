import {
    Navigate,
    useLocation,
} from "react-router-dom";

import {
    useAuth,
} from "../../contexts/AuthContext";

function ProtectedRoute({
    children,
}) {
    const {
        loading,
        isAuthenticated,
    } = useAuth();

    const location =
        useLocation();

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight:
                        "60vh",
                }}
            >
                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Đang tải...
                    </span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location,
                }}
            />
        );
    }

    return children;
}

export default ProtectedRoute;