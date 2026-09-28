require("dotenv").config();

const BASE_URL =
    process.env.TEST_API_URL ||
    "http://localhost:5000/api";

// ============================================================
// TEST RESULT
// ============================================================

const results = [];

function addResult(
    module,
    test,
    expected,
    actual,
    result,
    status = "-"
) {
    results.push({
        module,
        test,
        expected,
        actual,
        status,
        result,
    });

    const icon =
        result === "PASS"
            ? "✅"
            : result === "SKIP"
            ? "⚠️"
            : "❌";

    console.log(
        `${icon} [${module}] ${test}`
    );

    console.log(
        `   Expected: ${expected}`
    );

    console.log(
        `   Actual:   ${actual}`
    );

    console.log(
        `   HTTP:     ${status}`
    );

    console.log("");
}

// ============================================================
// API HELPER
// ============================================================

async function apiRequest(
    path,
    {
        method = "GET",
        token = null,
        body = undefined,
        headers = {},
    } = {}
) {
    const options = {
        method,

        headers: {
            Accept:
                "application/json",

            ...headers,
        },
    };

    if (token) {
        options.headers.Authorization =
            `Bearer ${token}`;
    }

    if (body !== undefined) {
        options.headers[
            "Content-Type"
        ] = "application/json";

        options.body =
            JSON.stringify(body);
    }

    try {
        const response =
            await fetch(
                `${BASE_URL}${path}`,
                options
            );

        const raw =
            await response.text();

        let data = null;

        if (raw) {
            try {
                data =
                    JSON.parse(raw);
            } catch {
                data = raw;
            }
        }

        return {
            ok:
                response.ok,

            status:
                response.status,

            data,
        };
    } catch (error) {
        return {
            ok: false,

            status: 0,

            data: null,

            networkError: {
                message:
                    error.message,

                cause:
                    error.cause,
            },
        };
    }
}

// ============================================================
// TOKEN EXTRACTOR
// ============================================================

function getToken(response) {
    const data =
        response?.data;

    if (!data) {
        return null;
    }

    return (
        data.token ||
        data.accessToken ||
        data.jwt ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.jwt ||
        null
    );
}

// ============================================================
// DATA EXTRACTOR
// ============================================================

function getData(response) {
    if (
        response?.data?.data !==
        undefined
    ) {
        return response.data.data;
    }

    return response?.data;
}

// ============================================================
// RANDOM TEST USER
// ============================================================

function createTestUserData() {
    const unique =
        `${Date.now()}${Math.floor(
            Math.random() * 10000
        )}`;

    return {
        fullName:
            "Backend 4.7 Test User",

        email:
            `backend47_${unique}@test.local`,

        password:
            "Test@123456",

        confirmPassword:
            "Test@123456",

        phone:
            `09${String(unique)
                .slice(-8)
                .padStart(
                    8,
                    "0"
                )}`,
    };
}

// ============================================================
// LOGIN ADMIN
// ============================================================

async function loginAdmin() {
    const email =
        process.env.ADMIN_EMAIL;

    const password =
        process.env.ADMIN_PASSWORD;

    if (
        !email ||
        !password
    ) {
        console.error(`
❌ Không tìm thấy ADMIN_EMAIL hoặc ADMIN_PASSWORD trong .env.

Hãy thêm:

ADMIN_EMAIL=admin@sneakershop.com
ADMIN_PASSWORD=your_admin_password

Sau đó chạy lại test.
`);

        return null;
    }

    const response =
        await apiRequest(
            "/auth/login",
            {
                method: "POST",

                body: {
                    email,
                    password,
                },
            }
        );

    const token =
        getToken(response);

    addResult(
        "AUTH",
        "Admin login",
        "HTTP 200 + JWT",
        token
            ? "Login success + token"
            : JSON.stringify(
                  response.data
              ),
        response.ok &&
            token
            ? "PASS"
            : "FAIL",
        response.status
    );

    if (!token) {
        return null;
    }

    return {
        token,
        email,
    };
}

// ============================================================
// REGISTER CUSTOMER
// ============================================================

