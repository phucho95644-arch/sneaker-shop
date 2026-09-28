const { pool } = require('../config/db');

// Get user overview
const getUserOverview = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as totalCustomers,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCustomers,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blockedCustomers,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactiveCustomers,
            SUM(CASE WHEN DATE(created_at) = CURDATE() AND role = 'customer' THEN 1 ELSE 0 END) as newCustomersToday,
            SUM(CASE WHEN YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) AND role = 'customer' THEN 1 ELSE 0 END) as newCustomersThisMonth
        FROM users
        WHERE role = 'customer'
    `);
    
    return {
        totalCustomers: rows[0]?.totalCustomers || 0,
        activeCustomers: rows[0]?.activeCustomers || 0,
        blockedCustomers: rows[0]?.blockedCustomers || 0,
        inactiveCustomers: rows[0]?.inactiveCustomers || 0,
        newCustomersToday: rows[0]?.newCustomersToday || 0,
        newCustomersThisMonth: rows[0]?.newCustomersThisMonth || 0
    };
};

// Get product overview
const getProductOverview = async () => {
    const [rows] = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM products) as totalProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'active') as activeProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'inactive') as inactiveProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'draft') as draftProducts,
            (SELECT COUNT(*) FROM product_variants) as totalVariants,
            (SELECT COUNT(*) FROM product_variants WHERE stock_quantity BETWEEN 1 AND 5) as lowStockVariants,
            (SELECT COUNT(*) FROM product_variants WHERE stock_quantity = 0) as outOfStockVariants,
            (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants) as totalStock
    `);
    
    return {
        totalProducts: rows[0]?.totalProducts || 0,
        activeProducts: rows[0]?.activeProducts || 0,
        inactiveProducts: rows[0]?.inactiveProducts || 0,
        draftProducts: rows[0]?.draftProducts || 0,
        totalVariants: rows[0]?.totalVariants || 0,
        lowStockVariants: rows[0]?.lowStockVariants || 0,
        outOfStockVariants: rows[0]?.outOfStockVariants || 0,
        totalStock: rows[0]?.totalStock || 0
    };
};

// Get order overview
const getOrderOverview = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as totalOrders,
            SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN order_status = 'shipping' THEN 1 ELSE 0 END) as shipping,
            SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders
    `);
    
    return {
        totalOrders: rows[0]?.totalOrders || 0,
        pending: rows[0]?.pending || 0,
        confirmed: rows[0]?.confirmed || 0,
        processing: rows[0]?.processing || 0,
        shipping: rows[0]?.shipping || 0,
        delivered: rows[0]?.delivered || 0,
        cancelled: rows[0]?.cancelled || 0
    };
};

// Get revenue overview (today, this month, this year)
const getRevenueOverview = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() AND order_status = 'delivered' AND payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as today,
            COALESCE(SUM(CASE WHEN YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) AND order_status = 'delivered' AND payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as thisMonth,
            COALESCE(SUM(CASE WHEN YEAR(created_at) = YEAR(NOW()) AND order_status = 'delivered' AND payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as thisYear
        FROM orders
    `);
    
    return {
        today: rows[0]?.today || 0,
        thisMonth: rows[0]?.thisMonth || 0,
        thisYear: rows[0]?.thisYear || 0
    };
};

