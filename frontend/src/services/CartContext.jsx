import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import cartService from "../services/cartService";

import {
    useAuth,
} from "./AuthContext";

// ============================================================
// CONTEXT
// ============================================================

const CartContext =
    createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export function CartProvider({
    children,
}) {
    const {
        isAuthenticated,
        loading: authLoading,
    } = useAuth();

    const [
        cart,
        setCart,
    ] = useState({
        items: [],
    });

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        initialized,
        setInitialized,
    ] = useState(false);

    // ========================================================
    // RESET
    // ========================================================

    const resetCart =
        useCallback(() => {
            setCart({
                items: [],
            });
        }, []);

    // ========================================================
    // FETCH CART
    // ========================================================

    const fetchCart =
        useCallback(
            async () => {
                if (
                    !isAuthenticated
                ) {
                    resetCart();

                    return null;
                }

                try {
                    setLoading(
                        true
                    );

                    const response =
                        await cartService.getCart();

                    const cartData =
                        response?.data ||
                        {
                            items: [],
                        };

                    setCart({
                        ...cartData,

                        items:
                            Array.isArray(
                                cartData?.items
                            )
                                ? cartData.items
                                : [],
                    });

                    return cartData;
                } catch (error) {
                    console.error(
                        "FETCH CART ERROR:",
                        error
                    );

                    throw error;
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                resetCart,
            ]
        );

    // ========================================================
    // RESTORE CART AFTER LOGIN
    // ========================================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        let mounted =
            true;

        const initializeCart =
            async () => {
                try {
                    if (
                        isAuthenticated
                    ) {
                        await fetchCart();
                    } else {
                        resetCart();
                    }
                } catch (error) {
                    console.error(
                        "CART INIT ERROR:",
                        error
                    );

                    if (mounted) {
                        resetCart();
                    }
                } finally {
                    if (mounted) {
                        setInitialized(
                            true
                        );
                    }
                }
            };

        initializeCart();

        return () => {
            mounted = false;
        };
    }, [
        authLoading,
        isAuthenticated,
        fetchCart,
        resetCart,
    ]);

    // ========================================================
    // ADD ITEM
    // ========================================================

    const addItem =
        useCallback(
            async (
                productVariantId,
                quantity = 1
            ) => {
                if (
                    !productVariantId
                ) {
                    throw new Error(
                        "Product variant is required"
                    );
                }

                const response =
                    await cartService.addItem(
                        productVariantId,
                        quantity
                    );

                await fetchCart();

                return response;
            },
            [
                fetchCart,
            ]
        );

    // ========================================================
    // UPDATE ITEM
    // ========================================================

    const updateItem =
        useCallback(
            async (
                itemId,
                quantity
            ) => {
                if (
                    quantity < 1
                ) {
                    return;
                }

                const response =
                    await cartService.updateItem(
                        itemId,
                        quantity
                    );

                await fetchCart();

                return response;
            },
            [
                fetchCart,
            ]
        );

    // ========================================================
    // REMOVE ITEM
    // ========================================================

    const removeItem =
        useCallback(
            async (
                itemId
            ) => {
                const response =
                    await cartService.removeItem(
                        itemId
                    );

                await fetchCart();

                return response;
            },
            [
                fetchCart,
            ]
        );

    // ========================================================
    // CLEAR CART
    // ========================================================

    const clearCart =
        useCallback(
            async () => {
                const response =
                    await cartService.clearCart();

                resetCart();

                return response;
            },
            [
                resetCart,
            ]
        );

    // ========================================================
    // ITEMS
    // ========================================================

    const items =
        Array.isArray(
            cart?.items
        )
            ? cart.items
            : [];

    // ========================================================
    // TOTAL QUANTITY
    // ========================================================

    const totalItems =
        useMemo(() => {
            return items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity ||
                            0
                    ),
                0
            );
        }, [
            items,
        ]);

    // ========================================================
    // VALUE
    // ========================================================

    const value =
        useMemo(
            () => ({
                cart,
                items,

                loading,
                initialized,

                totalItems,

                fetchCart,
                addItem,
                updateItem,
                removeItem,
                clearCart,
                resetCart,
            }),
            [
                cart,
                items,
                loading,
                initialized,
                totalItems,
                fetchCart,
                addItem,
                updateItem,
                removeItem,
                clearCart,
                resetCart,
            ]
        );

    return (
        <CartContext.Provider
            value={value}
        >
            {children}
        </CartContext.Provider>
    );
}

// ============================================================
// HOOK
// ============================================================

export function useCart() {
    const context =
        useContext(
            CartContext
        );

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}

export default CartContext;