async function createCustomer() {
    const user =
        createTestUserData();

    const register =
        await apiRequest(
            "/auth/register",
            {
                method: "POST",
                body: user,
            }
        );

    addResult(
        "AUTH",
        "Register test customer",
        "HTTP 200/201",
        register.ok
            ? "Customer created"
            : JSON.stringify(
                  register.data
              ),
        register.ok
            ? "PASS"
            : "FAIL",
        register.status
    );

    if (!register.ok) {
        return null;
    }

    const login =
        await apiRequest(
            "/auth/login",
            {
                method: "POST",

                body: {
                    email:
                        user.email,

                    password:
                        user.password,
                },
            }
        );

    const token =
        getToken(login);

    addResult(
        "AUTH",
        "Customer login",
        "HTTP 200 + JWT",
        token
            ? "Login success + token"
            : JSON.stringify(
                  login.data
              ),
        login.ok &&
            token
            ? "PASS"
            : "FAIL",
        login.status
    );

    if (!token) {
        return null;
    }

    const me =
        await apiRequest(
            "/auth/me",
            {
                token,
            }
        );

    const meData =
        getData(me);

    const id =
        meData?.id ||
        meData?.user?.id ||
        meData?.userId ||
        null;

    if (!id) {
        console.log(
            "⚠️ Không lấy được user ID từ /auth/me."
        );

        console.log(
            JSON.stringify(
                me.data,
                null,
                2
            )
        );

        return null;
    }

    return {
        ...user,
        id,
        token,
    };
}

// ============================================================
// HEALTH
// ============================================================

async function testHealth() {
    const response =
        await apiRequest(
            "/health"
        );

    addResult(
        "CORE",
        "Health check",
        "HTTP 200",
        response.ok
            ? "Backend online"
            : JSON.stringify(
                  response.data
              ),
        response.ok
            ? "PASS"
            : "FAIL",
        response.status
    );

    return response.ok;
}

// ============================================================
// ADMIN SECURITY
// ============================================================

async function testAdminSecurity(
    customerToken
) {
    // ========================================================
    // NO TOKEN
    // ========================================================

    const noToken =
        await apiRequest(
            "/admin/dashboard"
        );

    addResult(
        "SECURITY",
        "Admin dashboard without token",
        "HTTP 401",
        `HTTP ${noToken.status}`,
        noToken.status === 401
            ? "PASS"
            : "FAIL",
        noToken.status
    );

    // ========================================================
    // CUSTOMER TOKEN
    // ========================================================

    const customer =
        await apiRequest(
            "/admin/dashboard",
            {
                token:
                    customerToken,
            }
        );

    addResult(
        "SECURITY",
        "Customer access admin dashboard",
        "HTTP 403",
        `HTTP ${customer.status}`,
        customer.status === 403
            ? "PASS"
            : "FAIL",
        customer.status
    );
}

// ============================================================
// DASHBOARD
// ============================================================

async function testDashboard(
    adminToken
) {
    const response =
        await apiRequest(
            "/admin/dashboard",
            {
                token:
                    adminToken,
            }
        );

    const data =
        getData(response);

    const valid =
        response.ok &&
        data &&
        data.users &&
        data.products &&
        data.orders &&
        data.revenue &&
        data.reviews;

    addResult(
        "DASHBOARD",
        "Dashboard overview",
        "users/products/orders/revenue/reviews",
        valid
            ? "All required sections found"
            : JSON.stringify(
                  response.data
              ),
        valid
            ? "PASS"
            : "FAIL",
        response.status
    );

    if (valid) {
        const hasBadNumber = [
            data.users
                ?.totalCustomers,

            data.products
                ?.totalProducts,

            data.orders
                ?.totalOrders,

            data.revenue
                ?.today,

            data.revenue
                ?.thisMonth,

            data.revenue
                ?.thisYear,
        ].some(
            (value) =>
                value === null ||
                value === undefined ||
                Number.isNaN(
                    Number(value)
                )
        );

        addResult(
            "DASHBOARD",
            "Dashboard numeric values",
            "No null / undefined / NaN",
            hasBadNumber
                ? "Invalid numeric value found"
                : "Numeric values valid",
            !hasBadNumber
                ? "PASS"
                : "FAIL",
            response.status
        );
    }
}

// ============================================================
// USER LIST
// ============================================================

