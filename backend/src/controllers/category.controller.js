const asyncHandler =
    require("../utils/asyncHandler");

const categoryService =
    require("../services/category.service");

// ============================================================
// GET ALL
// ============================================================

const getCategories =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .getCategories(
                        {
                            search:
                                req.query
                                    .search,

                            status:
                                req.query
                                    .status,
                        }
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    data,
                });
        }
    );

// ============================================================
// DETAIL
// ============================================================

const getCategory =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .getCategoryById(
                        req.params.id
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    data,
                });
        }
    );

// ============================================================
// CREATE
// ============================================================

const createCategory =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .createCategory(
                        req.body
                    );

            return res
                .status(201)
                .json({
                    success:
                        true,

                    message:
                        "Thêm danh mục thành công.",

                    data,
                });
        }
    );

// ============================================================
// UPDATE
// ============================================================

const updateCategory =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .updateCategory(
                        req.params.id,
                        req.body
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Cập nhật danh mục thành công.",

                    data,
                });
        }
    );

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .updateStatus(
                        req.params.id,
                        req.body.status
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Cập nhật trạng thái danh mục thành công.",

                    data,
                });
        }
    );

// ============================================================
// DELETE
// ============================================================

const deleteCategory =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await categoryService
                    .deleteCategory(
                        req.params.id
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Xóa danh mục thành công.",

                    data,
                });
        }
    );

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory,
};