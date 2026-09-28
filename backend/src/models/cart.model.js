const { pool } = require("../config/db");

// ============================================================
// FIND CART BY USER ID
// ============================================================

const findCartByUserId = async (userId) => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM carts
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    return rows[0] || null;
};

// ============================================================
// CREATE CART
// ============================================================

const createCart = async (userId) => {
    const [result] = await pool.query(
        `
        INSERT INTO carts (
            user_id,
            created_at,
            updated_at
        )
        VALUES (?, NOW(), NOW())
        `,
        [userId]
    );

    return result.insertId;
};

// ============================================================
// GET CART ITEMS
// ============================================================

const getCartItems = async (cartId) => {
    const query = `
        SELECT
            ci.id AS item_id,
            ci.quantity AS quantity,

            pv.id AS variant_id,
            pv.sku AS sku,
            pv.price_adjustment AS price_adjustment,
            pv.stock_quantity AS stock_quantity,
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

        FROM cart_items ci

        JOIN product_variants pv
            ON pv.id = ci.product_variant_id

        JOIN products p
            ON p.id = pv.product_id

        LEFT JOIN sizes s
            ON s.id = pv.size_id

        LEFT JOIN colors c
            ON c.id = pv.color_id

        WHERE ci.cart_id = ?
    `;

    const [rows] = await pool.query(
        query,
        [cartId]
    );

    return rows;
};

// ============================================================
// FIND CART ITEM BY ID
// ============================================================

const findCartItemById = async (itemId) => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM cart_items
        WHERE id = ?
        LIMIT 1
        `,
        [itemId]
    );

    return rows[0] || null;
};

// ============================================================
// FIND CART ITEM BY VARIANT
// ============================================================

const findCartItemByVariant = async (
    cartId,
    variantId
) => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM cart_items
        WHERE
            cart_id = ?
            AND product_variant_id = ?
        LIMIT 1
        `,
        [
            cartId,
            variantId,
        ]
    );

    return rows[0] || null;
};

// ============================================================
// ADD ITEM
// ============================================================

const addItem = async (
    cartId,
    variantId,
    quantity
) => {
    const [result] = await pool.query(
        `
        INSERT INTO cart_items (
            cart_id,
            product_variant_id,
            quantity,
            created_at,
            updated_at
        )
        VALUES (
            ?,
            ?,
            ?,
            NOW(),
            NOW()
        )
        `,
        [
            cartId,
            variantId,
            quantity,
        ]
    );

    return result.insertId;
};

// ============================================================
// UPDATE ITEM QUANTITY
// ============================================================

const updateItemQuantity = async (
    itemId,
    quantity
) => {
    const [result] = await pool.query(
        `
        UPDATE cart_items

        SET
            quantity = ?,
            updated_at = NOW()

        WHERE id = ?
        `,
        [
            quantity,
            itemId,
        ]
    );

    return result.affectedRows > 0;
};

// ============================================================
// DELETE ITEM
//
// Giữ lại hàm cũ để tránh làm hỏng code khác nếu có sử dụng.
// Tuy nhiên cart.service.js mới sẽ dùng deleteItemByCart().
// ============================================================

const deleteItem = async (itemId) => {
    const [result] = await pool.query(
        `
        DELETE FROM cart_items
        WHERE id = ?
        `,
        [itemId]
    );

    return result.affectedRows > 0;
};

// ============================================================
// DELETE ITEM BY CART
//
// SECURITY:
// Chỉ xóa nếu itemId thực sự thuộc đúng cartId.
// Đây là lớp bảo vệ thứ hai sau ownership check trong service.
// ============================================================

const deleteItemByCart = async (
    itemId,
    cartId
) => {
    const [result] = await pool.query(
        `
        DELETE FROM cart_items

        WHERE
            id = ?
            AND cart_id = ?
        `,
        [
            itemId,
            cartId,
        ]
    );

    return result.affectedRows > 0;
};

// ============================================================
// CLEAR CART
// ============================================================

const clearCart = async (cartId) => {
    const [result] = await pool.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        `,
        [cartId]
    );

    return result.affectedRows;
};

// ============================================================
// GET CART COUNT
// ============================================================

const getCartCount = async (cartId) => {
    const [rows] = await pool.query(
        `
        SELECT
            IFNULL(
                SUM(quantity),
                0
            ) AS totalItems,

            COUNT(*) AS distinctItems

        FROM cart_items

        WHERE cart_id = ?
        `,
        [cartId]
    );

    const result =
        rows[0] || {
            totalItems: 0,
            distinctItems: 0,
        };

    return {
        totalItems:
            Number(
                result.totalItems
            ),

        totalDistinctItems:
            Number(
                result.distinctItems
            ),
    };
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    findCartByUserId,
    createCart,
    getCartItems,
    findCartItemById,
    findCartItemByVariant,
    addItem,
    updateItemQuantity,

    // Legacy / compatibility
    deleteItem,

    // Secure ownership-aware delete
    deleteItemByCart,

    clearCart,
    getCartCount,
};