async function testUserList(
    adminToken
) {
    const response =
        await apiRequest(
            "/admin/users?page=1&limit=20&sort=newest",
            {
                token:
                    adminToken,
            }
        );

    const data =
        getData(response);

    const valid =
        response.ok &&
        data &&
        Array.isArray(
            data.items
        ) &&
        data.pagination;

    addResult(
        "USERS",
        "Admin user list",
        "200 + items + pagination",
        valid
            ? `${data.items.length} users`
            : JSON.stringify(
                  response.data
              ),
        valid
            ? "PASS"
            : "FAIL",
        response.status
    );
}

// ============================================================
// USER FILTERS
// ============================================================

async function testUserFilters(
    adminToken,
    testEmail
) {
    const tests = [
        [
            "search",
            `/admin/users?search=${encodeURIComponent(
                testEmail
            )}`,
        ],

        [
            "role",
            "/admin/users?role=customer",
        ],

        [
            "status",
            "/admin/users?status=active",
        ],

        [
            "sort",
            "/admin/users?sort=name_asc",
        ],
    ];

    for (
        const [
            name,
            path,
        ] of tests
    ) {
        const response =
            await apiRequest(
                path,
                {
                    token:
                        adminToken,
                }
            );

        addResult(
            "USERS",
            `User filter: ${name}`,
            "HTTP 200",
            response.ok
                ? "OK"
                : JSON.stringify(
                      response.data
                  ),
            response.ok
                ? "PASS"
                : "FAIL",
            response.status
        );
    }
}

// ============================================================
// USER DETAIL
// ============================================================

async function testUserDetail(
    adminToken,
    userId
) {
    const response =
        await apiRequest(
            `/admin/users/${userId}`,
            {
                token:
                    adminToken,
            }
        );

    const data =
        getData(response);

    const detailPass =
        response.status === 200 &&
        response.ok &&
        data &&
        Number(data.id) ===
            Number(userId);

    addResult(
        "USERS",
        "User detail",
        "HTTP 200 + đúng user",
        detailPass
            ? "User detail loaded"
            : JSON.stringify(
                  response.data
              ),
        detailPass
            ? "PASS"
            : "FAIL",
        response.status
    );

    // Chỉ kiểm tra password khi API detail
    // thực sự hoạt động.
    const passwordExposed =
        detailPass &&
        (
            Object.prototype
                .hasOwnProperty.call(
                    data,
                    "password"
                ) ||

            Object.prototype
                .hasOwnProperty.call(
                    data,
                    "password_hash"
                ) ||

            Object.prototype
                .hasOwnProperty.call(
                    data,
                    "passwordHash"
                )
        );

    addResult(
        "SECURITY",
        "Password not exposed",
        "HTTP 200 và không có password/hash",
        !detailPass
            ? `Không thể kiểm tra vì User Detail trả HTTP ${response.status}`
            : passwordExposed
            ? "Password field exposed!"
            : "Password hidden",
        detailPass &&
            !passwordExposed
            ? "PASS"
            : "FAIL",
        response.status
    );
}

// ============================================================
// ADMIN SELF PROTECTION
// ============================================================

async function testAdminSelfProtection(
    adminToken
) {
    const me =
        await apiRequest(
            "/auth/me",
            {
                token:
                    adminToken,
            }
        );

    const meData =
        getData(me);

    const adminId =
        meData?.id ||
        meData?.user?.id ||
        meData?.userId ||
        null;

    if (!adminId) {
        addResult(
            "ADMIN SAFETY",
            "Admin self-protection",
            "GET /auth/me phải trả admin ID",
            `HTTP ${me.status}`,
            "FAIL",
            me.status
        );

        return;
    }

    // ========================================================
    // ADMIN KHÔNG ĐƯỢC BLOCK CHÍNH MÌNH
    // ========================================================

    const selfBlock =
        await apiRequest(
            `/admin/users/${adminId}/status`,
            {
                method:
                    "PATCH",

                token:
                    adminToken,

                body: {
                    status:
                        "blocked",
                },
            }
        );

    const blockRejectedCorrectly =
        [
            400,
            403,
            409,
            422,
        ].includes(
            selfBlock.status
        );

    addResult(
        "ADMIN SAFETY",
        "Admin cannot block self",
        "HTTP 400/403/409/422",
        `HTTP ${selfBlock.status}`,
        blockRejectedCorrectly
            ? "PASS"
            : "FAIL",
        selfBlock.status
    );

    // ========================================================
    // ADMIN KHÔNG ĐƯỢC TỰ HẠ QUYỀN
    // ========================================================

    const selfRole =
        await apiRequest(
            `/admin/users/${adminId}/role`,
            {
                method:
                    "PATCH",

                token:
                    adminToken,

                body: {
                    role:
                        "customer",
                },
            }
        );

    const roleRejectedCorrectly =
        [
            400,
            403,
            409,
            422,
        ].includes(
            selfRole.status
        );

    addResult(
        "ADMIN SAFETY",
        "Admin cannot demote self",
        "HTTP 400/403/409/422",
        `HTTP ${selfRole.status}`,
        roleRejectedCorrectly
            ? "PASS"
            : "FAIL",
        selfRole.status
    );

    // ========================================================
    // VERIFY ADMIN VẪN CÒN HOẠT ĐỘNG
    // ========================================================

    const verify =
        await apiRequest(
            "/auth/me",
            {
                token:
                    adminToken,
            }
        );

    addResult(
        "ADMIN SAFETY",
        "Admin remains active after protection tests",
        "HTTP 200",
        `HTTP ${verify.status}`,
        verify.status === 200
            ? "PASS"
            : "FAIL",
        verify.status
    );
}

