import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    FaCheckCircle,
    FaEdit,
    FaRegStar,
    FaStar,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import reviewService from "../../services/reviewService";

import {
    useAuth,
} from "../../contexts/AuthContext";

import "./ProductReviews.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// DATE
// ============================================================

const formatDate = (
    value
) => {
    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

// ============================================================
// AVATAR
// ============================================================

const makeAvatarUrl = (
    value
) => {
    if (!value) {
        return null;
    }

    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        )
    ) {
        return value;
    }

    return `${SERVER_URL}/${String(
        value
    ).replace(
        /^\/+/,
        ""
    )}`;
};

// ============================================================
// INITIAL
// ============================================================

const getInitials = (
    name
) => {
    const value =
        String(
            name || "U"
        ).trim();

    const parts =
        value
            .split(/\s+/)
            .filter(Boolean);

    if (
        parts.length ===
        0
    ) {
        return "U";
    }

    if (
        parts.length ===
        1
    ) {
        return parts[0]
            .slice(0, 1)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();
};

// ============================================================
// REVIEW STATUS
// ============================================================

const getReviewStatus = (
    status
) => {
    const map = {
        pending: {
            text:
                "Đang chờ duyệt",

            className:
                "pending",
        },

        approved: {
            text:
                "Đã duyệt",

            className:
                "approved",
        },

        hidden: {
            text:
                "Đã ẩn",

            className:
                "hidden",
        },
    };

    return (
        map[status] || {
            text:
                status ||
                "Không xác định",

            className:
                "unknown",
        }
    );
};

// ============================================================
// STAR DISPLAY
// ============================================================

function Stars({
    value = 0,
    size = "normal",
}) {
    const rating =
        Number(
            value || 0
        );

    return (
        <span
            className={`product-review-stars ${size}`}
        >
            {[1, 2, 3, 4, 5].map(
                (
                    star
                ) =>
                    star <=
                    Math.round(
                        rating
                    ) ? (
                        <FaStar
                            key={
                                star
                            }
                        />
                    ) : (
                        <FaRegStar
                            key={
                                star
                            }
                        />
                    )
            )}
        </span>
    );
}

// ============================================================
// PRODUCT REVIEWS
// ============================================================

function ProductReviews({
    productId,
}) {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        isAuthenticated,
    } = useAuth();

    // ========================================================
    // PUBLIC REVIEWS
    // ========================================================

    const [
        reviews,
        setReviews,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        summary,
        setSummary,
    ] = useState({
        averageRating: 0,

        totalReviews: 0,

        distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        },
    });

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,

        limit: 6,

        totalItems: 0,

        totalPages: 1,
    });

    const [
        ratingFilter,
        setRatingFilter,
    ] = useState("");

    const [
        sort,
        setSort,
    ] = useState(
        "newest"
    );

    // ========================================================
    // MY REVIEW
    // ========================================================

    const [
        myReview,
        setMyReview,
    ] = useState(null);

    const [
        myReviewLoading,
        setMyReviewLoading,
    ] = useState(false);

    const [
        editing,
        setEditing,
    ] = useState(false);

    // ========================================================
    // FORM
    // ========================================================

    const [
        orderId,
        setOrderId,
    ] = useState("");

    const [
        rating,
        setRating,
    ] = useState(5);

    const [
        hoverRating,
        setHoverRating,
    ] = useState(0);

    const [
        comment,
        setComment,
    ] = useState("");

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    // ========================================================
    // LOAD REVIEWS
    // ========================================================

    const loadReviews =
        useCallback(
            async (
                page = 1
            ) => {
                if (
                    !productId
                ) {
                    return;
                }

                try {
                    setLoading(
                        true
                    );

                    const params = {
                        page,

                        limit:
                            6,

                        sort,
                    };

                    if (
                        ratingFilter
                    ) {
                        params.rating =
                            Number(
                                ratingFilter
                            );
                    }

                    const response =
                        await reviewService.getProductReviews(
                            productId,
                            params
                        );

                    const data =
                        response?.data ||
                        {};

                    setReviews(
                        Array.isArray(
                            data.items
                        )
                            ? data.items
                            : []
                    );

                    setSummary({
                        averageRating:
                            Number(
                                data.summary
                                    ?.averageRating ||
                                    0
                            ),

                        totalReviews:
                            Number(
                                data.summary
                                    ?.totalReviews ||
                                    0
                            ),

                        distribution: {
                            5:
                                Number(
                                    data.summary
                                        ?.distribution?.[
                                        5
                                    ] ||
                                        0
                                ),

                            4:
                                Number(
                                    data.summary
                                        ?.distribution?.[
                                        4
                                    ] ||
                                        0
                                ),

                            3:
                                Number(
                                    data.summary
                                        ?.distribution?.[
                                        3
                                    ] ||
                                        0
                                ),

                            2:
                                Number(
                                    data.summary
                                        ?.distribution?.[
                                        2
                                    ] ||
                                        0
                                ),

                            1:
                                Number(
                                    data.summary
                                        ?.distribution?.[
                                        1
                                    ] ||
                                        0
                                ),
                        },
                    });

                    setPagination({
                        page:
                            Number(
                                data.pagination
                                    ?.page ||
                                    page
                            ),

                        limit:
                            Number(
                                data.pagination
                                    ?.limit ||
                                    6
                            ),

                        totalItems:
                            Number(
                                data.pagination
                                    ?.totalItems ||
                                    0
                            ),

                        totalPages:
                            Math.max(
                                1,

                                Number(
                                    data.pagination
                                        ?.totalPages ||
                                        1
                                )
                            ),
                    });
                } catch (error) {
                    console.error(
                        "LOAD PRODUCT REVIEWS ERROR:",
                        error
                    );

                    toast.error(
                        error.response
                            ?.data
                            ?.message ||
                            "Không thể tải đánh giá sản phẩm."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                productId,
                ratingFilter,
                sort,
            ]
        );

    // ========================================================
    // LOAD MY REVIEW
    // ========================================================

    const loadMyReview =
        useCallback(
            async () => {
                if (
                    !isAuthenticated ||
                    !productId
                ) {
                    setMyReview(
                        null
                    );

                    setEditing(
                        false
                    );

                    return;
                }

                try {
                    setMyReviewLoading(
                        true
                    );

                    const response =
                        await reviewService.getMyReviews(
                            {
                                page: 1,

                                limit:
                                    100,
                            }
                        );

                    const items =
                        response?.data
                            ?.items;

                    const found =
                        Array.isArray(
                            items
                        )
                            ? items.find(
                                  (
                                      item
                                  ) =>
                                      Number(
                                          item.product_id ??
                                              item.productId
                                      ) ===
                                      Number(
                                          productId
                                      )
                              )
                            : null;

                    setMyReview(
                        found || null
                    );

                    if (
                        found
                    ) {
                        setRating(
                            Number(
                                found.rating ||
                                    5
                            )
                        );

                        setComment(
                            found.comment ||
                                ""
                        );

                        setOrderId(
                            String(
                                found.order_id ??
                                    found.orderId ??
                                    ""
                            )
                        );
                    } else {
                        setRating(
                            5
                        );

                        setComment(
                            ""
                        );

                        setOrderId(
                            ""
                        );
                    }
                } catch (error) {
                    console.error(
                        "LOAD MY REVIEW ERROR:",
                        error
                    );
                } finally {
                    setMyReviewLoading(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                productId,
            ]
        );

    // ========================================================
    // EFFECT
    // ========================================================

    useEffect(() => {
        loadReviews(
            1
        );
    }, [
        loadReviews,
    ]);

    useEffect(() => {
        loadMyReview();
    }, [
        loadMyReview,
    ]);

    // ========================================================
    // CREATE REVIEW
    // ========================================================

    const handleCreate = async (
        event
    ) => {
        event.preventDefault();

        if (
            !isAuthenticated
        ) {
            navigate(
                "/login",
                {
                    state: {
                        from:
                            location,
                    },
                }
            );

            return;
        }

        const numericOrderId =
            Number(
                orderId
            );

        if (
            !Number.isInteger(
                numericOrderId
            ) ||
            numericOrderId <=
                0
        ) {
            toast.warning(
                "Vui lòng nhập ID đơn hàng hợp lệ."
            );

            return;
        }

        if (
            rating < 1 ||
            rating > 5
        ) {
            toast.warning(
                "Vui lòng chọn từ 1 đến 5 sao."
            );

            return;
        }

        const cleanComment =
            comment.trim();

        if (
            cleanComment.length <
            1
        ) {
            toast.warning(
                "Vui lòng nhập nội dung đánh giá."
            );

            return;
        }

        if (
            cleanComment.length >
            2000
        ) {
            toast.warning(
                "Đánh giá không được vượt quá 2000 ký tự."
            );

            return;
        }

        try {
            setSubmitting(
                true
            );

            const response =
                await reviewService.createReview(
                    {
                        productId:
                            Number(
                                productId
                            ),

                        orderId:
                            numericOrderId,

                        rating:
                            Number(
                                rating
                            ),

                        comment:
                            cleanComment,
                    }
                );

            toast.success(
                response?.message ||
                    "Đã gửi đánh giá. Đánh giá đang chờ duyệt."
            );

            await loadMyReview();

            await loadReviews(
                1
            );
        } catch (error) {
            console.error(
                "CREATE REVIEW ERROR:",
                error
            );

            const message =
                error.response
                    ?.data
                    ?.message;

            if (
                message ===
                "You can only review products you have purchased and received"
            ) {
                toast.error(
                    "Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn hàng đã giao thành công."
                );

                return;
            }

            if (
                message ===
                "You have already reviewed this product"
            ) {
                toast.error(
                    "Bạn đã đánh giá sản phẩm này."
                );

                return;
            }

            toast.error(
                message ||
                    "Không thể gửi đánh giá."
            );
        } finally {
            setSubmitting(
                false
            );
        }
    };

    // ========================================================
    // UPDATE REVIEW
    // ========================================================

    const handleUpdate = async (
        event
    ) => {
        event.preventDefault();

        if (
            !myReview?.id
        ) {
            return;
        }

        const cleanComment =
            comment.trim();

        if (
            cleanComment.length <
                1 ||
            cleanComment.length >
                2000
        ) {
            toast.warning(
                "Nội dung đánh giá phải từ 1 đến 2000 ký tự."
            );

            return;
        }

        try {
            setSubmitting(
                true
            );

            const response =
                await reviewService.updateReview(
                    myReview.id,
                    {
                        rating:
                            Number(
                                rating
                            ),

                        comment:
                            cleanComment,
                    }
                );

            toast.success(
                response?.message ||
                    "Đã cập nhật đánh giá."
            );

            setEditing(
                false
            );

            await loadMyReview();

            await loadReviews(
                1
            );
        } catch (error) {
            console.error(
                "UPDATE REVIEW ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                    "Không thể cập nhật đánh giá."
            );
        } finally {
            setSubmitting(
                false
            );
        }
    };

    // ========================================================
    // DELETE REVIEW
    // ========================================================

    const handleDelete = async () => {
        if (
            !myReview?.id
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Bạn có chắc muốn xóa đánh giá này?"
            );

        if (
            !confirmed
        ) {
            return;
        }

        try {
            setSubmitting(
                true
            );

            const response =
                await reviewService.deleteReview(
                    myReview.id
                );

            toast.success(
                response?.message ||
                    "Đã xóa đánh giá."
            );

            setMyReview(
                null
            );

            setEditing(
                false
            );

            setRating(
                5
            );

            setComment(
                ""
            );

            setOrderId(
                ""
            );

            await loadReviews(
                1
            );
        } catch (error) {
            console.error(
                "DELETE REVIEW ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                    "Không thể xóa đánh giá."
            );
        } finally {
            setSubmitting(
                false
            );
        }
    };

    // ========================================================
    // STAR
    // ========================================================

    const activeStar =
        hoverRating ||
        rating;

    // ========================================================
    // UI
    // ========================================================

    return (
        <section className="product-reviews-section">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="product-reviews-heading">
                <div>
                    <span>
                        ĐÁNH GIÁ SẢN PHẨM
                    </span>

                    <h2>
                        Khách hàng nói gì?
                    </h2>
                </div>

                <div className="product-review-heading-score">
                    <strong>
                        {
                            summary.averageRating
                        }
                    </strong>

                    <div>
                        <Stars
                            value={
                                summary.averageRating
                            }
                            size="large"
                        />

                        <span>
                            {
                                summary.totalReviews
                            }{" "}
                            đánh giá
                        </span>
                    </div>
                </div>
            </div>

            <div className="product-reviews-layout">
                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="product-reviews-main">
                    <div className="product-review-toolbar">
                        <select
                            value={
                                ratingFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setRatingFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="">
                                Tất cả số sao
                            </option>

                            <option value="5">
                                5 sao
                            </option>

                            <option value="4">
                                4 sao
                            </option>

                            <option value="3">
                                3 sao
                            </option>

                            <option value="2">
                                2 sao
                            </option>

                            <option value="1">
                                1 sao
                            </option>
                        </select>

                        <select
                            value={
                                sort
                            }
                            onChange={(
                                event
                            ) =>
                                setSort(
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="newest">
                                Mới nhất
                            </option>

                            <option value="oldest">
                                Cũ nhất
                            </option>

                            <option value="rating_high">
                                Sao cao nhất
                            </option>

                            <option value="rating_low">
                                Sao thấp nhất
                            </option>
                        </select>
                    </div>

                    {/* ==============================================
                        LOADING
                    ============================================== */}

                    {loading && (
                        <div className="product-review-loading">
                            <span className="spinner-border spinner-border-sm" />

                            Đang tải đánh giá...
                        </div>
                    )}

                    {/* ==============================================
                        EMPTY
                    ============================================== */}

                    {!loading &&
                        reviews.length ===
                            0 && (
                            <div className="product-review-empty">
                                Chưa có đánh giá đã được duyệt cho sản phẩm này.
                            </div>
                        )}

                    {/* ==============================================
                        REVIEWS
                    ============================================== */}

                    {!loading &&
                        reviews.length >
                            0 && (
                            <div className="product-review-list">
                                {reviews.map(
                                    (
                                        item
                                    ) => {
                                        const avatar =
                                            makeAvatarUrl(
                                                item.avatar
                                            );

                                        const verified =
                                            Boolean(
                                                Number(
                                                    item.verifiedPurchase
                                                )
                                            );

                                        return (
                                            <article
                                                className="product-review-card"
                                                key={
                                                    item.id
                                                }
                                            >
                                                <div className="product-review-user">
                                                    <div className="product-review-avatar">
                                                        {avatar ? (
                                                            <img
                                                                src={
                                                                    avatar
                                                                }
                                                                alt={
                                                                    item.full_name ||
                                                                    "Khách hàng"
                                                                }
                                                            />
                                                        ) : (
                                                            getInitials(
                                                                item.full_name
                                                            )
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {item.full_name ||
                                                                "Khách hàng"}
                                                        </strong>

                                                        <span>
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    {verified && (
                                                        <span className="product-review-verified">
                                                            <FaCheckCircle />

                                                            Đã mua hàng
                                                        </span>
                                                    )}
                                                </div>

                                                <Stars
                                                    value={
                                                        item.rating
                                                    }
                                                />

                                                <p>
                                                    {
                                                        item.comment
                                                    }
                                                </p>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        )}

                    {/* ==============================================
                        PAGINATION
                    ============================================== */}

                    {pagination.totalPages >
                        1 && (
                        <div className="product-review-pagination">
                            <button
                                type="button"
                                disabled={
                                    pagination.page <=
                                    1
                                }
                                onClick={() =>
                                    loadReviews(
                                        pagination.page -
                                            1
                                    )
                                }
                            >
                                Trước
                            </button>

                            <span>
                                Trang{" "}
                                {
                                    pagination.page
                                }{" "}
                                /{" "}
                                {
                                    pagination.totalPages
                                }
                            </span>

                            <button
                                type="button"
                                disabled={
                                    pagination.page >=
                                    pagination.totalPages
                                }
                                onClick={() =>
                                    loadReviews(
                                        pagination.page +
                                            1
                                    )
                                }
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>

                {/* ==================================================
                    RIGHT
                ================================================== */}

                <aside className="product-review-side">
                    {/* ==============================================
                        DISTRIBUTION
                    ============================================== */}

                    <div className="product-review-summary-card">
                        <h3>
                            Phân bố đánh giá
                        </h3>

                        {[5, 4, 3, 2, 1].map(
                            (
                                star
                            ) => {
                                const count =
                                    Number(
                                        summary
                                            .distribution?.[
                                            star
                                        ] ||
                                            0
                                    );

                                const width =
                                    summary.totalReviews >
                                    0
                                        ? Math.round(
                                              (
                                                  count /
                                                  summary.totalReviews
                                              ) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <div
                                        className="product-review-distribution"
                                        key={
                                            star
                                        }
                                    >
                                        <span>
                                            {
                                                star
                                            }

                                            <FaStar />
                                        </span>

                                        <div>
                                            <i
                                                style={{
                                                    width:
                                                        `${width}%`,
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            {
                                                count
                                            }
                                        </strong>
                                    </div>
                                );
                            }
                        )}
                    </div>

                    {/* ==============================================
                        FORM
                    ============================================== */}

                    <div className="product-review-form-card">
                        <h3>
                            {myReview
                                ? "Đánh giá của bạn"
                                : "Viết đánh giá"}
                        </h3>

                        {/* ==========================================
                            NOT LOGIN
                        ========================================== */}

                        {!isAuthenticated && (
                            <div className="product-review-login-note">
                                <p>
                                    Bạn cần đăng nhập để gửi đánh giá.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/login",
                                            {
                                                state: {
                                                    from:
                                                        location,
                                                },
                                            }
                                        )
                                    }
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        )}

                        {/* ==========================================
                            CHECKING
                        ========================================== */}

                        {isAuthenticated &&
                            myReviewLoading && (
                            <div className="product-review-loading compact">
                                <span className="spinner-border spinner-border-sm" />

                                Đang kiểm tra đánh giá...
                            </div>
                        )}

                        {/* ==========================================
                            MY REVIEW
                        ========================================== */}

                        {isAuthenticated &&
                            !myReviewLoading &&
                            myReview &&
                            !editing && (
                            <div className="product-my-review">
                                <div className="product-my-review-top">
                                    <Stars
                                        value={
                                            myReview.rating
                                        }
                                    />

                                    {(() => {
                                        const status =
                                            getReviewStatus(
                                                myReview.status
                                            );

                                        return (
                                            <span
                                                className={`product-review-status ${status.className}`}
                                            >
                                                {
                                                    status.text
                                                }
                                            </span>
                                        );
                                    })()}
                                </div>

                                <p>
                                    {
                                        myReview.comment
                                    }
                                </p>

                                {myReview.order_code && (
                                    <small>
                                        Đơn hàng:{" "}

                                        <strong>
                                            {
                                                myReview.order_code
                                            }
                                        </strong>
                                    </small>
                                )}

                                <div className="product-my-review-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(
                                                true
                                            );

                                            setRating(
                                                Number(
                                                    myReview.rating ||
                                                        5
                                                )
                                            );

                                            setComment(
                                                myReview.comment ||
                                                    ""
                                            );
                                        }}
                                    >
                                        <FaEdit />

                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        className="danger"
                                        onClick={
                                            handleDelete
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        <FaTrash />

                                        Xóa
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ==========================================
                            CREATE / EDIT FORM
                        ========================================== */}

                        {isAuthenticated &&
                            !myReviewLoading &&
                            (
                                !myReview ||
                                editing
                            ) && (
                            <form
                                onSubmit={
                                    myReview
                                        ? handleUpdate
                                        : handleCreate
                                }
                            >
                                {!myReview && (
                                    <div className="product-review-field">
                                        <label>
                                            ID đơn hàng đã giao
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={
                                                orderId
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setOrderId(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Ví dụ: 25"
                                            required
                                        />

                                        <small>
                                            Nhập ID của đơn hàng đã giao có chứa sản phẩm này. Xem tại{" "}

                                            <Link to="/orders">
                                                Đơn hàng của tôi
                                            </Link>
                                            .
                                        </small>
                                    </div>
                                )}

                                {/* ==================================
                                    STAR INPUT
                                ================================== */}

                                <div className="product-review-field">
                                    <label>
                                        Số sao
                                    </label>

                                    <div
                                        className="product-review-star-input"
                                        onMouseLeave={() =>
                                            setHoverRating(
                                                0
                                            )
                                        }
                                    >
                                        {[1, 2, 3, 4, 5].map(
                                            (
                                                star
                                            ) => (
                                                <button
                                                    key={
                                                        star
                                                    }
                                                    type="button"
                                                    onMouseEnter={() =>
                                                        setHoverRating(
                                                            star
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        setHoverRating(
                                                            star
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setHoverRating(
                                                            0
                                                        )
                                                    }
                                                    onClick={() =>
                                                        setRating(
                                                            star
                                                        )
                                                    }
                                                >
                                                    {star <=
                                                    activeStar ? (
                                                        <FaStar />
                                                    ) : (
                                                        <FaRegStar />
                                                    )}
                                                </button>
                                            )
                                        )}

                                        <strong>
                                            {
                                                rating
                                            }
                                            /5
                                        </strong>
                                    </div>
                                </div>

                                {/* ==================================
                                    COMMENT
                                ================================== */}

                                <div className="product-review-field">
                                    <label>
                                        Nội dung
                                    </label>

                                    <textarea
                                        rows="5"
                                        maxLength={
                                            2000
                                        }
                                        value={
                                            comment
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setComment(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                        required
                                    />

                                    <small className="product-review-counter">
                                        {
                                            comment.length
                                        }
                                        /2000
                                    </small>
                                </div>

                                {/* ==================================
                                    ACTIONS
                                ================================== */}

                                <div className="product-review-form-actions">
                                    {myReview &&
                                        editing && (
                                            <button
                                                type="button"
                                                className="secondary"
                                                disabled={
                                                    submitting
                                                }
                                                onClick={() => {
                                                    setEditing(
                                                        false
                                                    );

                                                    setRating(
                                                        Number(
                                                            myReview.rating ||
                                                                5
                                                        )
                                                    );

                                                    setComment(
                                                        myReview.comment ||
                                                            ""
                                                    );
                                                }}
                                            >
                                                Hủy
                                            </button>
                                        )}

                                    <button
                                        type="submit"
                                        className="primary"
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" />

                                                Đang lưu...
                                            </>
                                        ) : myReview ? (
                                            "Cập nhật đánh giá"
                                        ) : (
                                            "Gửi đánh giá"
                                        )}
                                    </button>
                                </div>

                                <p className="product-review-moderation-note">
                                    Đánh giá mới hoặc đánh giá vừa sửa sẽ được đưa về trạng thái chờ duyệt.
                                </p>
                            </form>
                        )}
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default ProductReviews;