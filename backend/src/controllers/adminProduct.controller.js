const asyncHandler =
    require(
        "../utils/asyncHandler"
    );

const AdminProductService =
    require(
        "../services/adminProduct.service"
    );

// ============================================================
// LIST
// ============================================================

exports.getProducts =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await AdminProductService
                    .getProducts({
                        search:
                            req.query.search ||
                            null,

                        status:
                            req.query.status ||
                            null,

                        categoryId:
                            req.query.categoryId
                                ? Number(
                                      req.query.categoryId
                                  )
                                : null,

                        brandId:
                            req.query.brandId
                                ? Number(
                                      req.query.brandId
                                  )
                                : null,

                        limit:
                            req.query.limit
                                ? Number(
                                      req.query.limit
                                  )
                                : 100,
                    });

            return res
                .status(200)
                .json({
                    success: true,
                    data,
                });
        }
    );

// ============================================================
// DETAIL
// ============================================================

exports.getProductDetail =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await AdminProductService
                    .getProductDetail(
                        Number(
                            req.params.id
                        )
                    );

            return res
                .status(200)
                .json({
                    success: true,
                    data,
                });
        }
    );

// ============================================================
// CREATE
// ============================================================

exports.createProduct =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await AdminProductService
                    .createProduct(
                        req.body
                    );

            return res
                .status(201)
                .json({
                    success: true,

                    message:
                        "Thêm sản phẩm thành công",

                    data,
                });
        }
    );

// ============================================================
// UPDATE
// ============================================================

exports.updateProduct =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await AdminProductService
                    .updateProduct(
                        Number(
                            req.params.id
                        ),
                        req.body
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Cập nhật sản phẩm thành công",

                    data,
                });
        }
    );

// ============================================================
// STATUS
// ============================================================

exports.updateStatus =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await AdminProductService
                    .updateStatus(
                        Number(
                            req.params.id
                        ),
                        req.body.status
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Cập nhật trạng thái sản phẩm thành công",

                    data,
                });
        }
    );