import axiosClient from "../api/axiosClient";

// ============================================================
// PUBLIC - PRODUCT REVIEWS
// GET /api/reviews/product/:productId
// ============================================================

const getProductReviews =
    async (
        productId,
        params = {}
    ) => {
        const response =
            await axiosClient.get(
                `/reviews/product/${productId}`,
                {
                    params,
                }
            );

        return response.data;
    };

// ============================================================
// CUSTOMER - MY REVIEWS
// GET /api/reviews/my
// ============================================================

const getMyReviews =
    async (
        params = {}
    ) => {
        const response =
            await axiosClient.get(
                "/reviews/my",
                {
                    params,
                }
            );

        return response.data;
    };

// ============================================================
// CUSTOMER - CREATE REVIEW
// POST /api/reviews
// ============================================================

const createReview =
    async (
        payload
    ) => {
        const response =
            await axiosClient.post(
                "/reviews",
                payload
            );

        return response.data;
    };

// ============================================================
// CUSTOMER - UPDATE REVIEW
// PUT /api/reviews/:id
// ============================================================

const updateReview =
    async (
        id,
        payload
    ) => {
        const response =
            await axiosClient.put(
                `/reviews/${id}`,
                payload
            );

        return response.data;
    };

// ============================================================
// CUSTOMER - DELETE REVIEW
// DELETE /api/reviews/:id
// ============================================================

const deleteReview =
    async (
        id
    ) => {
        const response =
            await axiosClient.delete(
                `/reviews/${id}`
            );

        return response.data;
    };

// ============================================================
// ADMIN - GET ALL REVIEWS
// GET /api/reviews/admin/all
// ============================================================

const adminGetReviews =
    async (
        params = {}
    ) => {
        const response =
            await axiosClient.get(
                "/reviews/admin/all",
                {
                    params,
                }
            );

        return response.data;
    };

// ============================================================
// ADMIN - GET REVIEW DETAIL
// GET /api/reviews/admin/:id
// ============================================================

const adminGetReview =
    async (
        id
    ) => {
        const response =
            await axiosClient.get(
                `/reviews/admin/${id}`
            );

        return response.data;
    };

// ============================================================
// ADMIN - UPDATE REVIEW STATUS
// PATCH /api/reviews/admin/:id/status
//
// status:
// pending
// approved
// hidden
// ============================================================

const adminUpdateStatus =
    async (
        id,
        status
    ) => {
        const response =
            await axiosClient.patch(
                `/reviews/admin/${id}/status`,
                {
                    status,
                }
            );

        return response.data;
    };

// ============================================================
// ADMIN - DELETE REVIEW
// DELETE /api/reviews/admin/:id
// ============================================================

const adminDeleteReview =
    async (
        id
    ) => {
        const response =
            await axiosClient.delete(
                `/reviews/admin/${id}`
            );

        return response.data;
    };

// ============================================================
// EXPORT
// ============================================================

const reviewService = {
    getProductReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview,

    adminGetReviews,
    adminGetReview,
    adminUpdateStatus,
    adminDeleteReview,
};

export default reviewService;