// Get review overview
const getReviewOverview = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) as hidden
        FROM reviews
    `);
    
    return {
        total: rows[0]?.total || 0,
        pending: rows[0]?.pending || 0,
        approved: rows[0]?.approved || 0,
        hidden: rows[0]?.hidden || 0
    };
};

// Get revenue statistics by period
const getRevenueStatistics = async (period = 'month', fromDate = null, toDate = null) => {
    let dateFormat = '%Y-%m';
    let groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    let orderBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    
    if (period === 'day') {
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
        orderBy = 'DATE(created_at)';
    } else if (period === 'week') {
        groupBy = 'DATE_FORMAT(created_at, "%Y-W%u")';
        orderBy = 'DATE_FORMAT(created_at, "%Y-W%u")';
    } else if (period === 'year') {
        dateFormat = '%Y';
        groupBy = 'YEAR(created_at)';
        orderBy = 'YEAR(created_at)';
    }

    let whereClause = 'WHERE order_status = "delivered" AND payment_status = "paid"';
    let params = [];

    if (fromDate && toDate) {
        whereClause += ' AND DATE(created_at) >= ? AND DATE(created_at) <= ?';
        params.push(fromDate, toDate);
    }

    const [rows] = await pool.query(`
        SELECT 
            ${groupBy} as label,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
        FROM orders
        ${whereClause}
        GROUP BY ${groupBy}
        ORDER BY ${orderBy} ASC
    `, params);
    
    return rows.map(row => ({
        label: row.label,
        revenue: parseFloat(row.revenue),
        orders: row.orders
    }));
};

// Get order statistics
const getOrderStatistics = async (fromDate = null, toDate = null) => {
    let whereClause = '';
    let params = [];

    if (fromDate && toDate) {
        whereClause = 'WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?';
        params = [fromDate, toDate];
    }

    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN order_status = 'shipping' THEN 1 ELSE 0 END) as shipping,
            SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders
        ${whereClause}
    `, params);

    const total = rows[0]?.total || 0;
    const delivered = rows[0]?.delivered || 0;
    const cancelled = rows[0]?.cancelled || 0;

    return {
        total,
        byStatus: {
            pending: rows[0]?.pending || 0,
            confirmed: rows[0]?.confirmed || 0,
            processing: rows[0]?.processing || 0,
            shipping: rows[0]?.shipping || 0,
            delivered,
            cancelled
        },
        completionRate: total > 0 ? parseFloat(((delivered / total) * 100).toFixed(1)) : 0,
        cancellationRate: total > 0 ? parseFloat(((cancelled / total) * 100).toFixed(1)) : 0
    };
};

// Get product statistics
const getProductStatistics = async () => {
    const [rows] = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM products) as totalProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'active') as activeProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'inactive') as inactiveProducts,
            (SELECT COUNT(*) FROM products WHERE status = 'draft') as draftProducts,
            (SELECT COUNT(*) FROM product_variants) as totalVariants,
            (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants) as totalStock,
            (SELECT COUNT(*) FROM product_variants WHERE stock_quantity BETWEEN 1 AND 5) as lowStockVariants,
            (SELECT COUNT(*) FROM product_variants WHERE stock_quantity = 0) as outOfStockVariants
    `);
    
    return {
        totalProducts: rows[0]?.totalProducts || 0,
        activeProducts: rows[0]?.activeProducts || 0,
        inactiveProducts: rows[0]?.inactiveProducts || 0,
        draftProducts: rows[0]?.draftProducts || 0,
        totalVariants: rows[0]?.totalVariants || 0,
        totalStock: rows[0]?.totalStock || 0,
        lowStockVariants: rows[0]?.lowStockVariants || 0,
        outOfStockVariants: rows[0]?.outOfStockVariants || 0
    };
};

// Get top selling products
const getTopProducts = async (limit = 10, fromDate = null, toDate = null) => {
    let whereClause = 'WHERE o.order_status = "delivered"';
    let params = [limit];

    if (fromDate && toDate) {
        whereClause += ' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?';
        params.push(fromDate, toDate);
    }

    const [rows] = await pool.query(`
        SELECT 
            oi.product_id as productId,
            p.name,
            p.thumbnail,
            SUM(oi.quantity) as quantitySold,
            COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        ${whereClause}
        GROUP BY oi.product_id, p.name, p.thumbnail
        ORDER BY quantitySold DESC
        LIMIT ?
    `, params);
    
    return rows.map(row => ({
        productId: row.productId,
        name: row.name,
        thumbnail: row.thumbnail,
        quantitySold: row.quantitySold,
        revenue: parseFloat(row.revenue)
    }));
};

// Get top customers by spending
const getTopCustomers = async (limit = 10) => {
    const [rows] = await pool.query(`
        SELECT 
            u.id as userId,
            u.full_name as fullName,
            u.email,
            u.avatar,
            COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as deliveredOrders,
            COUNT(DISTINCT o.id) as totalOrders,
            COALESCE(SUM(CASE WHEN o.order_status = 'delivered' AND o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as totalSpent
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'customer'
        GROUP BY u.id, u.full_name, u.email, u.avatar
        ORDER BY totalSpent DESC
        LIMIT ?
    `, [limit]);
    
    return rows.map(row => ({
        userId: row.userId,
        fullName: row.fullName,
        email: row.email,
        avatar: row.avatar,
        totalOrders: row.totalOrders,
        deliveredOrders: row.deliveredOrders,
        totalSpent: parseFloat(row.totalSpent)
    }));
};

// Get recent orders
const getRecentOrders = async (limit = 10) => {
    const [rows] = await pool.query(`
        SELECT 
            o.id,
            o.order_code as orderCode,
            u.full_name as customerName,
            u.email,
            o.total_amount as totalAmount,
            o.payment_status as paymentStatus,
            o.order_status as orderStatus,
            o.created_at as createdAt
        FROM orders o
        JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT ?
    `, [limit]);
    
    return rows.map(row => ({
        id: row.id,
        orderCode: row.orderCode,
        customerName: row.customerName,
        email: row.email,
        totalAmount: parseFloat(row.totalAmount),
        paymentStatus: row.paymentStatus,
        orderStatus: row.orderStatus,
        createdAt: row.createdAt
    }));
};

// Get customer statistics
const getCustomerStatistics = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday,
            SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as newThisWeek,
            SUM(CASE WHEN YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) THEN 1 ELSE 0 END) as newThisMonth
        FROM users
        WHERE role = 'customer'
    `);
    
    return {
        total: rows[0]?.total || 0,
        active: rows[0]?.active || 0,
        inactive: rows[0]?.inactive || 0,
        blocked: rows[0]?.blocked || 0,
        newToday: rows[0]?.newToday || 0,
        newThisWeek: rows[0]?.newThisWeek || 0,
        newThisMonth: rows[0]?.newThisMonth || 0
    };
};

