import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaCheckCircle,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaCommentDots,
    FaEyeSlash,
    FaSearch,
    FaStar,
    FaSyncAlt,
    FaTrashAlt,
    FaUserCircle,
} from "react-icons/fa";

import { toast } from "react-toastify";

import axiosClient from "../../api/axiosClient";

import "./AdminReviewsPage.css";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    hidden: "Đã ẩn",
};

const formatDate = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return new Intl.DateTimeFormat(
        "vi-VN",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    ).format(date);
};

const getInitial = (name) => {
    const value = String(
        name || "U"
    ).trim();

    return (
        value.charAt(0).toUpperCase() ||
        "U"
    );
};

function RatingStars({ rating = 0 }) {
    const safeRating =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );

    return (
        <div
            className="review-stars"
            aria-label={`${safeRating}/5 sao`}
        >
            {Array.from(
                {
                    length: 5,
                },
                (_, index) => (
                    <FaStar
                        key={index}
                        className={
                            index < safeRating
                                ? "review-star review-star--active"
                                : "review-star"
                        }
                    />
                )
            )}

            <span>
                {safeRating}/5
            </span>
        </div>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`review-status review-status--${
                status || "pending"
            }`}
        >
            {status === "approved" && (
                <FaCheckCircle />
            )}

            {status === "pending" && (
                <FaClock />
            )}

            {status === "hidden" && (
                <FaEyeSlash />
            )}

            {STATUS_LABELS[
                status
            ] || status}
        </span>
    );
}

