import {
    ToastContainer,
} from "react-toastify";

import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <>
            <AppRoutes />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                pauseOnHover
            />
        </>
    );
}

export default App;