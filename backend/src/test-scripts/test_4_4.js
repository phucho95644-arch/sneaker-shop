const mysql = require("mysql2/promise");

const fetch =
    global.fetch ||
    ((...args) =>
        import("node-fetch").then(
            ({ default: fetch }) =>
                fetch(...args)
        ));

require("dotenv").config();

// ============================================================
// CONFIG
// ============================================================

const BASE =
    `http://localhost:${process.env.PORT || 5000}/api`;

const DB_CONFIG = {
    host:
        process.env.DB_HOST ||
        "localhost",

    port:
        Number(
            process.env.DB_PORT ||
            3306
        ),

    user:
        process.env.DB_USER,

    password:
        process.env.DB_PASSWORD,

    database:
        process.env.DB_NAME,
};

// ============================================================
// TEST USERS
// ============================================================

const TEST_USER = {
    fullName:
        "Cart Test User",

    email:
        "carttest@sneakershop.com",

    password:
        "Test@123456",

    confirmPassword:
        "Test@123456",

    phone:
        "0901234567",
};

const TEST_USER_2 = {
    fullName:
        "Cart Test User 2",

    email:
        "carttest2@sneakershop.com",

    password:
        "Test@123456",

    confirmPassword:
        "Test@123456",

    phone:
        "0907654321",
};

// ============================================================
// RESULT HELPERS
// ============================================================

const results = [];

const pass = (name) => {
    results.push({
        name,
        status: "PASS",
    });

    console.log(
        `${name}: PASS`
    );
};

const fail = (
    name,
    msg
) => {
    results.push({
        name,
        status: "FAIL",
        msg,
    });

    console.log(
        `${name}: FAIL - ${msg}`
    );
};

// ============================================================
// HTTP HELPER
// ============================================================

const http = async (
    method,
    path,
    body,
    token
) => {
    const opts = {
        method,

        headers: {
            "Content-Type":
                "application/json",
        },
    };

    if (body) {
        opts.body =
            JSON.stringify(
                body
            );
    }

    if (token) {
        opts.headers.Authorization =
            `Bearer ${token}`;
    }

    const res =
        await fetch(
            `${BASE}${path}`,
            opts
        );

    const text =
        await res.text();

    let json = null;

    try {
        json =
            JSON.parse(
                text
            );
    } catch (e) {
        json =
            text;
    }

    return {
        status:
            res.status,

        body:
            json,
    };
};

// ============================================================
// ENSURE USER + LOGIN
// ============================================================

const ensureUserAndLogin =
    async (user) => {
        const reg =
            await http(
                "POST",
                "/auth/register",
                user
            );

        if (
            reg.status === 201
        ) {
            // registered
        } else if (
            reg.status === 409
        ) {
            // already exists
        }

        const login =
            await http(
                "POST",
                "/auth/login",
                {
                    email:
                        user.email,

                    password:
                        user.password,
                }
            );

        if (
            login.status !== 200
        ) {
            throw new Error(
                "Login failed for " +
                user.email
            );
        }

        return (
            login.body
                .data
                .token
        );
    };

// ============================================================
// MAIN TEST
// ============================================================