function AdminReviewsPage() {
    const [reviews, setReviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(null);

    const [
        searchInput,
        setSearchInput,
    ] = useState("");

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [rating, setRating] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        limit: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });

    const loadReviews =
        useCallback(
            async () => {
                try {
                    setLoading(true);

                    const params = {
                        page,
                        limit:
                            PAGE_SIZE,
                    };

                    if (search) {
                        params.search =
                            search;
                    }

                    if (status) {
                        params.status =
                            status;
                    }

                    if (rating) {
                        params.rating =
                            rating;
                    }

                    const response =
                        await axiosClient.get(
                            "/reviews/admin/all",
                            {
                                params,
                            }
                        );

                    const data =
                        response?.data
                            ?.data || {};

                    const items =
                        Array.isArray(
                            data?.items
                        )
                            ? data.items
                            : [];

                    setReviews(
                        items
                    );

                    setPagination({
                        page:
                            Number(
                                data
                                    ?.pagination
                                    ?.page
                            ) ||
                            page,

                        limit:
                            Number(
                                data
                                    ?.pagination
                                    ?.limit
                            ) ||
                            PAGE_SIZE,

                        totalItems:
                            Number(
                                data
                                    ?.pagination
                                    ?.totalItems
                            ) || 0,

                        totalPages:
                            Math.max(
                                1,
                                Number(
                                    data
                                        ?.pagination
                                        ?.totalPages
                                ) ||
                                    1
                            ),
                    });
                } catch (error) {
                    console.error(
                        error
                    );

                    toast.error(
                        error
                            ?.response
                            ?.data
                            ?.message ||
                            "Không thể tải danh sách đánh giá."
                    );

                    setReviews(
                        []
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                page,
                search,
                status,
                rating,
            ]
        );

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const pageStats =
        useMemo(() => {
            const pending =
                reviews.filter(
                    (item) =>
                        item.status ===
                        "pending"
                ).length;

            const approved =
                reviews.filter(
                    (item) =>
                        item.status ===
                        "approved"
                ).length;

            const hidden =
                reviews.filter(
                    (item) =>
                        item.status ===
                        "hidden"
                ).length;

            return {
                pending,
                approved,
                hidden,
            };
        }, [reviews]);

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        setPage(1);

        setSearch(
            searchInput.trim()
        );
    };

    const handleReset = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setRating("");
        setPage(1);
    };

    const updateStatus =
        async (
            reviewId,
            nextStatus
        ) => {
            try {
                setActionLoading(
                    reviewId
                );

                await axiosClient.patch(
                    `/reviews/admin/${reviewId}/status`,
                    {
                        status:
                            nextStatus,
                    }
                );

                toast.success(
                    nextStatus ===
                        "approved"
                        ? "Đã duyệt đánh giá."
                        : "Đã ẩn đánh giá."
                );

                await loadReviews();
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật đánh giá."
                );
            } finally {
                setActionLoading(
                    null
                );
            }
        };

    const deleteReview =
        async (
            review
        ) => {
            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa đánh giá #${review.id}?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setActionLoading(
                    review.id
                );

                await axiosClient.delete(
                    `/reviews/admin/${review.id}`
                );

                toast.success(
                    "Đã xóa đánh giá."
                );

                if (
                    reviews.length ===
                        1 &&
                    page > 1
                ) {
                    setPage(
                        (current) =>
                            current - 1
                    );

                    return;
                }

                await loadReviews();
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                        "Không thể xóa đánh giá."
                );
            } finally {
                setActionLoading(
                    null
                );
            }
        };

    const startItem =
        pagination.totalItems === 0
            ? 0
            : (page - 1) *
                  PAGE_SIZE +
              1;

    const endItem =
        Math.min(
            page * PAGE_SIZE,
            pagination.totalItems
        );

    return (
        <div className="admin-reviews-page">
            <div className="review-page-header">
                <div>
                    <span className="review-eyebrow">
                        QUẢN TRỊ NỘI
                        DUNG
                    </span>

                    <h1>
                        Quản lý đánh
                        giá
                    </h1>

                    <p>
                        Duyệt, ẩn
                        hoặc xóa
                        đánh giá sản
                        phẩm từ khách
                        hàng.
                    </p>
                </div>

                <button
                    type="button"
                    className="review-refresh-btn"
                    onClick={
                        loadReviews
                    }
                    disabled={
                        loading
                    }
                >
                    <FaSyncAlt
                        className={
                            loading
                                ? "review-spin"
                                : ""
                        }
                    />

                    Làm mới
                </button>
            </div>

            <section className="review-stat-grid">
                <article className="review-stat-card">
                    <div className="review-stat-icon review-stat-icon--total">
                        <FaCommentDots />
                    </div>

                    <div>
                        <span>
                            Tổng đánh
                            giá
                        </span>

                        <strong>
                            {
                                pagination.totalItems
                            }
                        </strong>

                        <small>
                            Toàn bộ kết
                            quả
                        </small>
                    </div>
                </article>

                <article className="review-stat-card">
                    <div className="review-stat-icon review-stat-icon--pending">
                        <FaClock />
                    </div>

                    <div>
                        <span>
                            Chờ duyệt
                        </span>

                        <strong>
                            {
                                pageStats.pending
                            }
                        </strong>

                        <small>
                            Trên trang
                            hiện tại
                        </small>
                    </div>
                </article>

                <article className="review-stat-card">
                    <div className="review-stat-icon review-stat-icon--approved">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>
                            Đã duyệt
                        </span>

                        <strong>
                            {
                                pageStats.approved
                            }
                        </strong>

                        <small>
                            Trên trang
                            hiện tại
                        </small>
                    </div>
                </article>

                <article className="review-stat-card">
                    <div className="review-stat-icon review-stat-icon--hidden">
                        <FaEyeSlash />
                    </div>

                    <div>
                        <span>
                            Đã ẩn
                        </span>

                        <strong>
                            {
                                pageStats.hidden
                            }
                        </strong>

                        <small>
                            Trên trang
                            hiện tại
                        </small>
                    </div>
                </article>
            </section>

            <section className="review-filter-card">
                <form
                    className="review-search-box"
                    onSubmit={
                        handleSearch
                    }
                >
                    <FaSearch />

                    <input
                        type="text"
                        value={
                            searchInput
                        }
                        onChange={(
                            event
                        ) =>
                            setSearchInput(
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder="Tìm người dùng, sản phẩm..."
                    />

                    <button
                        type="submit"
                    >
                        Tìm kiếm
                    </button>
                </form>

                <div className="review-filter-actions">
                    <select
                        value={
                            status
                        }
                        onChange={(
                            event
                        ) => {
                            setStatus(
                                event
                                    .target
                                    .value
                            );

                            setPage(
                                1
                            );
                        }}
                    >
                        <option value="">
                            Tất cả trạng
                            thái
                        </option>

                        <option value="pending">
                            Chờ duyệt
                        </option>

                        <option value="approved">
                            Đã duyệt
                        </option>

                        <option value="hidden">
                            Đã ẩn
                        </option>
                    </select>

                    <select
                        value={
                            rating
                        }
                        onChange={(
                            event
                        ) => {
                            setRating(
                                event
                                    .target
                                    .value
                            );

                            setPage(
                                1
                            );
                        }}
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

                    <button
                        type="button"
                        className="review-reset-btn"
                        onClick={
                            handleReset
                        }
                    >
                        <FaSyncAlt />
                        Đặt lại
                    </button>
                </div>
            </section>

            <section className="review-table-card">
                <div className="review-table-header">
                    <div>
                        <h2>
                            Danh sách
                            đánh giá
                        </h2>

                        <p>
                            Hiển thị{" "}
                            {
                                startItem
                            }{" "}
                            -{" "}
                            {
                                endItem
                            }{" "}
                            trên{" "}
                            {
                                pagination.totalItems
                            }{" "}
                            đánh giá
                        </p>
                    </div>
                </div>

                <div className="review-table-wrapper">
                    <table className="review-table">
                        <thead>
                            <tr>
                                <th>
                                    ID
                                </th>

                                <th>
                                    Khách
                                    hàng
                                </th>

                                <th>
                                    Sản
                                    phẩm
                                </th>

                                <th>
                                    Đánh
                                    giá
                                </th>

                                <th>
                                    Nội
                                    dung
                                </th>

                                <th>
                                    Trạng
                                    thái
                                </th>

                                <th>
                                    Ngày
                                    tạo
                                </th>

                                <th className="review-actions-heading">
                                    Thao
                                    tác
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="review-state-cell"
                                    >
                                        <div className="review-loading">
                                            <span />
                                            <p>
                                                Đang
                                                tải
                                                đánh
                                                giá...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : reviews.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="review-state-cell"
                                    >
                                        <div className="review-empty">
                                            <FaCommentDots />

                                            <h3>
                                                Chưa
                                                có
                                                đánh
                                                giá
                                            </h3>

                                            <p>
                                                Không
                                                tìm
                                                thấy
                                                đánh
                                                giá
                                                phù
                                                hợp
                                                với
                                                bộ
                                                lọc.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(
                                    (
                                        review
                                    ) => (
                                        <tr
                                            key={
                                                review.id
                                            }
                                        >
                                            <td>
                                                <span className="review-id">
                                                    #
                                                    {
                                                        review.id
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <div className="review-user-cell">
                                                    <div className="review-avatar">
                                                        {getInitial(
                                                            review.userName
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {review.userName ||
                                                                "Khách hàng"}
                                                        </strong>

                                                        <span>
                                                            {review.userEmail ||
                                                                `User ID: ${review.user_id}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="review-product-cell">
                                                    <strong>
                                                        {review.productName ||
                                                            `Sản phẩm #${review.product_id}`}
                                                    </strong>

                                                    <span>
                                                        {review.order_code
                                                            ? `Đơn: ${review.order_code}`
                                                            : `Order #${review.order_id}`}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <RatingStars
                                                    rating={
                                                        review.rating
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <p className="review-comment">
                                                    {review.comment ||
                                                        "Không có nội dung."}
                                                </p>
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={
                                                        review.status
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <span className="review-date">
                                                    {formatDate(
                                                        review.created_at
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="review-row-actions">
                                                    {review.status !==
                                                        "approved" && (
                                                        <button
                                                            type="button"
                                                            className="review-action-btn review-action-btn--approve"
                                                            title="Duyệt đánh giá"
                                                            disabled={
                                                                actionLoading ===
                                                                review.id
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    review.id,
                                                                    "approved"
                                                                )
                                                            }
                                                        >
                                                            <FaCheckCircle />
                                                        </button>
                                                    )}

                                                    {review.status !==
                                                        "hidden" && (
                                                        <button
                                                            type="button"
                                                            className="review-action-btn review-action-btn--hide"
                                                            title="Ẩn đánh giá"
                                                            disabled={
                                                                actionLoading ===
                                                                review.id
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    review.id,
                                                                    "hidden"
                                                                )
                                                            }
                                                        >
                                                            <FaEyeSlash />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="review-action-btn review-action-btn--delete"
                                                        title="Xóa đánh giá"
                                                        disabled={
                                                            actionLoading ===
                                                            review.id
                                                        }
                                                        onClick={() =>
                                                            deleteReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="review-pagination">
                    <span>
                        Trang{" "}
                        <strong>
                            {page}
                        </strong>{" "}
                        /{" "}
                        <strong>
                            {
                                pagination.totalPages
                            }
                        </strong>
                    </span>

                    <div>
                        <button
                            type="button"
                            disabled={
                                page <=
                                    1 ||
                                loading
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        Math.max(
                                            1,
                                            current -
                                                1
                                        )
                                )
                            }
                        >
                            <FaChevronLeft />
                            Trước
                        </button>

                        <button
                            type="button"
                            disabled={
                                page >=
                                    pagination.totalPages ||
                                loading
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        Math.min(
                                            pagination.totalPages,
                                            current +
                                                1
                                        )
                                )
                            }
                        >
                            Sau
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminReviewsPage;