const ApiError = require("../utils/ApiError");
const { pool } = require("../config/db");
const cartModel = require("../models/cart.model");

// ============================================================
// FIND VARIANT DETAIL
// ============================================================

const findVariantDetailed = async (variantId) => {
    const query = `
        SELECT
            pv.id AS variant_id,
            pv.sku,
            pv.price_adjustment,
            pv.stock_quantity,
            pv.status AS variant_status,

            p.id AS product_id,
            p.name AS product_name,
            p.slug AS product_slug,
            p.thumbnail AS product_thumbnail,
            p.price AS product_price,
            p.sale_price AS product_sale_price,
            p.status AS product_status,

            s.id AS size_id,
            s.size_name AS size_name,

            c.id AS color_id,
            c.name AS color_name,
            c.hex_code AS color_hex_code

        FROM product_variants pv

        JOIN products p
            ON p.id = pv.product_id

        LEFT JOIN sizes s
            ON s.id = pv.size_id

        LEFT JOIN colors c
            ON c.id = pv.color_id

        WHERE pv.id = ?

        LIMIT 1
    `;

    const [rows] =
        await pool.query(
            query,
            [variantId]
        );

    return rows[0] || null;
};

// ============================================================
// COMPUTE UNIT PRICE
// ============================================================

const computeUnitPrice = (
    productPrice,
    productSalePrice,
    priceAdjustment
) => {
    const base =
        productSalePrice != null
            ? Number(productSalePrice)
            : Number(productPrice);

    const adjustment =
        priceAdjustment != null
            ? Number(priceAdjustment)
            : 0;

    return (
        Number(base) +
        Number(adjustment)
    );
};

// ============================================================
// GET CART
// ============================================================

const getCart = async (userId) => {
    const cart =
        await cartModel
            .findCartByUserId(
                userId
            );

    if (!cart) {
        return {
            id: null,

            items: [],

            summary: {
                totalItems: 0,
                totalDistinctItems: 0,
                subtotal: 0,
            },
        };
    }

    const itemsRows =
        await cartModel
            .getCartItems(
                cart.id
            );

    let subtotal = 0;
    let totalItems = 0;

    const items =
        itemsRows.map(
            (row) => {
                const unitPrice =
                    computeUnitPrice(
                        row.product_price,
                        row.product_sale_price,
                        row.price_adjustment
                    );

                const quantity =
                    Number(
                        row.quantity
                    );

                const stockQuantity =
                    Number(
                        row.stock_quantity ||
                            0
                    );

                let available = true;

                let availabilityReason =
                    null;

                if (
                    row.product_status !==
                    "active"
                ) {
                    available = false;

                    availabilityReason =
                        "PRODUCT_INACTIVE";
                } else if (
                    row.variant_status !==
                    "active"
                ) {
                    available = false;

                    availabilityReason =
                        "VARIANT_INACTIVE";
                } else if (
                    stockQuantity === 0
                ) {
                    available = false;

                    availabilityReason =
                        "OUT_OF_STOCK";
                } else if (
                    quantity >
                    stockQuantity
                ) {
                    available = false;

                    availabilityReason =
                        "INSUFFICIENT_STOCK";
                }

                const subtotalItem =
                    unitPrice *
                    quantity;

                if (available) {
                    subtotal +=
                        subtotalItem;
                }

                totalItems +=
                    quantity;

                return {
                    id:
                        row.item_id,

                    product: {
                        id:
                            row.product_id,

                        name:
                            row.product_name,

                        slug:
                            row.product_slug,

                        thumbnail:
                            row.product_thumbnail,
                    },

                    variant: {
                        id:
                            row.variant_id,

                        sku:
                            row.sku,

                        size:
                            row.size_id
                                ? {
                                      id:
                                          row.size_id,

                                      name:
                                          row.size_name,
                                  }
                                : null,

                        color:
                            row.color_id
                                ? {
                                      id:
                                          row.color_id,

                                      name:
                                          row.color_name,

                                      hexCode:
                                          row.color_hex_code,
                                  }
                                : null,

                        stockQuantity,

                        status:
                            row.variant_status,
                    },

                    quantity,

                    unitPrice,

                    subtotal:
                        unitPrice *
                        quantity,

                    available,

                    availabilityReason,
                };
            }
        );

    const summary = {
        totalItems,

        totalDistinctItems:
            items.length,

        subtotal,
    };

    return {
        id: cart.id,
        items,
        summary,
    };
};

// ============================================================
// GET CART COUNT
// ============================================================

const getCartCount =
    async (userId) => {
        const cart =
            await cartModel
                .findCartByUserId(
                    userId
                );

        if (!cart) {
            return {
                totalItems: 0,
                totalDistinctItems: 0,
            };
        }

        return await cartModel
            .getCartCount(
                cart.id
            );
    };

// ============================================================
// ADD ITEM
// ============================================================

