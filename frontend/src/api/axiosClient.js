import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const axiosClient = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

axiosClient.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) =>
        Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

axiosClient.interceptors.response.use(
    (response) =>
        response,

    (error) => {
        // Không tự redirect ở đây.
        // AuthContext / ProtectedRoute sẽ quản lý auth state.
        if (
            error.response?.status ===
            401
        ) {
            window.dispatchEvent(
                new CustomEvent(
                    "auth:unauthorized"
                )
            );
        }

        return Promise.reject(
            error
        );
    }
);

export default axiosClient;