// ============================================================
// BLOCK CUSTOMER
// ============================================================

async function testBlockCustomer({
    adminToken,
    customer,
}) {
    let blocked = false;

    try {
        const response =
            await apiRequest(
                `/admin/users/${customer.id}/status`,
                {
                    method:
                        "PATCH",

                    token:
                        adminToken,

                    body: {
                        status:
                            "blocked",
                    },
                }
            );

        blocked =
            response.ok;

        addResult(
            "USERS",
            "Block customer",
            "HTTP 200",
            response.ok
                ? "Customer blocked"
                : JSON.stringify(
                      response.data
                  ),
            response.ok
                ? "PASS"
                : "FAIL",
            response.status
        );

        if (!response.ok) {
            return;
        }

        // Token cũ phải bị từ chối
        const oldToken =
            await apiRequest(
                "/auth/me",
                {
                    token:
                        customer.token,
                }
            );

const blockedTokenRejected =
    [
        401,
        403,
    ].includes(
        oldToken.status
    );

addResult(
    "SECURITY",
    "Blocked customer old JWT",
    "HTTP 401/403",
    `HTTP ${oldToken.status}`,
    blockedTokenRejected
        ? "PASS"
        : "FAIL",
    oldToken.status
);
    } finally {
        if (blocked) {
            const restore =
                await apiRequest(
                    `/admin/users/${customer.id}/status`,
                    {
                        method:
                            "PATCH",

                        token:
                            adminToken,

                        body: {
                            status:
                                "active",
                        },
                    }
                );

            addResult(
                "CLEANUP",
                "Restore customer status",
                "active",
                restore.ok
                    ? "active"
                    : JSON.stringify(
                          restore.data
                      ),
                restore.ok
                    ? "PASS"
                    : "FAIL",
                restore.status
            );
        }
    }
}

// ============================================================
// ROLE TEST
// ============================================================

async function testRoleChange({
    adminToken,
    customer,
}) {
    let promoted = false;

    try {
        const response =
            await apiRequest(
                `/admin/users/${customer.id}/role`,
                {
                    method:
                        "PATCH",

                    token:
                        adminToken,

                    body: {
                        role:
                            "admin",
                    },
                }
            );

        promoted =
            response.ok;

        addResult(
            "USERS",
            "Promote customer to admin",
            "HTTP 200",
            response.ok
                ? "Role = admin"
                : JSON.stringify(
                      response.data
                  ),
            response.ok
                ? "PASS"
                : "FAIL",
            response.status
        );
    } finally {
        if (promoted) {
            const restore =
                await apiRequest(
                    `/admin/users/${customer.id}/role`,
                    {
                        method:
                            "PATCH",

                        token:
                            adminToken,

                        body: {
                            role:
                                "customer",
                        },
                    }
                );

            addResult(
                "CLEANUP",
                "Restore customer role",
                "customer",
                restore.ok
                    ? "customer"
                    : JSON.stringify(
                          restore.data
                      ),
                restore.ok
                    ? "PASS"
                    : "FAIL",
                restore.status
            );
        }
    }
}

