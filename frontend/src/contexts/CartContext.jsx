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

const CartContext = createContext(null);

// ============================================================
// CART PROVIDER
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
    // RESET CART
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
                    setLoading(true);

                    const response =
                        await cartService.getCart();

                    const cartData =
                        response?.data || {
                            items: [],
                        };

                    const items =
                        Array.isArray(
                            cartData?.items
                        )
                            ? cartData.items
                            : [];

                    setCart({
                        ...cartData,
                        items,
                    });

                    return {
                        ...cartData,
                        items,
                    };
                } catch (error) {
                    console.error(
                        "FETCH CART ERROR:",
                        error
                    );

                    throw error;
                } finally {
                    setLoading(false);
                }
            },
            [
                isAuthenticated,
                resetCart,
            ]
        );

    // ========================================================
    // INIT CART
    // ========================================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        let mounted = true;

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
                    !itemId
                ) {
                    throw new Error(
                        "Cart item id is required"
                    );
                }

                if (
                    quantity < 1
                ) {
                    throw new Error(
                        "Quantity must be at least 1"
                    );
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
                if (
                    !itemId
                ) {
                    throw new Error(
                        "Cart item id is required"
                    );
                }

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
    // TOTAL ITEMS
    // ========================================================

    const totalItems =
        useMemo(() => {
            return items.reduce(
                (
                    total,
                    item
                ) => {
                    return (
                        total +
                        Number(
                            item.quantity ||
                                0
                        )
                    );
                },
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
// USE CART
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

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default CartContext;