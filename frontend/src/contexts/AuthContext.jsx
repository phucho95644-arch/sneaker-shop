import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import authService from "../services/authService";

// ============================================================
// CONTEXT
// ============================================================

const AuthContext =
    createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({
    children,
}) {
    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    // ========================================================
    // LOGOUT
    // ========================================================

    const logout =
        useCallback(() => {
            localStorage.removeItem(
                "token"
            );

            setUser(null);
        }, []);

    // ========================================================
    // LOAD CURRENT USER
    // ========================================================

    const refreshUser =
        useCallback(
            async () => {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    setUser(null);
                    return null;
                }

                try {
                    const response =
                        await authService.getMe();

                    const currentUser =
                        response?.data
                            ?.user ||
                        null;

                    setUser(
                        currentUser
                    );

                    return currentUser;
                } catch {
                    logout();

                    return null;
                }
            },
            [logout]
        );

    // ========================================================
    // RESTORE SESSION
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const restore =
            async () => {
                try {
                    await refreshUser();
                } finally {
                    if (mounted) {
                        setLoading(
                            false
                        );
                    }
                }
            };

        restore();

        return () => {
            mounted = false;
        };
    }, [refreshUser]);

    // ========================================================
    // GLOBAL 401
    // ========================================================

    useEffect(() => {
        const handleUnauthorized =
            () => {
                logout();
            };

        window.addEventListener(
            "auth:unauthorized",
            handleUnauthorized
        );

        return () => {
            window.removeEventListener(
                "auth:unauthorized",
                handleUnauthorized
            );
        };
    }, [logout]);

    // ========================================================
    // LOGIN
    // ========================================================

    const login =
        useCallback(
            async (
                email,
                password
            ) => {
                const response =
                    await authService.login(
                        {
                            email,
                            password,
                        }
                    );

                const token =
                    response?.data
                        ?.token;

                const loggedUser =
                    response?.data
                        ?.user;

                if (
                    !token ||
                    !loggedUser
                ) {
                    throw new Error(
                        "Invalid login response"
                    );
                }

                localStorage.setItem(
                    "token",
                    token
                );

                setUser(
                    loggedUser
                );

                return loggedUser;
            },
            []
        );

    // ========================================================
    // REGISTER
    // ========================================================

    const register =
        useCallback(
            async (
                payload
            ) => {
                return authService.register(
                    payload
                );
            },
            []
        );

    // ========================================================
    // COMPUTED
    // ========================================================

    const isAuthenticated =
        Boolean(user);

    const isAdmin =
        user?.role ===
        "admin";

    // ========================================================
    // VALUE
    // ========================================================

    const value =
        useMemo(
            () => ({
                user,
                loading,

                isAuthenticated,
                isAdmin,

                login,
                register,
                logout,
                refreshUser,
            }),
            [
                user,
                loading,
                isAuthenticated,
                isAdmin,
                login,
                register,
                logout,
                refreshUser,
            ]
        );

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

export default AuthContext;