// ============================================================
// STATISTICS
// ============================================================

async function testStatistics(
    adminToken
) {
    const endpoints = [
        {
            name:
                "Revenue",

            path:
                "/admin/statistics/revenue?period=day",
        },

        {
            name:
                "Orders",

            path:
                "/admin/statistics/orders",
        },

        {
            name:
                "Products",

            path:
                "/admin/statistics/products",
        },

        {
            name:
                "Customers",

            path:
                "/admin/statistics/customers",
        },

        {
            name:
                "Customer growth",

            path:
                "/admin/statistics/customers/growth?period=month",
        },

        {
            name:
                "Top products",

            path:
                "/admin/statistics/top-products?limit=10",
        },

        {
            name:
                "Top customers",

            path:
                "/admin/statistics/top-customers?limit=10",
        },

        {
            name:
                "Sales",

            path:
                "/admin/statistics/sales?period=day",
        },

        {
            name:
                "Recent orders",

            path:
                "/admin/orders/recent?limit=10",
        },

        {
            name:
                "Low stock",

            path:
                "/admin/dashboard/low-stock?threshold=5&limit=10",
        },
    ];

    for (
        const item of endpoints
    ) {
        const response =
            await apiRequest(
                item.path,
                {
                    token:
                        adminToken,
                }
            );

        addResult(
            "STATISTICS",
            item.name,
            "HTTP 200",
            response.ok
                ? "Response valid"
                : JSON.stringify(
                      response.data
                  ),
            response.ok
                ? "PASS"
                : "FAIL",
            response.status
        );
    }
}

// ============================================================
// INVALID INPUT
// ============================================================

async function testValidation(
    adminToken
) {
    const tests = [
        {
            name:
                "Invalid user role",

            path:
                "/admin/users?role=superadmin",
        },

        {
            name:
                "Invalid user status",

            path:
                "/admin/users?status=deleted",
        },

        {
            name:
                "Invalid user sort",

            path:
                "/admin/users?sort=DROP_TABLE",
        },

        {
            name:
                "Invalid period",

            path:
                "/admin/statistics/revenue?period=abc",
        },

        {
            name:
                "Invalid limit",

            path:
                "/admin/statistics/top-products?limit=99999",
        },
    ];

    for (
        const item of tests
    ) {
        const response =
            await apiRequest(
                item.path,
                {
                    token:
                        adminToken,
                }
            );

        // Validation error hợp lệ.
        //
        // KHÔNG chấp nhận:
        // 404 = route không tồn tại
        // 500 = backend crash
        const correctlyRejected =
            [
                400,
                422,
            ].includes(
                response.status
            );

        addResult(
            "VALIDATION",
            item.name,
            "HTTP 400/422",
            `HTTP ${response.status}`,
            correctlyRejected
                ? "PASS"
                : "FAIL",
            response.status
        );
    }
}

// ============================================================
// LIGHT REGRESSION 4.1 - 4.6
// ============================================================

async function testRegression({
    customerToken,
    adminToken,
}) {
    const tests = [
        {
            module:
                "4.1 Auth",

            path:
                "/auth/me",

            token:
                customerToken,
        },

        {
            module:
                "4.2 Profile",

            path:
                "/users/profile",

            token:
                customerToken,
        },

        {
            module:
                "4.2 Addresses",

            path:
                "/users/addresses",

            token:
                customerToken,
        },

        {
            module:
                "4.3 Categories",

            path:
                "/categories",
        },

        {
            module:
                "4.3 Brands",

            path:
                "/brands",
        },

        {
            module:
                "4.3 Sizes",

            path:
                "/sizes",
        },

        {
            module:
                "4.3 Colors",

            path:
                "/colors",
        },

        {
            module:
                "4.3 Products",

            path:
                "/products",
        },

        {
            module:
                "4.4 Favorites",

            path:
                "/favorites",

            token:
                customerToken,
        },

        {
            module:
                "4.4 Cart",

            path:
                "/cart",

            token:
                customerToken,
        },

        {
            module:
                "4.5 Orders",

            path:
                "/orders",

            token:
                customerToken,
        },

        {
            module:
                "4.6 Reviews",

            path:
                "/reviews/my",

            token:
                customerToken,
        },

        {
            module:
                "4.6 Admin coupons",

            path:
                "/admin/coupons",

            token:
                adminToken,
        },
    ];

    for (
        const test of tests
    ) {
        const response =
            await apiRequest(
                test.path,
                {
                    token:
                        test.token,
                }
            );

        addResult(
            "REGRESSION",
            test.module,
            "HTTP 2xx",
            `HTTP ${response.status}`,
            response.ok
                ? "PASS"
                : "FAIL",
            response.status
        );
    }
}