// Get customer growth by period
const getCustomerGrowth = async (period = 'month') => {
    let dateFormat = '%Y-%m';
    let groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    let orderBy = 'DATE_FORMAT(created_at, "%Y-%m")';

    if (period === 'day') {
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
        orderBy = 'DATE(created_at)';
    } else if (period === 'week') {
        groupBy = 'DATE_FORMAT(created_at, "%Y-W%u")';
        orderBy = 'DATE_FORMAT(created_at, "%Y-W%u")';
    } else if (period === 'year') {
        dateFormat = '%Y';
        groupBy = 'YEAR(created_at)';
        orderBy = 'YEAR(created_at)';
    }

    const [rows] = await pool.query(`
        SELECT 
            ${groupBy} as label,
            COUNT(*) as newCustomers
        FROM users
        WHERE role = 'customer'
        GROUP BY ${groupBy}
        ORDER BY ${orderBy} ASC
    `);
    
    return rows.map(row => ({
        label: row.label,
        newCustomers: row.newCustomers
    }));
};

// Get low stock variants
const getLowStockVariants = async (limit = 10, threshold = 5) => {
    const [rows] = await pool.query(`
        SELECT 
            pv.id as variantId,
            p.id as productId,
            p.name as productName,
            p.thumbnail,
            pv.sku,
            ps.size_name as size,
            pc.color_name as color,
            pv.stock_quantity as stock
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN product_sizes ps ON ps.id = pv.size_id
        LEFT JOIN product_colors pc ON pc.id = pv.color_id
        WHERE pv.stock_quantity > 0 AND pv.stock_quantity <= ?
        ORDER BY pv.stock_quantity ASC
        LIMIT ?
    `, [threshold, limit]);
    
    return rows.map(row => ({
        variantId: row.variantId,
        productId: row.productId,
        productName: row.productName,
        thumbnail: row.thumbnail,
        sku: row.sku,
        size: row.size,
        color: row.color,
        stock: row.stock
    }));
};

// Get out of stock variants
const getOutOfStockVariants = async (limit = 10) => {
    const [rows] = await pool.query(`
        SELECT 
            pv.id as variantId,
            p.id as productId,
            p.name as productName,
            p.thumbnail,
            pv.sku,
            ps.size_name as size,
            pc.color_name as color,
            pv.stock_quantity as stock
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN product_sizes ps ON ps.id = pv.size_id
        LEFT JOIN product_colors pc ON pc.id = pv.color_id
        WHERE pv.stock_quantity = 0
        ORDER BY pv.created_at DESC
        LIMIT ?
    `, [limit]);
    
    return rows.map(row => ({
        variantId: row.variantId,
        productId: row.productId,
        productName: row.productName,
        thumbnail: row.thumbnail,
        sku: row.sku,
        size: row.size,
        color: row.color,
        stock: 0
    }));
};

module.exports = {
    getUserOverview,
    getProductOverview,
    getOrderOverview,
    getRevenueOverview,
    getReviewOverview,
    getRevenueStatistics,
    getOrderStatistics,
    getProductStatistics,
    getTopProducts,
    getTopCustomers,
    getRecentOrders,
    getCustomerStatistics,
    getCustomerGrowth,
    getLowStockVariants,
    getOutOfStockVariants
};
