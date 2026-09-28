import {
    Navigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../contexts/AuthContext";

function AdminRoute({
    children,
}) {
    const {
        loading,
        isAuthenticated,
        isAdmin,
    } = useAuth();

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
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (!isAdmin) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}

export default AdminRoute;