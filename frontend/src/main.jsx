import {
    StrictMode,
} from "react";

import {
    createRoot,
} from "react-dom/client";

import {
    BrowserRouter,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "react-toastify/dist/ReactToastify.css";

import "./index.css";

import App from "./App.jsx";

import {
    AuthProvider,
} from "./contexts/AuthContext.jsx";

import {
    CartProvider,
} from "./contexts/CartContext.jsx";

createRoot(
    document.getElementById(
        "root"
    )
).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);