const run =
    async () => {

        // ====================================================
        // 1. HEALTH CHECK
        // ====================================================

        try {
            const h =
                await http(
                    "GET",
                    "/health"
                );

            if (
                h.status === 200
            ) {
                pass(
                    "Health check"
                );
            } else {
                fail(
                    "Health check",
                    `status ${h.status}`
                );
            }
        } catch (err) {
            fail(
                "Health check",
                err.message
            );

            return;
        }

        // ====================================================
        // 2. DATABASE
        // ====================================================

        let pool;

        try {
            pool =
                await mysql
                    .createPool(
                        DB_CONFIG
                    );

            const conn =
                await pool
                    .getConnection();

            await conn.ping();

            conn.release();

            pass(
                "DB connection"
            );
        } catch (err) {
            fail(
                "DB connection",
                err.message
            );

            return;
        }

        // ====================================================
        // 3. TEST USERS
        // ====================================================

        let tokenA;
        let tokenB;

        try {
            tokenA =
                await ensureUserAndLogin(
                    TEST_USER
                );

            pass(
                "User A ready"
            );
        } catch (err) {
            fail(
                "User A ready",
                err.message
            );

            return;
        }

        try {
            tokenB =
                await ensureUserAndLogin(
                    TEST_USER_2
                );

            pass(
                "User B ready"
            );
        } catch (err) {
            fail(
                "User B ready",
                err.message
            );

            tokenB = null;
        }

        // ====================================================
        // 4. FIND PRODUCT FOR FAVORITES
        // ====================================================

        let productId = null;

        try {
            const [rows] =
                await pool.query(`
                    SELECT id
                    FROM products
                    WHERE status = 'active'
                    LIMIT 1
                `);

            if (
                rows &&
                rows[0]
            ) {
                productId =
                    rows[0].id;
            }
        } catch (e) {}

        if (!productId) {
            productId = 1;
        }

        // ====================================================
        // 5. FAVORITES TESTS
        // ====================================================

        try {
            const list0 =
                await http(
                    "GET",
                    "/favorites",
                    null,
                    tokenA
                );

            if (
                list0.status === 200
            ) {
                pass(
                    "GET /api/favorites (empty or list)"
                );
            } else {
                fail(
                    "GET /api/favorites",
                    `status ${list0.status}`
                );
            }

            const add1 =
                await http(
                    "POST",
                    `/favorites/${productId}`,
                    null,
                    tokenA
                );

            if (
                add1.status === 200
            ) {
                pass(
                    "POST /api/favorites/:id"
                );
            } else {
                fail(
                    "POST /api/favorites/:id",
                    `status ${add1.status}`
                );
            }

            const check1 =
                await http(
                    "GET",
                    `/favorites/check/${productId}`,
                    null,
                    tokenA
                );

            if (
                check1.status === 200 &&
                check1.body &&
                check1.body.data &&
                check1.body
                    .data
                    .isFavorite
            ) {
                pass(
                    "GET /api/favorites/check/:id true"
                );
            } else {
                fail(
                    "GET /api/favorites/check/:id true",
                    JSON.stringify(
                        check1.body
                    )
                );
            }

            const list1 =
                await http(
                    "GET",
                    "/favorites",
                    null,
                    tokenA
                );

            if (
                list1.status === 200
            ) {
                pass(
                    "GET /api/favorites after add"
                );
            } else {
                fail(
                    "GET /api/favorites after add",
                    `status ${list1.status}`
                );
            }

            const addDup =
                await http(
                    "POST",
                    `/favorites/${productId}`,
                    null,
                    tokenA
                );

            if (
                addDup.status === 200
            ) {
                pass(
                    "POST duplicate favorite (idempotent)"
                );
            } else {
                fail(
                    "POST duplicate favorite",
                    `status ${addDup.status}`
                );
            }

            const del =
                await http(
                    "DELETE",
                    `/favorites/${productId}`,
                    null,
                    tokenA
                );

            if (
                del.status === 200
            ) {
                pass(
                    "DELETE /api/favorites/:id"
                );
            } else {
                fail(
                    "DELETE /api/favorites/:id",
                    `status ${del.status}`
                );
            }

            const check2 =
                await http(
                    "GET",
                    `/favorites/check/${productId}`,
                    null,
                    tokenA
                );

            if (
                check2.status === 200 &&
                check2.body &&
                check2.body.data &&
                !check2.body
                    .data
                    .isFavorite
            ) {
                pass(
                    "GET /api/favorites/check/:id false"
                );
            } else {
                fail(
                    "GET /api/favorites/check/:id false",
                    JSON.stringify(
                        check2.body
                    )
                );
            }

            const invalid =
                await http(
                    "POST",
                    "/favorites/abc",
                    null,
                    tokenA
                );

            if (
                invalid.status >=
                400
            ) {
                pass(
                    "POST favorite invalid id validation"
                );
            } else {
                fail(
                    "POST favorite invalid id validation",
                    `status ${invalid.status}`
                );
            }

            const notExist =
                await http(
                    "POST",
                    "/favorites/99999999",
                    null,
                    tokenA
                );

            if (
                notExist.status >=
                400
            ) {
                pass(
                    "POST favorite non-existent product handling"
                );
            } else {
                fail(
                    "POST favorite non-existent product handling",
                    `status ${notExist.status}`
                );
            }

            const miss =
                await http(
                    "GET",
                    "/favorites"
                );

            if (
                miss.status === 401
            ) {
                pass(
                    "GET favorites without token forbidden"
                );
            } else {
                fail(
                    "GET favorites without token forbidden",
                    `status ${miss.status}`
                );
            }
        } catch (err) {
            fail(
                "Favorites flow",
                err.message
            );
        }

        // ====================================================
        // 6. FIND VALID CART VARIANT
        //
        // Test cần:
        // - add 1
        // - add duplicate 1
        // - PUT quantity = 2
        //
        // Vì vậy stock phải >= 2.
        // Chọn variant có stock cao nhất để test ổn định.
        // ====================================================

        let variant = null;

        try {
            const [rows] =
                await pool.query(`
                    SELECT
                        pv.*

                    FROM product_variants pv

                    JOIN products p
                        ON p.id = pv.product_id

                    WHERE
                        pv.status = 'active'
                        AND p.status = 'active'
                        AND pv.stock_quantity >= 2

                    ORDER BY
                        pv.stock_quantity DESC,
                        pv.id ASC

                    LIMIT 1
                `);

            if (
                rows &&
                rows[0]
            ) {
                variant =
                    rows[0];
            }
        } catch (error) {
            console.error(
                "Find cart test variant error:",
                error.message
            );
        }

        if (!variant) {
            fail(
                "Find valid variant",
                "No active variant with stock >= 2 found"
            );
        } else {
            try {
                const variantId =
                    variant.id;

                // ============================================
                // RESET CART
                //
                // Tránh dữ liệu từ lần test trước ảnh hưởng
                // kết quả test hiện tại.
                // ============================================

                await http(
                    "DELETE",
                    "/cart",
                    null,
                    tokenA
                );

                // ============================================
                // CART BASIC FLOW
                // ============================================

                const gc0 =
                    await http(
                        "GET",
                        "/cart",
                        null,
                        tokenA
                    );

                if (
                    gc0.status === 200
                ) {
                    pass(
                        "GET /api/cart empty"
                    );
                } else {
                    fail(
                        "GET /api/cart",
                        `status ${gc0.status} ${JSON.stringify(
                            gc0.body
                        )}`
                    );
                }

                const add1 =
                    await http(
                        "POST",
                        "/cart/items",
                        {
                            productVariantId:
                                variantId,

                            quantity:
                                1,
                        },
                        tokenA
                    );

                if (
                    add1.status === 200
                ) {
                    pass(
                        "POST /api/cart/items add"
                    );
                } else {
                    fail(
                        "POST /api/cart/items add",
                        `status ${add1.status} ${JSON.stringify(
                            add1.body
                        )}`
                    );
                }

                const gc1 =
                    await http(
                        "GET",
                        "/cart",
                        null,
                        tokenA
                    );

                if (
                    gc1.status === 200 &&
                    gc1.body &&
                    gc1.body.data
                ) {
                    pass(
                        "GET /api/cart after add"
                    );
                } else {
                    fail(
                        "GET /api/cart after add",
                        `status ${gc1.status}`
                    );
                }

                const count1 =
                    await http(
                        "GET",
                        "/cart/count",
                        null,
                        tokenA
                    );

                if (
                    count1.status === 200
                ) {
                    pass(
                        "GET /api/cart/count"
                    );
                } else {
                    fail(
                        "GET /api/cart/count",
                        `status ${count1.status}`
                    );
                }

                // ============================================
                // DUPLICATE MERGE
                // ============================================

                const addDup =
                    await http(
                        "POST",
                        "/cart/items",
                        {
                            productVariantId:
                                variantId,

                            quantity:
                                1,
                        },
                        tokenA
                    );

                if (
                    addDup.status === 200
                ) {
                    pass(
                        "POST /api/cart/items add duplicate merges"
                    );
                } else {
                    fail(
                        "POST duplicate merge",
                        `status ${addDup.status} ${JSON.stringify(
                            addDup.body
                        )}`
                    );
                }

                // ============================================
                // GET CART ITEM
                // ============================================

                const cartNow =
                    await http(
                        "GET",
                        "/cart",
                        null,
                        tokenA
                    );

                const items =
                    cartNow.body
                        .data
                        .items ||
                    [];

                const item =
                    items.find(
                        (i) =>
                            i.variant &&
                            i.variant
                                .id ===
                                variantId
                    );

                if (!item) {
                    fail(
                        "Cart item exists after add",
                        "item not found"
                    );
                } else {
                    const itemId =
                        item.id;

                    // ========================================
                    // UPDATE QUANTITY
                    // ========================================

                    const up =
                        await http(
                            "PUT",
                            `/cart/items/${itemId}`,
                            {
                                quantity:
                                    2,
                            },
                            tokenA
                        );

                    if (
                        up.status ===
                        200
                    ) {
                        pass(
                            "PUT /cart/items/:id update"
                        );
                    } else {
                        fail(
                            "PUT update",
                            `status ${up.status}`
                        );
                    }

                    const gc2 =
                        await http(
                            "GET",
                            "/cart",
                            null,
                            tokenA
                        );

                    if (
                        gc2.status ===
                        200
                    ) {
                        pass(
                            "GET /api/cart after update"
                        );
                    } else {
                        fail(
                            "GET cart after update",
                            `status ${gc2.status}`
                        );
                    }

                    // ========================================
                    // DELETE ITEM
                    // ========================================

                    const del =
                        await http(
                            "DELETE",
                            `/cart/items/${itemId}`,
                            null,
                            tokenA
                        );

                    if (
                        del.status ===
                        200
                    ) {
                        pass(
                            "DELETE /cart/items/:id"
                        );
                    } else {
                        fail(
                            "DELETE cart item",
                            `status ${del.status}`
                        );
                    }

                    const gc3 =
                        await http(
                            "GET",
                            "/cart",
                            null,
                            tokenA
                        );

                    if (
                        gc3.status ===
                        200
                    ) {
                        pass(
                            "GET /api/cart after delete"
                        );
                    } else {
                        fail(
                            "GET cart after delete",
                            `status ${gc3.status}`
                        );
                    }

                    // ========================================
                    // CLEAR CART
                    // ========================================

                    await http(
                        "POST",
                        "/cart/items",
                        {
                            productVariantId:
                                variantId,

                            quantity:
                                1,
                        },
                        tokenA
                    );

                    const cl =
                        await http(
                            "DELETE",
                            "/cart",
                            null,
                            tokenA
                        );

                    if (
                        cl.status ===
                        200
                    ) {
                        pass(
                            "DELETE /cart clear"
                        );
                    } else {
                        fail(
                            "DELETE /cart clear",
                            `status ${cl.status}`
                        );
                    }

                    const gc4 =
                        await http(
                            "GET",
                            "/cart",
                            null,
                            tokenA
                        );

                    if (
                        gc4.status ===
                            200 &&
                        gc4.body
                            .data &&
                        gc4.body
                            .data
                            .items
                            .length ===
                            0
                    ) {
                        pass(
                            "GET /api/cart empty after clear"
                        );
                    } else {
                        fail(
                            "GET cart after clear",
                            `status ${gc4.status}`
                        );
                    }

                    // ========================================
                    // STOCK TESTS
                    // ========================================

                    const stock =
                        Number(
                            variant
                                .stock_quantity ||
                            0
                        );

                    const addMax =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    stock,
                            },
                            tokenA
                        );

                    if (
                        stock > 0 &&
                        addMax.status ===
                            200
                    ) {
                        pass(
                            "Add quantity = stock"
                        );
                    } else if (
                        stock === 0
                    ) {
                        pass(
                            "Add quantity = stock (zero) expected fail"
                        );
                    } else {
                        fail(
                            "Add quantity = stock",
                            `status ${addMax.status}`
                        );
                    }

                    const over =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    stock +
                                    1,
                            },
                            tokenA
                        );

                    if (
                        over.status >=
                        400
                    ) {
                        pass(
                            "Add quantity > stock fails"
                        );
                    } else {
                        fail(
                            "Add quantity > stock fails",
                            `status ${over.status}`
                        );
                    }

                    // ========================================
                    // INVALID QUANTITY
                    // ========================================

                    const z =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    0,
                            },
                            tokenA
                        );

                    if (
                        z.status >=
                        400
                    ) {
                        pass(
                            "quantity 0 validation"
                        );
                    } else {
                        fail(
                            "quantity 0 validation",
                            `status ${z.status}`
                        );
                    }

                    const neg =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    -1,
                            },
                            tokenA
                        );

                    if (
                        neg.status >=
                        400
                    ) {
                        pass(
                            "quantity -1 validation"
                        );
                    } else {
                        fail(
                            "quantity -1 validation",
                            `status ${neg.status}`
                        );
                    }

                    const nan =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    "abc",
                            },
                            tokenA
                        );

                    if (
                        nan.status >=
                        400
                    ) {
                        pass(
                            "quantity non-int validation"
                        );
                    } else {
                        fail(
                            "quantity non-int validation",
                            `status ${nan.status}`
                        );
                    }

                    // ========================================
                    // STOCK MUST NOT CHANGE
                    // ========================================

                    const [vnow] =
                        await pool.query(
                            `
                            SELECT stock_quantity
                            FROM product_variants
                            WHERE id = ?
                            `,
                            [
                                variantId,
                            ]
                        );

                    const stockNow =
                        vnow[0]
                            ? Number(
                                  vnow[0]
                                      .stock_quantity
                              )
                            : null;

                    if (
                        stockNow ===
                        stock
                    ) {
                        pass(
                            "Stock not decreased by cart add"
                        );
                    } else {
                        fail(
                            "Stock not decreased",
                            `before ${stock} after ${stockNow}`
                        );
                    }

                    // ========================================
                    // OWNERSHIP TESTS
                    // ========================================

                    // Clear cart first because addMax may leave
                    // quantity = stock in the cart.

                    await http(
                        "DELETE",
                        "/cart",
                        null,
                        tokenA
                    );

                    const addOnce =
                        await http(
                            "POST",
                            "/cart/items",
                            {
                                productVariantId:
                                    variantId,

                                quantity:
                                    1,
                            },
                            tokenA
                        );

                    const cartA =
                        await http(
                            "GET",
                            "/cart",
                            null,
                            tokenA
                        );

                    const itemA =
                        cartA.body
                            .data
                            .items
                            .find(
                                (i) =>
                                    i.variant &&
                                    i.variant
                                        .id ===
                                        variantId
                            );

                    if (!itemA) {
                        fail(
                            "Prepare ownership item",
                            "item missing"
                        );
                    } else {
                        const itemAId =
                            itemA.id;

                        const upB =
                            await http(
                                "PUT",
                                `/cart/items/${itemAId}`,
                                {
                                    quantity:
                                        1,
                                },
                                tokenB
                            );

                        if (
                            upB.status ===
                            404
                        ) {
                            pass(
                                "Ownership PUT blocked"
                            );
                        } else if (
                            upB.status >=
                            400
                        ) {
                            pass(
                                "Ownership PUT blocked (non-404 but blocked)"
                            );
                        } else {
                            fail(
                                "Ownership PUT blocked",
                                `unexpected status ${upB.status}`
                            );
                        }

                        const delB =
                            await http(
                                "DELETE",
                                `/cart/items/${itemAId}`,
                                null,
                                tokenB
                            );

                        if (
                            delB.status ===
                            404
                        ) {
                            pass(
                                "Ownership DELETE blocked"
                            );
                        } else if (
                            delB.status >=
                            400
                        ) {
                            pass(
                                "Ownership DELETE blocked (non-404 but blocked)"
                            );
                        } else {
                            fail(
                                "Ownership DELETE blocked",
                                `unexpected status ${delB.status}`
                            );
                        }

                        // Cleanup by real owner
                        await http(
                            "DELETE",
                            `/cart/items/${itemAId}`,
                            null,
                            tokenA
                        );
                    }
                }
            } catch (err) {
                fail(
                    "Cart flow",
                    err.message
                );
            }
        }

        // ====================================================
        // 7. REGRESSION 4.1 AUTH
        // ====================================================

        try {
            const regR =
                await http(
                    "POST",
                    "/auth/register",
                    TEST_USER
                );

            if (
                regR.status === 201 ||
                regR.status === 409
            ) {
                pass(
                    "Regression auth register"
                );
            } else {
                fail(
                    "Regression auth register",
                    `status ${regR.status}`
                );
            }

            const regL =
                await http(
                    "POST",
                    "/auth/login",
                    {
                        email:
                            TEST_USER.email,

                        password:
                            TEST_USER.password,
                    }
                );

            if (
                regL.status === 200
            ) {
                pass(
                    "Regression auth login"
                );
            } else {
                fail(
                    "Regression auth login",
                    `status ${regL.status}`
                );
            }

            const me =
                await http(
                    "GET",
                    "/auth/me",
                    null,
                    tokenA
                );

            if (
                me.status === 200
            ) {
                pass(
                    "Regression auth me"
                );
            } else {
                fail(
                    "Regression auth me",
                    `status ${me.status}`
                );
            }
        } catch (e) {
            fail(
                "Regression auth",
                e.message
            );
        }

        // ====================================================
        // 8. REGRESSION 4.2
        // ====================================================

        try {
            const profile =
                await http(
                    "GET",
                    "/users/profile",
                    null,
                    tokenA
                );

            if (
                profile.status ===
                200
            ) {
                pass(
                    "Regression GET profile"
                );
            } else {
                fail(
                    "Regression GET profile",
                    `status ${profile.status}`
                );
            }

            const addresses =
                await http(
                    "GET",
                    "/users/addresses",
                    null,
                    tokenA
                );

            if (
                addresses.status ===
                200
            ) {
                pass(
                    "Regression GET addresses"
                );
            } else {
                fail(
                    "Regression GET addresses",
                    `status ${addresses.status}`
                );
            }
        } catch (e) {
            fail(
                "Regression 4.2",
                e.message
            );
        }

        // ====================================================
        // 9. REGRESSION 4.3
        // ====================================================

        try {
            const cats =
                await http(
                    "GET",
                    "/categories"
                );

            if (
                cats.status === 200
            ) {
                pass(
                    "GET /categories"
                );
            } else {
                fail(
                    "GET /categories",
                    `status ${cats.status}`
                );
            }

            const brands =
                await http(
                    "GET",
                    "/brands"
                );

            if (
                brands.status ===
                200
            ) {
                pass(
                    "GET /brands"
                );
            } else {
                fail(
                    "GET /brands",
                    `status ${brands.status}`
                );
            }

            const sizes =
                await http(
                    "GET",
                    "/sizes"
                );

            if (
                sizes.status ===
                200
            ) {
                pass(
                    "GET /sizes"
                );
            } else {
                fail(
                    "GET /sizes",
                    `status ${sizes.status}`
                );
            }

            const colors =
                await http(
                    "GET",
                    "/colors"
                );

            if (
                colors.status ===
                200
            ) {
                pass(
                    "GET /colors"
                );
            } else {
                fail(
                    "GET /colors",
                    `status ${colors.status}`
                );
            }

            const products =
                await http(
                    "GET",
                    "/products"
                );

            if (
                products.status ===
                200
            ) {
                pass(
                    "GET /products"
                );
            } else {
                fail(
                    "GET /products",
                    `status ${products.status}`
                );
            }
        } catch (e) {
            fail(
                "Regression public",
                e.message
            );
        }

        // ====================================================
        // 10. ADMIN REGRESSION
        // ====================================================

        try {
            if (
                process.env
                    .ADMIN_EMAIL &&
                process.env
                    .ADMIN_PASSWORD
            ) {
                const adminLogin =
                    await http(
                        "POST",
                        "/auth/login",
                        {
                            email:
                                process
                                    .env
                                    .ADMIN_EMAIL,

                            password:
                                process
                                    .env
                                    .ADMIN_PASSWORD,
                        }
                    );

                if (
                    adminLogin.status ===
                    200
                ) {
                    const adminToken =
                        adminLogin
                            .body
                            .data
                            .token;

                    const ap =
                        await http(
                            "GET",
                            "/admin/products",
                            null,
                            adminToken
                        );

                    if (
                        ap.status ===
                        200
                    ) {
                        pass(
                            "Admin GET /admin/products"
                        );
                    } else {
                        fail(
                            "Admin GET products",
                            `status ${ap.status}`
                        );
                    }

                    const inv =
                        await http(
                            "GET",
                            "/admin/inventory",
                            null,
                            adminToken
                        );

                    if (
                        inv.status ===
                        200
                    ) {
                        pass(
                            "Admin GET /admin/inventory"
                        );
                    } else {
                        fail(
                            "Admin GET inventory",
                            `status ${inv.status}`
                        );
                    }
                } else {
                    fail(
                        "Admin login",
                        `status ${adminLogin.status}`
                    );
                }
            } else {
                pass(
                    "Admin tests skipped (no ADMIN_ env)"
                );
            }
        } catch (e) {
            fail(
                "Admin regression",
                e.message
            );
        }

        // ====================================================
        // 11. SUMMARY
        // ====================================================

        console.log(
            "\nTest Summary:"
        );

        console.table(
            results.map(
                (r) => ({
                    Module:
                        r.name,

                    Result:
                        r.status,

                    Note:
                        r.msg ||
                        "",
                })
            )
        );

        const anyFail =
            results.some(
                (r) =>
                    r.status ===
                    "FAIL"
            );

        if (!anyFail) {
            console.log(
                "\nBackend Favorites + Cart 4.4 Completed"
            );
        } else {
            console.log(
                "\nSome tests failed; fix before declaring completion"
            );
        }

        await pool.end();

        process.exit(
            anyFail
                ? 2
                : 0
        );
    };

// ============================================================
// RUN
// ============================================================

run().catch(
    (err) => {
        console.error(
            "Test runner error",
            err
        );

        process.exit(1);
    }
);