const addItem = async (
    userId,
    productVariantId,
    quantity
) => {
    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity < 1
    ) {
        throw new ApiError(
            400,
            "quantity must be integer >= 1"
        );
    }

    // ========================================================
    // VALIDATE VARIANT
    // ========================================================

    const variant =
        await findVariantDetailed(
            productVariantId
        );

    if (!variant) {
        throw new ApiError(
            404,
            "Product variant not found"
        );
    }

    if (
        variant.product_status !==
        "active"
    ) {
        throw new ApiError(
            400,
            "Product is not active"
        );
    }

    if (
        variant.variant_status !==
        "active"
    ) {
        throw new ApiError(
            400,
            "Variant is not active"
        );
    }

    const stock =
        Number(
            variant.stock_quantity ||
                0
        );

    if (stock === 0) {
        throw new ApiError(
            400,
            "Out of stock"
        );
    }

    if (
        quantity >
        stock
    ) {
        throw new ApiError(
            400,
            "Requested quantity exceeds stock"
        );
    }

    // ========================================================
    // GET OR CREATE CART
    // ========================================================

    let cart =
        await cartModel
            .findCartByUserId(
                userId
            );

    if (!cart) {
        const cartId =
            await cartModel
                .createCart(
                    userId
                );

        cart = {
            id: cartId,
        };
    }

    // ========================================================
    // EXISTING ITEM
    // ========================================================

    const existing =
        await cartModel
            .findCartItemByVariant(
                cart.id,
                productVariantId
            );

    if (existing) {
        const newQuantity =
            Number(
                existing.quantity
            ) +
            Number(
                quantity
            );

        if (
            newQuantity >
            stock
        ) {
            throw new ApiError(
                400,
                "Requested quantity exceeds stock"
            );
        }

        await cartModel
            .updateItemQuantity(
                existing.id,
                newQuantity
            );

        return {
            id:
                existing.id,
        };
    }

    // ========================================================
    // ADD NEW ITEM
    // ========================================================

    try {
        const id =
            await cartModel
                .addItem(
                    cart.id,
                    productVariantId,
                    quantity
                );

        return {
            id,
        };
    } catch (error) {
        // Handle possible duplicate race condition
        if (
            error &&
            error.code ===
                "ER_DUP_ENTRY"
        ) {
            const reloaded =
                await cartModel
                    .findCartItemByVariant(
                        cart.id,
                        productVariantId
                    );

            if (!reloaded) {
                throw error;
            }

            const newQuantity =
                Number(
                    reloaded.quantity
                ) +
                Number(
                    quantity
                );

            if (
                newQuantity >
                stock
            ) {
                throw new ApiError(
                    400,
                    "Requested quantity exceeds stock"
                );
            }

            await cartModel
                .updateItemQuantity(
                    reloaded.id,
                    newQuantity
                );

            return {
                id:
                    reloaded.id,
            };
        }

        throw error;
    }
};

// ============================================================
// UPDATE ITEM
// ============================================================

const updateItem = async (
    userId,
    itemId,
    quantity
) => {
    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity < 1
    ) {
        throw new ApiError(
            400,
            "quantity must be integer >= 1"
        );
    }

    const item =
        await cartModel
            .findCartItemById(
                itemId
            );

    if (!item) {
        throw new ApiError(
            404,
            "Cart item not found"
        );
    }

    // ========================================================
    // OWNERSHIP CHECK
    // ========================================================

    const cart =
        await cartModel
            .findCartByUserId(
                userId
            );

    if (
        !cart ||
        Number(
            item.cart_id
        ) !==
            Number(
                cart.id
            )
    ) {
        throw new ApiError(
            404,
            "Cart item not found"
        );
    }

    // ========================================================
    // VARIANT CHECK
    // ========================================================

    const variant =
        await findVariantDetailed(
            item.product_variant_id
        );

    if (!variant) {
        throw new ApiError(
            404,
            "Product variant not found"
        );
    }

    if (
        variant.product_status !==
        "active"
    ) {
        throw new ApiError(
            400,
            "Product is not active"
        );
    }

    if (
        variant.variant_status !==
        "active"
    ) {
        throw new ApiError(
            400,
            "Variant is not active"
        );
    }

    const stock =
        Number(
            variant.stock_quantity ||
                0
        );

    if (
        quantity >
        stock
    ) {
        throw new ApiError(
            400,
            "Requested quantity exceeds stock"
        );
    }

    await cartModel
        .updateItemQuantity(
            itemId,
            quantity
        );
};

// ============================================================
// REMOVE ITEM
//
// SECURITY:
// User chỉ được xóa item thuộc cart của chính mình.
// Trả 404 nếu item không tồn tại hoặc thuộc user khác,
// tránh tiết lộ dữ liệu của user khác.
// ============================================================

const removeItem = async (
    userId,
    itemId
) => {
    const item =
        await cartModel
            .findCartItemById(
                itemId
            );

    if (!item) {
        throw new ApiError(
            404,
            "Cart item not found"
        );
    }

    const cart =
        await cartModel
            .findCartByUserId(
                userId
            );

    if (
        !cart ||
        Number(
            item.cart_id
        ) !==
            Number(
                cart.id
            )
    ) {
        throw new ApiError(
            404,
            "Cart item not found"
        );
    }

    // Defense-in-depth:
    // DELETE yêu cầu cả itemId và cartId cùng khớp.
    const deleted =
        await cartModel
            .deleteItemByCart(
                itemId,
                cart.id
            );

    if (!deleted) {
        throw new ApiError(
            404,
            "Cart item not found"
        );
    }
};

// ============================================================
// CLEAR CART
// ============================================================

const clearCart =
    async (userId) => {
        const cart =
            await cartModel
                .findCartByUserId(
                    userId
                );

        if (!cart) {
            return;
        }

        await cartModel
            .clearCart(
                cart.id
            );
    };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    getCart,
    getCartCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};