// ============================================================
// FINAL REPORT
// ============================================================

function printReport() {
    console.log(`
============================================================
BACKEND 4.7 TEST REPORT
============================================================
`);

    console.table(results);

    const pass =
        results.filter(
            (item) =>
                item.result ===
                "PASS"
        ).length;

    const fail =
        results.filter(
            (item) =>
                item.result ===
                "FAIL"
        ).length;

    const skip =
        results.filter(
            (item) =>
                item.result ===
                "SKIP"
        ).length;

    console.log(
        `PASS: ${pass}`
    );

    console.log(
        `FAIL: ${fail}`
    );

    console.log(
        `SKIP: ${skip}`
    );

    console.log(
        `TOTAL: ${results.length}`
    );

    console.log("");

    if (fail === 0) {
        console.log(`
============================================================
✅ Backend Admin Dashboard + Statistics 4.7 Completed
============================================================
`);
    } else {
        console.log(`
============================================================
❌ Backend 4.7 chưa hoàn thành.
Có ${fail} test FAIL.
Hãy sửa lỗi trước khi chuyển 4.8.
============================================================
`);

        process.exitCode = 1;
    }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
    console.log(`
============================================================
SNEAKER SHOP
BACKEND 4.7 AUTOMATED TEST
============================================================

API:
${BASE_URL}

`);

    // --------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------

    const health =
        await testHealth();

    if (!health) {
        console.error(
            "Backend chưa sẵn sàng."
        );

        printReport();

        return;
    }

    // --------------------------------------------------------
    // ADMIN LOGIN
    // --------------------------------------------------------

    const admin =
        await loginAdmin();

    if (!admin) {
        printReport();

        return;
    }

    // --------------------------------------------------------
    // CREATE CUSTOMER
    // --------------------------------------------------------

    const customer =
        await createCustomer();

    if (!customer) {
        printReport();

        return;
    }

    console.log(
        `Test customer ID: ${customer.id}`
    );

    console.log(
        `Test customer email: ${customer.email}`
    );

    console.log("");

    // --------------------------------------------------------
    // SECURITY
    // --------------------------------------------------------

    await testAdminSecurity(
        customer.token
    );

    // --------------------------------------------------------
    // DASHBOARD
    // --------------------------------------------------------

    await testDashboard(
        admin.token
    );

    // --------------------------------------------------------
    // USERS
    // --------------------------------------------------------

    await testUserList(
        admin.token
    );

    await testUserFilters(
        admin.token,
        customer.email
    );

    await testUserDetail(
        admin.token,
        customer.id
    );

    // --------------------------------------------------------
    // ADMIN SAFETY
    // --------------------------------------------------------

    await testAdminSelfProtection(
        admin.token
    );

    // --------------------------------------------------------
    // BLOCK / UNBLOCK
    // --------------------------------------------------------

    await testBlockCustomer({
        adminToken:
            admin.token,

        customer,
    });

    // --------------------------------------------------------
    // ROLE
    // --------------------------------------------------------

    await testRoleChange({
        adminToken:
            admin.token,

        customer,
    });

    // --------------------------------------------------------
    // STATISTICS
    // --------------------------------------------------------

    await testStatistics(
        admin.token
    );

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    await testValidation(
        admin.token
    );

    // --------------------------------------------------------
    // REGRESSION
    // --------------------------------------------------------

    await testRegression({
        customerToken:
            customer.token,

        adminToken:
            admin.token,
    });

    // --------------------------------------------------------
    // REPORT
    // --------------------------------------------------------

    printReport();
}

// ============================================================
// GLOBAL ERROR
// ============================================================

main().catch(
    (error) => {
        console.error(`
============================================================
UNEXPECTED TEST ERROR
============================================================
`);

        console.error(
            error
        );

        process.exitCode = 1;
    }
);