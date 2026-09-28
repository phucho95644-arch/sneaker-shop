const asyncHandler =
    require(
        "../utils/asyncHandler"
    );

const brandService =
    require(
        "../services/adminBrand.service"
    );

// ============================================================
// LIST
// ============================================================

const getBrands =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await brandService
                    .getBrands({
                        search:
                            req.query
                                .search,

                        status:
                            req.query
                                .status,
                    });

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

const getBrand =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await brandService
                    .getBrandById(
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

const createBrand =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await brandService
                    .createBrand(
                        req.body
                    );

            return res
                .status(201)
                .json({
                    success:
                        true,

                    message:
                        "Thêm thương hiệu thành công.",

                    data,
                });
        }
    );

// ============================================================
// UPDATE
// ============================================================

const updateBrand =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await brandService
                    .updateBrand(
                        req.params.id,
                        req.body
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Cập nhật thương hiệu thành công.",

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
                await brandService
                    .updateStatus(
                        req.params.id,
                        req.body
                            .status
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Cập nhật trạng thái thương hiệu thành công.",

                    data,
                });
        }
    );

// ============================================================
// DELETE
// ============================================================

const deleteBrand =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await brandService
                    .deleteBrand(
                        req.params.id
                    );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    message:
                        "Xóa thương hiệu thành công.",

                    data,
                });
        }
    );

module.exports = {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    updateStatus,
    deleteBrand,
};